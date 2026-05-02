import inquirer from 'inquirer';
import axios from 'axios';
import { getConfig, saveConfig } from '../core/config.js';
import { getProjectId } from '../core/project.js';

export async function authCommand() {
    try {
        const gistId = getProjectId();

        const { scope } = await inquirer.prompt([
            {
                type: 'select',
                name: 'scope',
                message: 'Where should this token apply?',
                choices: [
                    { name: 'Global (All projects)', value: 'global' },
                    { name: `This project only (${gistId || 'No project detected'})`, value: 'project', disabled: !gistId }
                ]
            }
        ]);

        const { token } = await inquirer.prompt([{ type: 'password', name: 'token', message: 'GitHub Token:' }]);

        try {
            console.log('Verifying token...');
            await axios.get('https://api.github.com/user', {
                headers: { Authorization: `token ${token}` }
            });

            const config = getConfig() || { project_tokens: {} };

            if (scope === 'global') {
                config.global_token = token;
            } else if (gistId) {
                config.project_tokens[gistId] = token;
            }

            saveConfig(config);

            console.log('Success! Token saved to ~/.envl/config.json');
        } catch (error) {
            console.error('Invalid token. Please check your permissions and try again.');
            return;
        }
    } catch (error: any) {
        if (error.name === 'ExitPromptError' || error.message.includes('SIGINT')) {
            console.log('\nExiting...');
            process.exit(0);
        }

        console.error('\nError:', error.message);
    }
}