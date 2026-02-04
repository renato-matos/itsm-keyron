const { WebClient } = require('@slack/web-api');
const { trace } = require('@opentelemetry/api');
const tokenManager = require('./slack-token-manager');

const tracer = trace.getTracer('slack-client');

class SlackClient {
  constructor() {
    this.client = null;
    this.defaultChannel = process.env.SLACK_CHANNEL || '#notifications';
    this.tokenManager = tokenManager;
    this.init();
  }

  init() {
    const slackToken = this.tokenManager.getToken();
    
    if (!slackToken) {
      console.warn('⚠️  SLACK_BOT_TOKEN não configurado. Slack notifications desabilitadas.');
      return;
    }

    try {
      this.client = new WebClient(slackToken);
      console.log('✅ Slack client inicializado com token manager');
    } catch (error) {
      console.error('❌ Erro ao inicializar Slack client:', error.message);
    }
  }

  /**
   * Envia uma mensagem simples para um canal do Slack
   * @param {string} text - Texto da mensagem
   * @param {string} channel - Canal do Slack (padrão: #notifications)
   * @param {object} options - Opções adicionais (username, icon_emoji, etc)
   * @returns {Promise<object>} Resposta da API do Slack
   */
  async sendMessage(text, channel = this.defaultChannel, options = {}) {
    const span = tracer.startSpan('slack_send_message');

    try {
      if (!this.client) {
        console.warn('⚠️  Slack client não configurado. Mensagem não enviada.');
        span.addEvent('Slack client not configured');
        return null;
      }

      span.setAttributes({
        'slack.channel': channel,
        'slack.text_length': text.length,
        ...options
      });

      const message = {
        channel,
        text,
        ...options
      };

      const result = await this.client.chat.postMessage(message);

      span.addEvent('Message sent successfully', {
        'slack.message_ts': result.ts,
        'slack.channel_id': result.channel
      });

      console.log('✅ Mensagem enviada ao Slack:', { channel, ts: result.ts });

      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      console.error('❌ Erro ao enviar mensagem ao Slack:', error.message);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Envia uma mensagem formatada com blocos (rich messages) para o Slack
   * @param {array} blocks - Blocos de conteúdo do Slack (markdown, seções, etc)
   * @param {string} channel - Canal do Slack
   * @param {object} options - Opções adicionais
   * @returns {Promise<object>} Resposta da API do Slack
   */
  async sendBlockMessage(blocks, channel = this.defaultChannel, options = {}) {
    const span = tracer.startSpan('slack_send_block_message');

    try {
      if (!this.client) {
        console.warn('⚠️  Slack client não configurado. Mensagem não enviada.');
        return null;
      }

      span.setAttributes({
        'slack.channel': channel,
        'slack.blocks_count': blocks.length
      });

      const message = {
        channel,
        blocks,
        ...options
      };

      const result = await this.client.chat.postMessage(message);

      span.addEvent('Block message sent successfully', {
        'slack.message_ts': result.ts
      });

      console.log('✅ Mensagem com blocos enviada ao Slack:', { channel, ts: result.ts });

      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      console.error('❌ Erro ao enviar mensagem com blocos ao Slack:', error.message);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Envia uma notificação formatada como texto simples
   * Usa apenas sendMessage para evitar problemas de permissão
   * @param {object} notification - Objeto com dados da notificação (title, message, type, etc)
   * @param {string} channel - Canal do Slack
   * @returns {Promise<object>} Resposta da API do Slack
   */
  async sendNotification(notification, channel = this.defaultChannel) {
    const span = tracer.startSpan('slack_send_notification');

    try {
      if (!this.client) {
        console.warn('⚠️  Slack client não configurado. Notificação não enviada.');
        span.addEvent('Slack client not configured');
        return null;
      }

      const { title, message, type, userId, metadata = {} } = notification;

      // Mapear emoji por tipo de notificação
      const emojiMap = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️',
        default: '📌'
      };

      const emoji = emojiMap[type] || emojiMap.default;
      const typeLabel = (type || 'info').toUpperCase();

      span.setAttributes({
        'slack.channel': channel,
        'notification.type': type,
        'notification.user_id': userId,
        'notification.title': title
      });

      // Construir texto simples formatado
      let text = `${emoji} [${typeLabel}] ${title || 'Notificação'}\n\n${message || 'Você tem uma nova notificação'}`;
      
      // Adicionar metadata se existir
      if (Object.keys(metadata).length > 0) {
        text += '\n\n_Detalhes adicionais:_\n';
        Object.entries(metadata).forEach(([key, value]) => {
          text += `• ${key}: ${value}\n`;
        });
      }

      if (userId) {
        text += `\n_Usuário: <@${userId}>_`;
      }

      // Enviar usando sendMessage simples (sem attachments)
      const result = await this.sendMessage(text, channel);

      span.addEvent('Notification sent successfully', {
        'slack.message_ts': result?.ts
      });

      console.log('✅ Notificação enviada ao Slack:', {
        channel,
        type,
        ts: result?.ts
      });

      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2, message: error.message });
      console.error('❌ Erro ao enviar notificação ao Slack:', error.message);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Verifica se o Slack está configurado
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.client;
  }
}

module.exports = new SlackClient();
