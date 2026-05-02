export function parseEnv(content: string): Record<string, string> {
    const lines = content.split('\n');
    const result: Record<string, string> = {};

    for (const line of lines) {
        const [key, ...valueParts] = line.split('=');
        if (key && key.trim() && !key.startsWith('#')) {
            result[key.trim()] = valueParts.join('=').trim();
        }
    }
    return result;
}

export function stringifyEnv(data: Record<string, string>): string {
    return Object.entries(data)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
}