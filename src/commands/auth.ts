import inquirer from 'inquirer';
import axios from 'axios';
import { saveConfig } from '../core/config.js';

export async function authCommand() {
    const { token } = await inquirer.prompt([
        {
            type: 'password',
            name: 'token',
            message: 'Enter your GitHub Personal Access Token (Gist scope required):',
            mask: '*'
        }
    ]);

    try {
        console.log('Verifying token...');
        await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${token}` }
        });

        saveConfig({ github_token: token });
        console.log('Success! Token saved to ~/.envl/config.json');
    } catch (error) {
        console.error('Invalid token. Please check your permissions and try again.');
    }
}