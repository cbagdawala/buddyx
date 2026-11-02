// opencode model-tier map: <opencode base>/buddyx.json
//
// opencode has no model aliases (haiku/sonnet/opus) — `model:` must be a real
// `provider/model-id`, and its task tool can't override the model per call. So on
// opencode BuddyX reads a small tier map instead. A `null` tier means "write no
// `model:` line" and the sub-agent inherits the calling agent's model, which is the
// default (and the right choice for a local server with one or two models).
//
// The file lives next to the skills dir, not inside it, so `buddyx update` (which
// replaces the skill folder) never wipes the user's mapping.

import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import prompts from 'prompts';
import { PLATFORMS } from './platforms.mjs';
import { exists } from './fsops.mjs';

export const TIERS = ['light', 'standard', 'deep'];
export const CONFIG_FILE = 'buddyx.json';

const COMMENT =
  'BuddyX model tiers for opencode. null = no model: line, so the sub-agent inherits the ' +
  "calling agent's model. Otherwise use a provider/model-id from your opencode config, e.g. " +
  '"ollama/qwen3-coder:30b". parallel: false runs sub-agents one at a time (best for a local ' +
  'model server); set true to fan independent sub-agents out concurrently.';

export function defaultConfig() {
  return {
    $comment: COMMENT,
    tiers: { light: null, standard: null, deep: null },
    parallel: false,
  };
}

/** Absolute path of the tier map for the opencode install in this scope. */
export function configPath({ global = false } = {}) {
  const p = PLATFORMS.opencode;
  const base = global ? p.globalBase : join(process.cwd(), p.projectBase);
  return join(base, CONFIG_FILE);
}

/** Strip // and /* *\/ comments and trailing commas from JSONC, leaving strings intact. */
export function stripJsonc(text) {
  let out = '';
  let inStr = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (inStr) {
      out += c;
      if (c === '\\') {
        out += n ?? '';
        i++;
      } else if (c === '"') {
        inStr = false;
      }
    } else if (c === '"') {
      inStr = true;
      out += c;
    } else if (c === '/' && n === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      out += '\n';
    } else if (c === '/' && n === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i++;
    } else {
      out += c;
    }
  }
  return out.replace(/,(\s*[}\]])/g, '$1');
}

async function readJsonc(file) {
  try {
    return JSON.parse(stripJsonc(await fs.readFile(file, 'utf8')));
  } catch {
    return null;
  }
}

/**
 * The user's configured opencode models, used to seed the tier prompt.
 * Project config wins over global for a project install.
 */
export async function readOpencodeModels({ global = false } = {}) {
  const dirs = global ? [PLATFORMS.opencode.globalBase] : [process.cwd(), PLATFORMS.opencode.globalBase];
  const found = {};
  for (const dir of dirs) {
    for (const name of ['opencode.json', 'opencode.jsonc']) {
      const cfg = await readJsonc(join(dir, name));
      if (!cfg) continue;
      found.model ??= cfg.model;
      found.small_model ??= cfg.small_model;
    }
  }
  return found;
}

/** Normalize one tier value: empty / "inherit" / "null" → null. */
function normTier(v) {
  const s = (v ?? '').toString().trim();
  if (!s || s === 'inherit' || s === 'null') return null;
  if (!/^[^/\s]+\/\S+$/.test(s)) {
    throw new Error(`"${s}" is not a provider/model-id (e.g. ollama/qwen3-coder:30b), or "inherit".`);
  }
  return s;
}

/** Parse `light=ollama/a,standard=ollama/b,deep=inherit`. Unlisted tiers stay unset. */
export function parseTierArg(str) {
  const tiers = {};
  for (const part of str.split(',').map((s) => s.trim()).filter(Boolean)) {
    const eq = part.indexOf('=');
    if (eq < 0) throw new Error(`Expected tier=model, got "${part}".`);
    const key = part.slice(0, eq).trim();
    if (!TIERS.includes(key)) throw new Error(`Unknown tier "${key}". Valid: ${TIERS.join(', ')}.`);
    tiers[key] = normTier(part.slice(eq + 1));
  }
  return tiers;
}

/** Ask for each tier, seeded from opencode.json. Returns null if cancelled. */
async function promptTiers(current, seeds) {
  // Pre-fill only what isn't "the main model": standard/deep left blank inherit it anyway,
  // and a pre-filled value is returned on Enter, which would pin it by accident.
  const suggest = {
    light: current.light ?? (seeds.small_model !== seeds.model ? seeds.small_model : null) ?? '',
    standard: current.standard ?? '',
    deep: current.deep ?? '',
  };
  const hint = {
    light: 'scans, lookups, running tests',
    standard: 'builders, test/doc writers, default reviewer',
    deep: 'architecture, risky refactors, security review',
  };
  if (seeds.model) console.log(`  Your opencode model: ${seeds.model} (what "inherit" uses)`);
  let cancelled = false;
  const res = await prompts(
    TIERS.map((t) => ({
      type: 'text',
      name: t,
      message: `${t} tier (${hint[t]}) — provider/model-id or "inherit"`,
      initial: suggest[t],
      validate: (v) => {
        try {
          normTier(v);
          return true;
        } catch (e) {
          return e.message;
        }
      },
    })),
    { onCancel: () => (cancelled = true) },
  );
  if (cancelled) return null;
  const out = {};
  for (const t of TIERS) out[t] = normTier(res[t]);
  return out;
}

/**
 * Write or update the tier map.
 * @param {object} o
 * @param {boolean} o.global
 * @param {true|string|undefined} o.tiers  true = prompt, string = parse, undefined = keep
 * @param {boolean|undefined} o.parallel   true = enable fan-out, undefined = keep
 * @returns {Promise<{path:string, action:'created'|'updated'|'kept'|'cancelled', config:object}>}
 */
export async function configureOpencode({ global = false, tiers, parallel } = {}) {
  const path = configPath({ global });
  const had = await exists(path);
  const existing = had ? await readJsonc(path) : null;
  if (had && !existing) {
    throw new Error(`${path} is not valid JSON — fix or delete it, then re-run.`);
  }
  const config = { ...defaultConfig(), ...(existing ?? {}) };
  config.tiers = { ...defaultConfig().tiers, ...(existing?.tiers ?? {}) };

  let changed = !had;
  if (tiers === true) {
    const seeds = await readOpencodeModels({ global });
    const answered = await promptTiers(config.tiers, seeds);
    if (!answered) return { path, action: 'cancelled', config };
    config.tiers = answered;
    changed = true;
  } else if (typeof tiers === 'string') {
    config.tiers = { ...config.tiers, ...parseTierArg(tiers) };
    changed = true;
  }
  if (parallel !== undefined) {
    config.parallel = !!parallel;
    changed = true;
  }

  if (!changed) return { path, action: 'kept', config };
  await fs.mkdir(dirname(path), { recursive: true });
  await fs.writeFile(path, JSON.stringify(config, null, 2) + '\n', 'utf8');
  return { path, action: had ? 'updated' : 'created', config };
}

/** One-line human summary of a config's model mode. */
export function describeTiers(config) {
  const set = TIERS.filter((t) => config.tiers?.[t]);
  const mode = set.length
    ? TIERS.map((t) => `${t}=${config.tiers[t] ?? 'inherit'}`).join(', ')
    : 'inherit (every sub-agent uses the calling agent\'s model)';
  return `${mode}; fan-out: ${config.parallel ? 'parallel' : 'sequential'}`;
}
