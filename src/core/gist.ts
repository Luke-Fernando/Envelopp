import axios from 'axios';
import { getConfig } from './config.js';
import type { Envelopp } from '../types.js';

const BASE_URL = 'https://api.github.com/gists';

export async function upsertGist(envelope: Envelopp, gistId?: string): Promise<string> {
    const config = getConfig();
    if (!config) throw new Error('Not authenticated. Run "envl auth" first.');

    const headers = { Authorization: `token ${config.github_token}` };

    const payload = {
        description: 'Envelopp: Sync via Gist',
        public: false,
        files: {
            'envelopp.json': {
                content: JSON.stringify(envelope, null, 2)
            }
        }
    };

    if (gistId) {
        await axios.patch(`${BASE_URL}/${gistId}`, payload, { headers });
        return gistId;
    } else {
        const response = await axios.post(BASE_URL, payload, { headers });
        return response.data.id;
    }
}

export async function fetchGist(gistId: string): Promise<Envelopp> {
    const config = getConfig();
    if (!config) throw new Error('Not authenticated. Run "envl auth" first.');

    const headers = { Authorization: `token ${config.github_token}` };

    const response = await axios.get(`${BASE_URL}/${gistId}`, { headers });
    const file = response.data.files['envelopp.json'];

    if (!file) throw new Error('This Gist does not contain an Envelopp seal.');

    return JSON.parse(file.content) as Envelopp;
}