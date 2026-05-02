import { scryptSync, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import type { Envelopp } from '../types.js';

const ALGORITHM = 'aes-256-gcm';
const KEY_LEN = 32;

export function seal(plainText: string, password: string): Envelopp {
    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const key = scryptSync(password, salt, KEY_LEN);

    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
        version: 1,
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        data: encrypted.toString('hex')
    };
}

export function open(envelopp: Envelopp, password: string): string {
    const salt = Buffer.from(envelopp.salt, 'hex');
    const iv = Buffer.from(envelopp.iv, 'hex');
    const tag = Buffer.from(envelopp.tag, 'hex');
    const key = scryptSync(password, salt, KEY_LEN);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(envelopp.data, 'hex')),
        decipher.final()
    ]);

    return decrypted.toString('utf8');
}