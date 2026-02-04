// src/services/messageService.js
const rabbitmqClient = require('../config/rabbitmq');

class MessageService {
  
  // Publicar evento de serviço criado
  async publishServiceCreated(serviceData) {
    await rabbitmqClient.publishMessage(
      rabbitmqClient.queues.SERVICE_CREATED,
      {
        event: 'service_created',
        serviceId: serviceData.id,
        serviceName: serviceData.name,
        createdBy: serviceData.userId,
        createdAt: serviceData.createdAt
      }
    );
  }

  // Publicar evento de usuário registrado
  async publishUserRegistered(userData) {
    await rabbitmqClient.publishMessage(
      rabbitmqClient.queues.USER_REGISTERED,
      {
        event: 'user_registered',
        userId: userData.id,
        userName: userData.name,
        userEmail: userData.email,
        registeredAt: userData.createdAt
      }
    );
  }

  // Enviar notificação
  async sendNotification(notificationData) {
    await rabbitmqClient.publishMessage(
      rabbitmqClient.queues.NOTIFICATION,
      {
        event: 'send_notification',
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        metadata: notificationData.metadata || {}
      }
    );
  }

  
}

module.exports = new MessageService();