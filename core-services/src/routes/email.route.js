var express = require('express');
const { validate, Joi } = require('express-validation');

var router = express.Router();
var emailController = require('../controllers/email.controller');

const validationSchema = {
  sendEmail: {
    headers: Joi.object({
      authorization: Joi.string(),
    }).unknown(),
    body: Joi.object({
      system: Joi.string().required(),
      from: Joi.string().required(),
      to: Joi.array().items(Joi.string().optional()).min(1),
      bcc: Joi.array().items(Joi.string().optional()).min(1),
      replyTo: Joi.string().required(),
      subject: Joi.string().required(),
      text: Joi.string(),
      html: Joi.string(),
    }).required(),
  },
};

router.post(
  '/',
  validate(validationSchema.sendEmail, {}, {}),
  emailController.sendEmail
);

module.exports = router;
