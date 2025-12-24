import * as bcrypt from 'bcrypt';
import { UserDocument } from '../schemas/user.schema';

// sanitize user object
export function sanitizeUser(user: UserDocument) {
  const { _id, password, __v, ...rest } = user.toObject();
  return { id: _id.toString(), ...rest };
}


// hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// compare password
export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}
