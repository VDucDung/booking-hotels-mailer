const express = require('express');

const { env } = require('./config');
const { baseRoute } = require('./routes');
const { mailService, rabbitmqService } = require('./services');

const app = express();

app.use(express.json());

app.use('/', baseRoute);

rabbitmqService.resolveQueue(env.queue_types.email_queue, async (data) => {
  await mailService.sendEmailWithTemplate(data);
});

app.listen(env.port, () => {
  console.log(`Service running on port ${env.port}`);
});
