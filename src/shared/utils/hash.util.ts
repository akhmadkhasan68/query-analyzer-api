import * as bcrypt from 'bcrypt';

export class HashUtil {
    static async hashBcrypt(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);

        return await bcrypt.hash(password, salt);
    }

    static async compareHashBcrypt(
        original: string,
        hashed: string,
    ): Promise<boolean> {
        return await bcrypt.compare(original, hashed);
    }
}
