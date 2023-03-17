import nodemailer, { SendMailOptions } from 'nodemailer';
import config from 'config';
import log from './logger';

export async function createTestCreds() {
  const creds = await nodemailer.createTestAccount();

  console.log('Test account created: %s', creds.user);
  console.log({ creds });
}

const smtp = config.get<{
  user: string;
  pass: string;
  host: string;
  port: number;
  secure: boolean;
}>('smtp');

const transporter = nodemailer.createTransport({
  ...smtp,
  auth: {
    user: smtp.user,
    pass: smtp.pass,
  },
});

async function sendEmail(payload: SendMailOptions) {
  transporter.sendMail(payload, (err, info) => {
    if (err) {
      log.error(err, "Couldn't send email");
      return;
    }

    log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  });
}

export default sendEmail;
