export interface Config {
    global_token?: string;
    project_tokens: Record<string, string>;
}

export interface Envelopp {
    version: number;
    salt: string;
    iv: string;
    tag: string;
    data: string;
}

export interface PushOptions {
    all?: boolean;
    include?: string[];
    ignore?: string[];
}