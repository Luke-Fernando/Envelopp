import axios from 'axios';
import { getTokenForProject } from './config.js';
import type { Envelopp } from '../types.js';

const BASE_URL = 'https://api.github.com/gists';

export type GistPayload = Record<string, { content: string }>;
export type EnveloppCollection = Record<string, Envelopp>;

export async function upsertGist(files: GistPayload, gistId?: string): Promise<string> {
    const token = getTokenForProject(gistId);
    if (!token) throw new Error('Not authenticated. Run "envl auth" first.');

    const headers = { Authorization: `token ${token}` };

    const payload = {
        description: 'Envelopp: Sync via Gist',
        public: false,
        files: files
    };

    if (gistId) {
        await axios.patch(`${BASE_URL}/${gistId}`, payload, { headers });
        return gistId;
    } else {
        const response = await axios.post(BASE_URL, payload, { headers });
        return response.data.id;
    }
}

export async function fetchGist(gistId: string): Promise<EnveloppCollection> {
    const token = getTokenForProject(gistId);
    if (!token) throw new Error('Not authenticated. Run "envl auth" first.');

    const headers = { Authorization: `token ${token}` };

    const response = await axios.get(`${BASE_URL}/${gistId}`, { headers });
    const files = response.data.files;

    const envelopes: EnveloppCollection = {};

    Object.keys(files).forEach(fileName => {
        if (fileName.endsWith('.enc')) {
            const originalName = fileName.replace('.enc', '');
            try {
                // Parse the string back into our Envelopp interface
                envelopes[originalName] = JSON.parse(files[fileName].content) as Envelopp;
            } catch (e) {
                console.warn(`Could not parse envelope for ${fileName}. Skipping.`);
            }
        }
    });

    if (Object.keys(envelopes).length === 0) {
        throw new Error('This Gist does not contain any Envelopp seals (.enc files).');
    }

    return envelopes;
}