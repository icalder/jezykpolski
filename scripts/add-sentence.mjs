#!/usr/bin/env node
/**
 * Appends a single sentence to a category JSONL file.
 *
 * Each line in a .jsonl file is a standalone JSON object, so appending
 * is a safe single-line write — no array brackets or commas to manage.
 *
 * Usage:
 *   node scripts/add-sentence.mjs <category> '<sentence-json>'
 *   node scripts/add-sentence.mjs <category> --file <path-to-sentence.json>
 *
 * Examples:
 *   node scripts/add-sentence.mjs general '{"polish":"Lubię kawę z mlekiem","english":"I like coffee with milk","verbs":[{"infinitive":"lubić","translation":"to like","perfective":false},{"infinitive":"pić","translation":"to drink","perfective":false}]}'
 *
 *   # from a file:
 *   node scripts/add-sentence.mjs general --file ./my-sentence.json
 *
 * Options:
 *   --dry-run   Validate and show what would be written without modifying the file.
 *   -y          Skip the confirmation prompt and write immediately.
 */
import { readFileSync, existsSync, appendFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { stdin, stdout, exit, argv } from 'node:process';

const sentencesDir = resolve(import.meta.dirname, '..', 'sentences');

function usage() {
  console.error('Usage: node scripts/add-sentence.mjs <category> \'<sentence-json>\' | --file <path>');
  console.error('  --dry-run   Validate without writing.');
  console.error('  -y          Skip confirmation prompt.');
  exit(1);
}

function parseArgs(args) {
  const opts = { category: null, sentenceSource: null, dryRun: false, assumeYes: false };
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '-y') opts.assumeYes = true;
    else if (arg === '--file') {
      opts.sentenceSource = { type: 'file', path: args[++i] };
    } else if (arg.startsWith('--file=')) {
      opts.sentenceSource = { type: 'file', path: arg.slice(7) };
    } else {
      positional.push(arg);
    }
  }

  if (positional.length >= 1) opts.category = positional[0];
  if (positional.length >= 2) opts.sentenceSource = { type: 'inline', data: positional[1] };
  if (positional.length > 2) {
    // remaining positional args are part of the JSON (spaces) — rejoin
    opts.sentenceSource = { type: 'inline', data: positional.slice(1).join(' ') };
  }

  return opts;
}

function validateSentence(sentence) {
  const errors = [];

  if (typeof sentence !== 'object' || sentence === null) {
    errors.push('Sentence must be a JSON object.');
    return errors;
  }

  if (typeof sentence.polish !== 'string' || sentence.polish.length === 0) {
    errors.push('Field "polish" is required and must be a non-empty string.');
  }
  if (typeof sentence.english !== 'string' || sentence.english.length === 0) {
    errors.push('Field "english" is required and must be a non-empty string.');
  }

  if (!Array.isArray(sentence.verbs)) {
    errors.push('Field "verbs" must be an array.');
  } else if (sentence.verbs.length === 0) {
    errors.push('Field "verbs" must contain at least one verb object.');
  } else {
    sentence.verbs.forEach((v, i) => {
      if (typeof v !== 'object' || v === null) {
        errors.push(`Verbs[${i}] must be an object.`);
        return;
      }
      if (typeof v.infinitive !== 'string' || v.infinitive.length === 0) {
        errors.push(`Verbs[${i}].infinitive is required and must be a non-empty string.`);
      }
      if (typeof v.translation !== 'string' || v.translation.length === 0) {
        errors.push(`Verbs[${i}].translation is required and must be a non-empty string.`);
      }
      if (typeof v.perfective !== 'boolean') {
        errors.push(`Verbs[${i}].perfective is required and must be a boolean (true/false).`);
      }
    });
  }

  return errors;
}

function checkDuplicate(polishText, category) {
  const jsonlPath = join(sentencesDir, `${category}.jsonl`);
  if (!existsSync(jsonlPath)) return null;

  const lines = readFileSync(jsonlPath, 'utf8').trim().split('\n');
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.polish === polishText) return obj;
    } catch {
      // skip metadata lines or malformed entries
    }
  }
  return null;
}

function prompt(message) {
  stdout.write(message);
  return new Promise(resolve => {
    stdin.resume();
    stdin.once('data', data => resolve(data.toString().trim()));
  });
}

async function main() {
  const opts = parseArgs(argv.slice(2));

  if (!opts.category || !opts.sentenceSource) usage();

  // Resolve the sentence JSON
  let sentence;
  try {
    const raw = opts.sentenceSource.type === 'file'
      ? readFileSync(opts.sentenceSource.path, 'utf8')
      : opts.sentenceSource.data;
    sentence = JSON.parse(raw);
  } catch (e) {
    console.error(`❌ Could not parse sentence JSON: ${e.message}`);
    exit(1);
  }

  // Validate
  const errors = validateSentence(sentence);
  if (errors.length > 0) {
    console.error('❌ Validation failed:');
    errors.forEach(e => console.error(`   - ${e}`));
    exit(1);
  }

  // Check for duplicates
  const dup = checkDuplicate(sentence.polish, opts.category);
  if (dup) {
    console.error(`❌ Duplicate detected: a sentence with this Polish text already exists in ${opts.category}.jsonl`);
    console.error(`   "${dup.polish}"`);
    exit(1);
  }

  // Show what we're about to do
  const jsonlPath = join(sentencesDir, `${opts.category}.jsonl`);
  console.log(`\n📝 Category:  ${opts.category}`);
  console.log(`📄 File:      ${jsonlPath}`);
  console.log(`🇵🇱 Polish:   ${sentence.polish}`);
  console.log(`🇬🇧 English:  ${sentence.english}`);
  console.log(`🔧 Verbs:    ${sentence.verbs.map(v => `${v.infinitive}${v.perfective ? ' (P)' : ' (I)'} — ${v.translation}`).join(', ')}`);

  if (opts.dryRun) {
    console.log('\n✅ Dry run. No changes written.');
    exit(0);
  }

  if (!existsSync(sentencesDir)) {
    console.error(`❌ Sentences directory not found: ${sentencesDir}`);
    exit(1);
  }

  if (!existsSync(jsonlPath)) {
    // Create new file with a title metadata line
    const title = opts.category.charAt(0).toUpperCase() + opts.category.slice(1).replace(/_/g, ' ') + ' Practice';
    const fs = await import('node:fs');
    const { writeFileSync: wf } = fs;
    wf(jsonlPath, JSON.stringify({ title }) + '\n');
    console.log(`\n🆕 Created new file ${jsonlPath} with title: "${title}"`);
  }

  if (!opts.assumeYes) {
    const answer = await prompt('\nProceed? [y/N] ');
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted.');
      exit(0);
    }
  }

  const serialized = JSON.stringify(sentence);
  appendFileSync(jsonlPath, serialized + '\n');
  console.log(`\n✅ Added to ${opts.category}.jsonl`);
}

main().catch(e => {
  console.error(e);
  exit(1);
});
