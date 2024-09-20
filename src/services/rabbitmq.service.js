const amqp = require('amqplib');
const { rabbitmq } = require('../config');

class RabbitMQService {
  channel;
  connection;

  async createChannel() {
    try {
      this.connection = await amqp.connect(rabbitmq.uri);
      this.channel = await this.connection.createChannel();

      this.connection.on('error', (error) => {
        console.error('Connection error:', error);
        this.connection = null;
        this.channel = null;
      });

      this.channel.on('error', (error) => {
        console.error('Channel error:', error);
        this.channel = null;
      });

      this.connection.on('close', () => {
        console.warn('Connection closed. Reconnecting...');
        this.connection = null;
        this.channel = null;
        this.reconnect();
      });

      this.channel.on('close', () => {
        console.warn('Channel closed. Reconnecting...');
        this.channel = null;
        this.reconnect();
      });
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  }

  async reconnect() {
    try {
      await this.createChannel();
    } catch (error) {
      console.error('Reconnection failed:', error);
      setTimeout(() => this.reconnect(), 5000);
    }
  }

  async resolveQueue(queueName, func) {
    if (!this.channel) {
      await this.createChannel();
    }

    try {
      await this.channel.assertQueue(queueName, { durable: true });

      this.channel.consume(
        queueName,
        async (message) => {
          try {
            const data = JSON.parse(message.content.toString());
            await func({ ...data, queueName });
            this.channel.ack(message);
          } catch (processingError) {
            console.error('Error processing message:', processingError);
            this.channel.nack(message);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      console.error('Error resolving queue:', error);
    }
  }
}

module.exports = new RabbitMQService();
