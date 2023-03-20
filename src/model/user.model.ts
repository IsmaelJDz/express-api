import {
  DocumentType,
  Severity,
  getModelForClass,
  index,
  modelOptions,
  pre,
  prop,
} from '@typegoose/typegoose';
import { nanoid } from 'nanoid';
import argon2d from 'argon2';
import log from '../utils/logger';

@pre<User>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const hash = await argon2d.hash(this.password);

  this.password = hash;
  return;
})
@index({ email: 1 })
@modelOptions({
  schemaOptions: { timestamps: true },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class User {
  @prop({ required: true, lowercase: true, unique: true })
  email: string;

  @prop({ required: true })
  firstName: string;

  @prop({ required: true })
  lastName: string;

  @prop({ required: true })
  password: string;

  @prop({ required: true, default: () => nanoid() })
  verificationCode: string;

  @prop()
  passwordResetCode: string | null;

  @prop({ default: false })
  verified: boolean;

  async validatePassword(
    this: DocumentType<User>,
    candidatePassword: string
  ) {
    try {
      return await argon2d.verify(this.password, candidatePassword);
    } catch (error) {
      log.error(error, 'Error validating password');
      return false;
    }
  }
}

const UserModel = getModelForClass(User);
export default UserModel;
