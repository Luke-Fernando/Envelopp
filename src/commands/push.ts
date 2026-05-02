import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { seal } from '../core/crypto.js';
import { getProjectId, saveProjectId } from '../core/project.js';
import { upsertGist } from '../core/gist.js';

export async function pushCommand() {
    const envPath = path.join(process.cwd(), '.env');

    // 1. Check if .env exists
    if (!fs.existsSync(envPath)) {
        console.error('No .env file found in this directory.');
        return;
    }

    // 2. Get the Secret
    const { password } = await inquirer.prompt([
        {
            type: 'password',
            name: 'password',
            message: 'Enter Master Password to seal this envelopp:',
            mask: '*'
        }
    ]);

    try {
        console.log('Sealing envelope...');
        const plainText = fs.readFileSync(envPath, 'utf-8');
        const envelope = seal(plainText, password);

        console.log('Delivering to GitHub...');
        const existingId = getProjectId();
        const gistId = await upsertGist(envelope, existingId);

        saveProjectId(gistId);
        console.log(`Success! Envelope pushed to Gist: ${gistId}`);
    } catch (error: any) {
        console.error('Delivery failed:', error.response?.data?.message || error.message);
    }
}