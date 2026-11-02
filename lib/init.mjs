import prompts from 'prompts';
import { bundledSkillDir } from './assets.mjs';
import { copyDir, removeDir, exists } from './fsops.mjs';
import {
  PLATFORMS,
  AI_TYPES,
  isValidAI,
  resolveSkillDir,
  expandTargets,
  platformChoices,
} from './platforms.mjs';
import { detectPlatform } from './detect.mjs';
import { configureOpencode, describeTiers, parseTierArg } from './opencode-config.mjs';
import { spinner, added, chalk, heading, error, warn } from './logue.mjs';

export async function init(opts = {}) {
  let ai = opts.ai;

  if (ai && !isValidAI(ai)) {
    error(`Unknown --ai "${ai}". Valid: ${AI_TYPES.join(', ')}, all`);
    process.exit(1);
  }

  if (!ai) {
    const suggested = detectPlatform();
    const initialIdx = suggested ? AI_TYPES.indexOf(suggested) : 0;
    const res = await prompts({
      type: 'select',
      name: 'ai',
      message: 'Install the BuddyX skill for which assistant?',
      choices: [...platformChoices(), { title: 'All of the above', value: 'all' }],
      initial: initialIdx < 0 ? 0 : initialIdx,
    });
    if (!res.ai) {
      warn('Cancelled.');
      return;
    }
    ai = res.ai;
  }

  const global = !!opts.global;
  const force = !!opts.force;
  const src = bundledSkillDir();
  const targets = expandTargets(ai);
  const installed = [];
  const skipped = [];

  if ((opts.tiers !== undefined || opts.parallel) && !targets.includes('opencode')) {
    warn('--tiers / --parallel only apply to opencode; ignoring them for this install.');
  }
  // Reject a malformed tier map before installing anything.
  if (typeof opts.tiers === 'string' && targets.includes('opencode')) {
    try {
      parseTierArg(opts.tiers);
    } catch (e) {
      error(`--tiers: ${e.message}`);
      process.exit(1);
    }
  }

  const spin = spinner('Installing the BuddyX skill…').start();
  try {
    for (const t of targets) {
      const dest = resolveSkillDir(t, { global });
      if (await exists(dest)) {
        if (!force) {
          skipped.push({ t, dest });
          continue;
        }
        await removeDir(dest);
      }
      await copyDir(src, dest);
      installed.push({ t, dest });
    }
    spin.succeed('BuddyX installed.');
  } catch (e) {
    spin.fail('Installation failed.');
    error(e.message);
    process.exit(1);
  }

  if (installed.length) {
    heading('Installed:');
    for (const { t, dest } of installed) added(`${PLATFORMS[t].label}: ${dest}`);
  }
  if (skipped.length) {
    heading('Skipped (already present — pass --force to overwrite):');
    for (const { t, dest } of skipped) warn(`  • ${PLATFORMS[t].label}: ${dest}`);
  }

  // opencode model-tier map: written (or reconfigured) even when the skill itself was
  // already present, so `buddyx init --ai opencode --tiers` works on an existing install.
  if (targets.includes('opencode')) {
    try {
      const r = await configureOpencode({
        global,
        tiers: opts.tiers,
        parallel: opts.parallel ? true : undefined,
      });
      heading('opencode model tiers:');
      if (r.action === 'cancelled') {
        warn(`  Cancelled — left ${r.path} unchanged.`);
      } else {
        const verb = { created: 'Created', updated: 'Updated', kept: 'Kept' }[r.action];
        added(`${verb} ${r.path}`);
        console.log(`    ${describeTiers(r.config)}`);
        if (r.action !== 'kept' || opts.tiers === undefined) {
          console.log(
            `    Change later: ${chalk.cyan('buddyx init --ai opencode --tiers')} (prompts), or edit the file.`,
          );
        }
      }
    } catch (e) {
      error(`opencode tier map: ${e.message}`);
      process.exitCode = 1;
    }
  }

  if (!installed.length) return;

  heading('Next steps:');
  console.log('  1. Restart your AI coding assistant.');
  console.log(
    `  2. Invoke it — type ${chalk.cyan('/buddyx')} or ask, e.g. "buddyx create user-auth module".`,
  );
}
