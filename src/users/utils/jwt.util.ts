// src/auth/utils/jwt.util.ts
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'src/users/schemas/user.schema';

export async function generateJwtToken(
  user: UserDocument,
  jwtService: JwtService,
): Promise<string> {
  const payload = {
    sub: user._id,
    email: user.email,
    role: user.role, // optional but useful for guards
  };

  return await jwtService.signAsync(payload);
}
