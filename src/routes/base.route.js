const express = require('express');
const httpStatus = require('http-status');

const { mailService } = require('../services');
const { authApiKey } = require('../middlewares');

const baseRoute = express.Router();

baseRoute.get('/', (req, res) => {
  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    message: 'Service mailer is running',
  });
});

baseRoute.post('/send-mail', authApiKey(), async (req, res, next) => {
  try {
    const { emailData, type } = req.body;

    if (!emailData || !type) {
      return res.status(httpStatus.BAD_REQUEST).json({
        code: httpStatus.BAD_REQUEST,
        message: 'Missing emailData or type in request body',
      });
    }

    await mailService.sendEmailWithTemplate(emailData, type);

    res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Send mail success',
    });
  } catch (error) {
    next(error);
  }
});

baseRoute.all('*', (req, res) => {
  res.status(httpStatus.NOT_FOUND).json({
    code: httpStatus.NOT_FOUND,
    message: 'Not found',
  });
});

module.exports = baseRoute;
