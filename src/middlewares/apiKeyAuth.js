const httpStatus = require('http-status');

const { env } = require('../config');

const authApiKey = () => (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      code: httpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
    });
  }

  const listApiKey = env.apiKey.split(',').map((key) => key.trim());

  if (!listApiKey.includes(apiKey)) {
    return res.status(httpStatus.FORBIDDEN).json({
      code: httpStatus.FORBIDDEN,
      message: 'Forbidden',
    });
  }

  return next();
};

module.exports = authApiKey;
