export type Config = {
    github_token: string
}

export interface Envelopp {
    version: number;
    salt: string;
    iv: string;
    tag: string;
    data: string;
}