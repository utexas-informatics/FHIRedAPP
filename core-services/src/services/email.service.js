const nodemailer = require('nodemailer');
var logger = require('../config/logger');

var sendEmail = async function (req, res) {
  logger.info(`email : service : sendEmail : received request`);
  try {
    const { from, to, subject, html, replyTo, bcc } = req.body;

    // Create the SMTP transport.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASS,
      },
    });

    // Specify the fields in the email.
    const mailOptions = {
      from,
      to,
      bcc,
      replyTo,
      subject,
      html,
    };

    // Send the email.
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent! Message ID: ', info.messageId);
    logger.info(`email : service : sendEmail : error sending email`);
    return info.messageId;
  } catch (e) {
    logger.error(`email : service : sendEmail : Error : ${e}`);
    throw e;
  }
};

module.exports.sendEmail = sendEmail;
