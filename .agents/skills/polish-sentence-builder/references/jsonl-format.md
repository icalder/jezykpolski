# JSONL Format Reference

## File Structure

Each category file is a `.jsonl` (JSON Lines) file in `sentences/`. Every line is a standalone, valid JSON object.

```
sentences/
├── general.jsonl          ← main data files (one sentence per line)
├── nature.jsonl
├── phrases.jsonl
├── ...
└── categories.json        ← category manifest (standard JSON, not JSONL)
```

### Line layout

```jsonl
{"title": "General Practice"}
{"polish": "Lubię widzieć śnieg zimą", "english": "I like to see snow in winter", "verbs": [{"infinitive": "lubić", "translation": "to like", "perfective": false}]}
{"polish": "Niektóre książki są bardzo nudne.", "english": "Some books are very boring.", "verbs": [{"infinitive": "być", "translation": "to be", "perfective": false}]}
```

- **Line 1**: Metadata — must contain a `title` field (the category display name).
- **Line 2+**: One sentence object per line. No trailing commas, no array brackets.

### Why JSONL?

| Feature              | JSON array | JSONL       |
|----------------------|-----------|-------------|
| Append a sentence    | Edit closing `]` + add comma | Append one line |
| Parse a single entry | Parse whole file | Parse one line |
| Git diffs            | Large, noisy | One line per change |
| Edit safety          | Fragile (commas/brackets) | Robust (each line independent) |

## Adding Sentences

### Via the script

```bash
node scripts/add-sentence.mjs <category> '<sentence-json>' -y
```

The script handles:
1. Parsing and validating the sentence JSON
2. Checking for duplicate Polish text in the target file
3. Appending one line to the `.jsonl` file

### Manually (not recommended)

If you must edit a `.jsonl` file by hand:
- Append to the **end** of the file
- Ensure each line is valid JSON (use `jq` to validate)
- Do **not** add trailing commas or newlines between objects
- Do **not** modify existing lines (breaks git history)

## Sentence Object Schema

```jsonc
{
  "polish": "...",     // required: Polish sentence with the new vocabulary
  "english": "...",    // required: English translation
  "verbs": [           // required: array of verb objects
    {
      "infinitive": "...",   // required: base form of the verb
      "translation": "...",  // required: English equivalent
      "perfective": true     // required: true = Perfective (dokonany), false = Imperfective (niedokonany)
    }
  ]
}
```

## Verb Aspects (Polish)

Polish verbs have two grammatical aspects that describe how an action is viewed:

### Imperfective (*niedokonany*) — `perfective: false`

Describes actions that are:
- **Ongoing** or in progress
- **Repeated** or habitual
- **Incomplete**

Example: `pić` (to drink) — imperfective, you can drink repeatedly:

```
Piję kawę codziennie.
I drink coffee every day.  (habitual, repeated action)
```

### Perfective (*dokonany*) — `perfective: true`

Describes actions that are:
- **Completed** in a single, bounded event
- **One-time** actions with a clear endpoint

Example: `wypić` (to drink up/finish) — perfective counterpart of `pić`:

```
Wypiłem kawę.
I drank up the coffee.  (completed, one-time action)
```

### Aspect pairs

Many verbs come in imperfective-perfective pairs. The perfective is often formed by a prefix:

| Imperfective | Perfective | Polish meaning |
|-------------|-----------|----------------|
| `robić`     | `zrobić`   | to do → to do/finish |
| `pisać`     | `napisać`  | to write → to write (and finish) |
| `czytać`    | `przeczytać` | to read → to read through |
| `widzieć`   | `zobaczyć` | to see → to see (notice) |

When a single verb has no perfective counterpart, set `perfective: false`.
