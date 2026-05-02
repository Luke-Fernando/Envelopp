import fs from 'fs';
import path from "path";
import os from 'os';
import type { Config } from "../types.js";

const CONFIG_DIR = path.join(os.homedir(), '.envl');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function saveConfig(config: Config): void {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function getConfig(): Config | null {
    if (!fs.existsSync(CONFIG_FILE)) return null;
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
}

export function getTokenForProject(gistId?: string): string | undefined {
    const config = getConfig();
    if (!config) return undefined;

    if (gistId && config.project_tokens[gistId]) {
        return config.project_tokens[gistId];
    }

    return config.global_token;
}