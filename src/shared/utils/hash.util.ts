import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export class HashUtil {
    static async hashBcrypt(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);

        return await bcrypt.hash(password, salt);
    }

    static generateSha256Hex(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    static async compareHashBcrypt(
        original: string,
        hashed: string,
    ): Promise<boolean> {
        return await bcrypt.compare(original, hashed);
    }
}
