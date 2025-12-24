import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../types/user.types';
import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, default: Role.USER })
  role: Role;

  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// ⚡ Transform for clean API response
UserSchema.set('toJSON', {
  versionKey: false, // remove __v
  transform: (doc, ret) => {
    // Cast ret to any to safely modify
    const result = ret as any;

    // Rename _id → id
    if ('_id' in result) {
      result.id = result._id;
      delete result._id;
    }

    // Remove password
    if ('password' in result) {
      delete result.password;
    }

    return result;
  },
});
