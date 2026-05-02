#!/usr/bin/env tsx
import { Command } from 'commander';
import { authCommand } from '../src/commands/auth.js';
import { pushCommand } from '../src/commands/push.js';
import { pullCommand } from '../src/commands/pull.js';

const program = new Command();

program
    .name('envl')
    .description('Envelopp: Securely sync .env files via GitHub Gists')
    .version('0.1.0');

program
    .command('auth')
    .description('Set up your GitHub identity')
    .action(authCommand);

program
    .command('push')
    .description('Seal and sync local .env to GitHub')
    .action(pushCommand);

program
    .command('pull [id]')
    .description('Fetch and unseal .env from GitHub')
    .action(pullCommand);

program.parse(process.argv);