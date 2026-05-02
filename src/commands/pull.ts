import fs from 'fs';
import inquirer from 'inquirer';
import { open } from '../core/crypto.js';
import { getProjectId, saveProjectId } from '../core/project.js';
import { fetchGist } from '../core/gist.js';
import { parseEnv, stringifyEnv } from '../core/parser.js';

export async function pullCommand(id?: string) {
    const gistId = id || getProjectId();

    if (!gistId) {
        console.error('No Gist ID provided and no .envl file found.');
        console.log('Usage: envl pull <gist-id>');
        return;
    }

    const { password } = await inquirer.prompt([
        {
            type: 'password',
            name: 'password',
            message: 'Enter Master Password to open this envelope:',
            mask: '*'
        }
    ]);

    try {
        console.log('Fetching envelopp from GitHub...');
        const envelope = await fetchGist(gistId);

        console.log('Unsealing content...');
        const incomingRaw = open(envelope, password);
        const incomingData = parseEnv(incomingRaw);

        let finalData = incomingData;

        if (fs.existsSync('.env')) {
            const localRaw = fs.readFileSync('.env', 'utf-8');
            const localData = parseEnv(localRaw);

            finalData = { ...localData, ...incomingData };
        }

        fs.writeFileSync('.env', stringifyEnv(finalData));
        saveProjectId(gistId);
        console.log('Success! .env has been restored.');
    } catch (error: any) {
        if (error.message.includes('bad decrypt') || error.code === 'ERR_CRYPTO_PBKDF2_ITER_TOO_LOW') {
            console.error('Failed to open: Incorrect password or corrupted data.');
        } else {
            console.error('Pull failed:', error.response?.data?.message || error.message);
        }
    }
}