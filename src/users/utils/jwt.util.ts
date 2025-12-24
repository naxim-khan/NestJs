// src/auth/utils/jwt.util.ts
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

export async function generateJwtToken(
  user: User,
  jwtService: JwtService,
): Promise<string> {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role, // optional but useful for guards
  };

  return await jwtService.signAsync(payload);
}
