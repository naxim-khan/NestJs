import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
    private blacklist = new Set<string>();

    // Add a token to the blacklist
    add(token: string) {
        this.blacklist.add(token);
    }

    // Check if a token is blacklisted
    isBlacklisted(token: string): boolean {
        return this.blacklist.has(token);
    }
}
