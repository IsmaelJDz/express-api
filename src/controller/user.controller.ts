import { Request, Response } from 'express';
import {
  CreateUserInput,
  VerifyUserInput,
} from '../schema/user.schema';
import { createUser, findUserById } from '../service/user.service';

import sendEmail from '../utils/mailer';

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
