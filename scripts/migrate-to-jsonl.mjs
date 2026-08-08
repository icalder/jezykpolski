#!/usr/bin/env node
/**
 * One-time migration: converts sentences/*.json (array format) to sentences/*.jsonl.
 *
 * JSONL format:
 *   Line 1: {"title": "Category Name"}
 *   Line 2+: one sentence object per line
 *
 * Usage:  node scripts/migrate-to-jsonl.mjs
 */
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const sentencesDir = 'sentences';

function migrate() {
  if (!existsSync(sentencesDir)) {
    console.error(`❌ Directory not found: ${sentencesDir}`);
    process.exit(1);
  }

  const jsonFiles = readdirSync(sentencesDir).filter(f => f.endsWith('.json') && f !== 'categories.json');

  if (jsonFiles.length === 0) {
    console.log('No .json files to migrate.');
    return;
  }

  let totalSentences = 0;

  for (const file of jsonFiles) {
    const fullPath = join(sentencesDir, file);
    const data = JSON.parse(readFileSync(fullPath, 'utf8'));

    const lines = [JSON.stringify({ title: data.title })];
    for (const sentence of (data.sentences || [])) {
      lines.push(JSON.stringify(sentence));
    }

    const jsonlPath = fullPath.replace(/\.json$/, '.jsonl');
    writeFileSync(jsonlPath, lines.join('\n') + '\n');

    totalSentences += data.sentences?.length || 0;
    console.log(`  ✅ ${file} → ${file.replace(/\.json$/, '.jsonl')}  (${data.sentences?.length || 0} sentences)`);
  }

  console.log(`\nMigrated ${jsonFiles.length} files, ${totalSentences} sentences total.`);
}

migrate();
