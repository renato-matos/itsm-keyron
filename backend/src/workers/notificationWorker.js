// src/workers/notificationWorker.js
const rabbitmqClient = require('../config/rabbitmq');
const slackClient = require('../config/slack');
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('notification-worker');

class NotificationWorker {
  async start() {
    console.log('Iniciando Notification Worker...');
    
    await rabbitmqClient.consumeMessages(
      rabbitmqClient.queues.NOTIFICATION,
      this.processNotification.bind(this)
    );
  }

  async processNotification(message) {
    const span = tracer.startSpan('process_notification');
    
    try {
      span.setAttributes({
        'notification.type': message.type,
        'notification.userId': message.userId,
        'worker.name': 'notification-worker'
      });

      console.log('Processando notificação:', {
        userId: message.userId,
        type: message.type,
        title: message.title
      });
      
      // Envio de notificação via Slack
      await this.sendSlackNotification(message);
      
      span.addEvent('Notification processed successfully');
      console.log(`Notificação enviada para usuário ${message.userId}`);
      
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  async sendSlackNotification(message) {
    const span = tracer.startSpan('send_slack_notification');

    try {
      // Verificar se Slack está configurado
      if (!slackClient.isConfigured()) {
        console.log('⚠️  Slack não configurado. Notificação não será enviada.');
        span.addEvent('Slack not configured');
        return;
      }

      span.setAttributes({
        'notification.type': message.type,
        'notification.user_id': message.userId,
        'notification.title': message.title
      });

      // Preparar dados da notificação
      const notificationData = {
        title: message.title || 'Notificação do Sistema',
        message: message.message || 'Você tem uma nova notificação',
        type: message.type || 'info',
        userId: message.userId,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'notification-worker',
          ...(message.metadata || {})
        }
      };

      // Enviar para Slack
      await slackClient.sendNotification(notificationData, message.channel);

      span.addEvent('Slack notification sent successfully');
      console.log(`✅ Notificação Slack enviada para usuário ${message.userId}`);

    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      console.error('❌ Erro ao enviar notificação Slack:', error.message);
      // Não lançar erro para evitar que a mensagem seja rejeitada
    } finally {
      span.end();
    }
  }

}

module.exports = new NotificationWorker();