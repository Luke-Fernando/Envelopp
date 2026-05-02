#!/usr/bin/env node
import { Command } from 'commander';
import { authCommand } from '../src/commands/auth.js';
import { pushCommand } from '../src/commands/push.js';
import { pullCommand } from '../src/commands/pull.js';

const program = new Command();

program
    .name('envl')
    .description('Envelopp: Securely sync .env files via GitHub Gists')
    .version('1.1.0');

program
    .command('auth')
    .description('Set up your GitHub identity')
    .action(authCommand);

program
    .command('push')
    .description('Seal and sync local .env to GitHub')
    .option('-a, --all', 'Seal all detected .env files')
    .option('-i, --include <files...>', 'Specifically include files')
    .option('-I, --ignore <files...>', 'Ignore specific files')
    .action(pushCommand);

program
    .command('pull [id]')
    .description('Fetch and unseal .env from GitHub')
    .option('-a, --all', 'Pull all files from the Gist')
    .option('-i, --include <files...>', 'Pull specific files by name')
    .action(pullCommand);

program.parse(process.argv);