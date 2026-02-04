const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('slack-token-manager');

/**
 * Gerenciador simples de token do Slack
 */
class SlackTokenManager {
  constructor() {
    this.currentToken = process.env.SLACK_BOT_TOKEN;
    
    this.init();
  }

  init() {
    const span = tracer.startSpan('slack_token_manager_init');
    
    try {
      if (!this.currentToken) {
        console.warn('⚠️  SLACK_BOT_TOKEN não configurado');
        span.addEvent('No token configured');
      } else {
        console.log('✅ Token do Slack configurado');
        span.addEvent('Token configured');
      }
    } catch (error) {
      span.recordException(error);
      console.error('❌ Erro ao inicializar token manager:', error.message);
    } finally {
      span.end();
    }
  }

  /**
   * Obter token atual
   * @returns {string|null}
   */
  getToken() {
    return this.currentToken;
  }

  /**
   * Setar token manualmente
   * @param {string} token
   */
  setToken(token) {
    this.currentToken = token;
    console.log('✅ Token do Slack atualizado manualmente');
  }

  /**
   * Obter status do token
   * @returns {object}
   */
  getTokenStatus() {
    return {
      hasToken: !!this.currentToken
    };
  }
}

module.exports = new SlackTokenManager();
