import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { seal } from '../core/crypto.js';
import { getProjectId, saveProjectId, scanEnvFiles } from '../core/project.js';
import { upsertGist, type GistPayload } from '../core/gist.js';
import type { Envelopp, PushOptions } from '../types.js';

export async function pushCommand(options: PushOptions) {
    const allEnvs = scanEnvFiles(options.ignore || []);

    // 1. Check if .env exists
    if (allEnvs.length === 0) {
        console.error('No .env file found in this directory.');
        return;
    }

    let targets: string[] = [];

    if (options.all) {
        targets = allEnvs;
    } else if (options.include && options.include.length > 0) {
        targets = options.include;
    } else {
        const { selected } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selected',
                message: 'Select files to seal in this envelopp:',
                choices: allEnvs,
                default: ['.env']
            }
        ]);
        targets = selected;
    }

    if (targets.length === 0) {
        console.log('No files selected. Delivery cancelled.');
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
        const gistFiles: GistPayload = {};

        for (const file of targets) {
            const filePath = path.join(process.cwd(), file);
            if (fs.existsSync(filePath)) {
                const plainText = fs.readFileSync(filePath, 'utf-8');
                const envelope: Envelopp = seal(plainText, password);

                // We name the file in the Gist with an .enc suffix
                gistFiles[`${file}.enc`] = { content: JSON.stringify(envelope) };
            }
        }

        console.log('Delivering to GitHub...');
        const existingId = getProjectId();
        const gistId = await upsertGist(gistFiles, existingId);

        saveProjectId(gistId);
        console.log(`Success! Envelope pushed to Gist: ${gistId}`);
    } catch (error: any) {
        console.error('Delivery failed:', error.response?.data?.message || error.message);
    }
}