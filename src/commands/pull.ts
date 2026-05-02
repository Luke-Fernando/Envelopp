import fs from 'fs';
import inquirer from 'inquirer';
import { open } from '../core/crypto.js';
import { getProjectId, saveProjectId } from '../core/project.js';
import { fetchGist } from '../core/gist.js';
import { parseEnv, stringifyEnv } from '../core/parser.js';
import type { PushOptions } from '../types.js';

export async function pullCommand(id?: string, options: PushOptions = {}) {
    const gistId = id || getProjectId();

    if (!gistId) {
        console.error('No Gist ID provided and no .envl file found.');
        console.log('Usage: envl pull <gist-id>');
        return;
    }

    try {
        console.log('Fetching envelopp from GitHub...');
        const collection = await fetchGist(gistId);
        const availableFiles = Object.keys(collection);

        let targets: string[] = [];

        if (options.all) {
            targets = availableFiles;
        } else if (options.include && options.include.length > 0) {
            targets = options.include.filter(f => availableFiles.includes(f));
        } else {
            const { selected } = await inquirer.prompt([
                {
                    type: 'checkbox',
                    name: 'selected',
                    message: 'Select files to pull from this envelope:',
                    choices: availableFiles,
                    default: availableFiles
                }
            ]);
            targets = selected;
        }

        if (targets.length === 0) {
            console.log('No files selected. Pull cancelled.');
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

        console.log('Unsealing content...');


        for (const filename of targets) {
            const envelope = collection[filename];
            if (!envelope) {
                console.warn(`Skipping ${filename}: Not found in the fetched collection.`);
                continue;
            }

            const incomingRaw = open(envelope, password);
            const incomingData = parseEnv(incomingRaw);

            let finalData = incomingData;

            // Merge logic if local file exists
            if (fs.existsSync(filename)) {
                const localRaw = fs.readFileSync(filename, 'utf-8');
                const localData = parseEnv(localRaw);
                // Incoming keys overwrite local keys
                finalData = { ...localData, ...incomingData };
            }

            fs.writeFileSync(filename, stringifyEnv(finalData));
            console.log(`- ${filename} restored.`);
        }
        saveProjectId(gistId);
        console.log(`\nSuccess! ${targets.length} file(s) updated.`);
    } catch (error: any) {
        if (error.message.includes('bad decrypt') || error.code === 'ERR_CRYPTO_PBKDF2_ITER_TOO_LOW') {
            console.error('Failed to open: Incorrect password or corrupted data.');
        } else {
            console.error('Pull failed:', error.response?.data?.message || error.message);
        }
    }
}