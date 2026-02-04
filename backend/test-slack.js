#!/usr/bin/env node

/**
 * Script de teste para Slack integration
 * 
 * Uso:
 * node test-slack.js --message "Teste" --channel "#notifications"
 * node test-slack.js --notification --title "Bug" --message "Erro no sistema"
 * node test-slack.js --status
 */

require('dotenv').config();
const tokenManager = require('./src/config/slack-token-manager');
const slackClient = require('./src/config/slack');

const args = process.argv.slice(2);

async function parseArgs() {
  const parsed = {
    command: null,
    channel: process.env.SLACK_CHANNEL || '#notifications',
    message: null,
    title: null,
    type: 'info'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--status') {
      parsed.command = 'status';
    } else if (arg === '--message' && args[i + 1]) {
      parsed.command = 'message';
      parsed.message = args[++i];
    } else if (arg === '--notification') {
      parsed.command = 'notification';
    } else if (arg === '--title' && args[i + 1]) {
      parsed.title = args[++i];
    } else if (arg === '--channel' && args[i + 1]) {
      parsed.channel = args[++i];
    } else if (arg === '--type' && args[i + 1]) {
      parsed.type = args[++i];
    }
  }

  return parsed;
}

async function showStatus() {
  console.log('\n📊 Status do Slack Integration:\n');
  
  const tokenStatus = tokenManager.getTokenStatus();
  console.log('Token Manager:');
  console.log(`  Has Token: ${tokenStatus.hasToken ? '✅ Sim' : '❌ Não'}`);
  
  console.log('\nSlack Client:');
  console.log(`  Configured: ${slackClient.isConfigured() ? '✅ Sim' : '❌ Não'}`);
  console.log(`  Default Channel: ${slackClient.defaultChannel}`);
  
  console.log('\n');
}

async function sendMessage(text, channel) {
  console.log(`\n📨 Enviando mensagem simples para ${channel}...`);
  
  try {
    if (!slackClient.isConfigured()) {
      console.error('❌ Slack não está configurado. Configure SLACK_BOT_TOKEN no .env');
      process.exit(1);
    }

    const result = await slackClient.sendMessage(text, channel);
    console.log('✅ Mensagem enviada com sucesso!');
    console.log(`   Channel: ${result.channel}`);
    console.log(`   Timestamp: ${result.ts}`);
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error.message);
    process.exit(1);
  }
}

async function sendNotification(title, message, channel, type = 'info') {
  console.log(`\n📬 Enviando notificação para ${channel}...`);
  
  try {
    if (!slackClient.isConfigured()) {
      console.error('❌ Slack não está configurado. Configure SLACK_BOT_TOKEN no .env');
      process.exit(1);
    }

    const notification = {
      title: title || 'Notificação de Teste',
      message: message || 'Esta é uma mensagem de teste',
      type: type,
      userId: 'test-user',
      metadata: {
        timestamp: new Date().toISOString(),
        testMode: true
      }
    };

    const result = await slackClient.sendNotification(notification, channel);
    console.log('✅ Notificação enviada com sucesso!');
    console.log(`   Channel: ${result.channel}`);
    console.log(`   Timestamp: ${result.ts}`);
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error.message);
    process.exit(1);
  }
}

async function main() {
  const options = await parseArgs();

  console.log('═══════════════════════════════════════════');
  console.log('   Slack Integration Test Script');
  console.log('═══════════════════════════════════════════');

  try {
    switch (options.command) {
      case 'status':
        await showStatus();
        break;
      
      case 'message':
        if (!options.message) {
          console.error('❌ Erro: --message requer um texto\n');
          console.log('Uso: node test-slack.js --message "Seu texto" [--channel "#canal"]');
          process.exit(1);
        }
        await sendMessage(options.message, options.channel);
        break;
      
      case 'notification':
        await sendNotification(
          options.title,
          options.message,
          options.channel,
          options.type
        );
        break;
      
      default:
        console.log('Comandos disponíveis:\n');
        console.log('  node test-slack.js --status');
        console.log('    Mostrar status atual da integração Slack\n');
        
        console.log('  node test-slack.js --message "Texto" [--channel "#canal"]');
        console.log('    Enviar mensagem simples\n');
        
        console.log('  node test-slack.js --notification [--title "Titulo"] [--message "Mensagem"] [--type info|success|warning|error]');
        console.log('    Enviar notificação formatada\n');
        
        console.log('Exemplos:');
        console.log('  node test-slack.js --status');
        console.log('  node test-slack.js --message "Olá mundo"');
        console.log('  node test-slack.js --message "Alerta" --channel "#alerts"');
        console.log('  node test-slack.js --notification --title "Erro" --message "Falha crítica" --type error\n');
    }
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

main();
