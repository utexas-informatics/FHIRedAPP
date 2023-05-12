var express = require('express');
const { validate, Joi } = require('express-validation');

var router = express.Router();
var evcController = require('../controllers/email-verification-code.controller');

const validationSchema = {
  verify: {
    headers: Joi.object({
      authorization: Joi.string()
    }).unknown(),
    body: Joi.object({
      code: Joi.string().required(),
      email: Joi.string().required(),
    }).required(),
  },
};

router.put(
  '/verify',
  validate(validationSchema.verify, {}, {}),
  evcController.verify
);

module.exports = router;
