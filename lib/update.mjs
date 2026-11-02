import { bundledSkillDir } from './assets.mjs';
import { copyDir, removeDir, exists } from './fsops.mjs';
import {
  PLATFORMS,
  AI_TYPES,
  isValidAI,
  resolveSkillDir,
  expandTargets,
} from './platforms.mjs';
import { configPath, configureOpencode } from './opencode-config.mjs';
import { spinner, added, heading, warn, error } from './logue.mjs';

// Re-copy the bundled skill (from the installed CLI version) over any existing
// install. Targets come from --ai, else every harness that currently has one.
export async function update(opts = {}) {
  const ai = opts.ai;
  if (ai && !isValidAI(ai)) {
    error(`Unknown --ai "${ai}". Valid: ${AI_TYPES.join(', ')}, all`);
    process.exit(1);
  }

  const global = !!opts.global;
  const candidates = ai ? expandTargets(ai) : AI_TYPES;

  const targets = [];
  for (const t of candidates) {
    const dest = resolveSkillDir(t, { global });
    if (await exists(dest)) targets.push({ t, dest });
  }

  if (!targets.length) {
    warn(
      `No existing BuddyX install to update${global ? ' (global scope)' : ' in this project'}. Run "buddyx init" first.`,
    );
    return;
  }

  const src = bundledSkillDir();
  const spin = spinner('Updating the BuddyX skill…').start();
  try {
    for (const { dest } of targets) {
      await removeDir(dest);
      await copyDir(src, dest);
    }
    spin.succeed('BuddyX updated.');
  } catch (e) {
    spin.fail('Update failed.');
    error(e.message);
    process.exit(1);
  }

  heading('Updated:');
  for (const { t, dest } of targets) added(`${PLATFORMS[t].label}: ${dest}`);

  // Installs from before v2.4 have no opencode tier map; add the default (inherit).
  // An existing map is the user's and is never touched here.
  if (targets.some(({ t }) => t === 'opencode') && !(await exists(configPath({ global })))) {
    try {
      const r = await configureOpencode({ global });
      added(`opencode model tiers (inherit): ${r.path}`);
    } catch (e) {
      warn(`Could not write the opencode tier map: ${e.message}`);
    }
  }
}
