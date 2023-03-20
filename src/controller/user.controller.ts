import { Request, Response } from 'express';
import {
  CreateUserInput,
  ForgotPasswordInput,
  VerifyUserInput,
} from '../schema/user.schema';
import {
  createUser,
  findUserByEmail,
  findUserById,
} from '../service/user.service';

import sendEmail from '../utils/mailer';
import log from '../utils/logger';
import { nanoid } from 'nanoid';
import { ResetPasswordInput } from '../schema/user.schema';

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  const body = req.body;

  try {
    const user = await createUser(body);
    await sendEmail({
      from: 'test@example.com',
      to: user.email,
      subject: 'Please verify your account',
      text: `verification code: ${user.verificationCode}. Id: ${user._id}`,
    });

    return res.send('User successfully created');
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).send('User already exists');
    }

    return res.status(500).send(`Something went wrong${error}`);
  }
}

export async function verifyUserHandler(
  req: Request<VerifyUserInput>,
  res: Response
) {
  const { id, verificationCode } = req.params;

  try {
    const user = await findUserById(id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user.verified) {
      return res.status(400).send('User already verified');
    }

    if (user.verificationCode === verificationCode) {
      user.verified = true;
      await user.save();

      return res.send('User successfully verified');
    }

    return res.send('Could not verify user');
  } catch (error: any) {
    return res.status(500).send(`Something went wrong${error}`);
  }
}

export async function forgotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response
) {
  const { email } = req.body;

  const user = await findUserByEmail(email);
  const message =
    'if the user with that email is registered you will receive an email with instructions';

  if (!user) {
    log.debug(`User with email ${email} does not exist`);

    return res.send(message);
  }

  if (!user.verified) {
    return res.send('User is not verified');
  }

  const passwordResetCode = nanoid();

  user.passwordResetCode = passwordResetCode;

  await user.save();

  await sendEmail({
    to: user.email,
    from: 'test@example.com',
    subject: 'Reset your password',
    text: `Your password reset code is ${passwordResetCode}. Id ${user._id}`,
  });

  log.debug(`Password reset email sent to ${user.email}`);

  return res.send(message);
}

export async function resetPasswordHandler(
  req: Request<
    ResetPasswordInput['params'],
    {},
    ResetPasswordInput['body']
  >,
  res: Response
) {
  const { id, passwordResetCode } = req.params;

  const { password } = req.body;

  const user = await findUserById(id);

  if (
    !user ||
    !user.passwordResetCode ||
    user.passwordResetCode !== passwordResetCode
  ) {
    return res.status(400).send('Could not reset user password');
  }

  user.passwordResetCode = null;

  user.password = password;

  await user.save();

  return res.send('Password successfully reset');
}

export async function getCurrentUserHandler(
  req: Request,
  res: Response
) {
  return res.send(res.locals.user);
}
