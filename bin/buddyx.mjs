#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Command } from 'commander';
import { init } from '../lib/init.mjs';
import { uninstall } from '../lib/uninstall.mjs';
import { update } from '../lib/update.mjs';
import { AI_TYPES } from '../lib/platforms.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8'));

const program = new Command();

program
  .name('buddyx')
  .description(
    'Install the BuddyX skill (master orchestrator that delegates to specialized sub-agents) into AI coding assistants.',
  )
  .version(pkg.version, '-v, --version', 'output the version');

const aiHelp = `target assistant: ${AI_TYPES.join(', ')}, or "all"`;

program
  .command('init')
  .description('Install the skill into an assistant (project scope by default)')
  .option('--ai <type>', aiHelp)
  .option('--global', 'install into your home dir (all projects) instead of the current project')
  .option('--force', 'overwrite an existing install')
  .action((opts) => init(opts));

program
  .command('uninstall')
  .description('Remove the installed skill')
  .option('--ai <type>', aiHelp)
  .option('--global', 'target the home-dir (global) install')
  .action((opts) => uninstall(opts));

program
  .command('update')
  .description('Re-install the bundled skill over existing installs')
  .option('--ai <type>', aiHelp)
  .option('--global', 'target the home-dir (global) install')
  .action((opts) => update(opts));

program
  .command('versions')
  .description('Print the installed CLI version')
  .action(() => console.log(`buddyx v${pkg.version}`));

program.parseAsync(process.argv);
