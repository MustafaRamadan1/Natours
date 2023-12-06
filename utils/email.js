const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const { EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT } =
    process.env;

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
      user: EMAIL_USERNAME,
      pass: EMAIL_PASSWORD,
    },
  });

  const mailOption = {
    from: 'Mustafa Ramadan <mustafa@Natours.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
   
  };

  await transporter.sendMail(mailOption);
};

module.exports = sendEmail;
