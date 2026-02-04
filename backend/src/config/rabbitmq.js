// src/config/rabbitmq.js
const amqp = require('amqplib');
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('rabbitmq-client');

class RabbitMQClient {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queues = {
      SERVICE_CREATED: 'service.created',
      USER_REGISTERED: 'user.registered',
      NOTIFICATION: 'notification.send',
      REPORT_GENERATION: 'report.generate'
    };
  }

  async connect() {
    const span = tracer.startSpan('rabbitmq_connect');
    
    try {
      // Construir URL do RabbitMQ com credenciais se fornecidas
      let rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      const rabbitmqUser = process.env.RABBITMQ_USER || 'guest';
      const rabbitmqPassword = process.env.RABBITMQ_PASSWORD || 'guest';
      
      // Se a URL não contém credenciais, adicionar
      if (!rabbitmqUrl.includes('@')) {
        // Substituir amqp:// por amqp://user:password@
        rabbitmqUrl = rabbitmqUrl.replace('amqp://', `amqp://${rabbitmqUser}:${rabbitmqPassword}@`);
      }
      
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Declarar todas as filas
      for (const queue of Object.values(this.queues)) {
        await this.channel.assertQueue(queue, { durable: true });
      }
      
      console.log('RabbitMQ conectado e filas declaradas');
      span.setStatus({ code: 1 });
    } catch (error) {
      console.error('Erro ao conectar RabbitMQ:', error);
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  async publishMessage(queue, message, options = {}) {
    const span = tracer.startSpan('rabbitmq_publish');
    
    try {
      if (!this.channel) {
        await this.connect();
      }

      const messageBuffer = Buffer.from(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
        messageId: this.generateMessageId()
      }));

      span.setAttributes({
        'messaging.system': 'rabbitmq',
        'messaging.destination': queue,
        'messaging.operation': 'publish',
        'messaging.message_id': message.messageId
      });

      await this.channel.sendToQueue(queue, messageBuffer, {
        persistent: true,
        ...options
      });

      span.addEvent('Message published successfully');
      console.log(`Mensagem enviada para fila ${queue}:`, message);
      
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      console.error('Erro ao publicar mensagem:', error);
      throw error;
    } finally {
      span.end();
    }
  }

  async consumeMessages(queue, callback, options = {}) {
    const span = tracer.startSpan('rabbitmq_consume_setup');
    
    try {
      if (!this.channel) {
        await this.connect();
      }

      await this.channel.consume(queue, async (msg) => {
        const processSpan = tracer.startSpan('rabbitmq_message_process');
        
        try {
          if (msg) {
            const content = JSON.parse(msg.content.toString());
            
            processSpan.setAttributes({
              'messaging.system': 'rabbitmq',
              'messaging.destination': queue,
              'messaging.operation': 'process',
              'messaging.message_id': content.messageId
            });

            console.log(`Processando mensagem da fila ${queue}:`, content);
            
            await callback(content);
            
            this.channel.ack(msg);
            processSpan.addEvent('Message processed successfully');
          }
        } catch (error) {
          processSpan.recordException(error);
          processSpan.setStatus({ code: 2, message: error.message });
          console.error('Erro ao processar mensagem:', error);
          
          // Rejeitar mensagem e enviar para DLQ se configurado
          this.channel.nack(msg, false, false);
        } finally {
          processSpan.end();
        }
      }, {
        noAck: false,
        ...options
      });

      console.log(`Consumidor iniciado para fila: ${queue}`);
      
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

module.exports = new RabbitMQClient();