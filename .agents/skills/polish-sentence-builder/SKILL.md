---
name: polish-sentence-builder
description: Adds Polish example sentences to category JSONL files for the Polish learning project. Use when the user wants to capture vocabulary or phrases in context as structured practice entries, complete with verb analysis (infinitive, aspect, translation). Provides validation, duplicate detection, and a dry-run mode.
compatibility: Requires Node.js 18+ and access to the project root directory.
---

# Polish Sentence Builder

This skill adds Polish sentences to the learning system's category files using the `add-sentence.mjs` helper script. Each sentence is stored as one line in a [JSONL](references/jsonl-format.md) file, making appends safe and reviewable.

## Setup

No installation required. The project uses [ES modules](https://nodejs.org/api/esm.html) (`.mjs` files) with Node.js 18+.

Verify your environment:

```bash
node --version   # 18+
```

## Usage

Run from the **project root** (`/home/itcalde/Documents/jezykpolski`):

```bash
node scripts/add-sentence.mjs <category> '<sentence-json>' [options]
```

### Options

| Flag       | Description                                      |
|------------|--------------------------------------------------|
| `--file`   | Load the sentence JSON from a file instead of inline. |
| `--dry-run`| Validate and preview without writing to disk.     |
| `-y`       | Skip the confirmation prompt and write immediately. |

### Examples

**Add a sentence inline:**

```bash
node scripts/add-sentence.mjs phrases -y '{
  "polish": "To nie koniec świata!",
  "english": "It is not the end of the world!",
  "verbs": [
    {"infinitive": "być", "translation": "to be", "perfective": false},
    {"infinitive": "kończyć", "translation": "to end", "perfective": false}
  ]
}'
```

**Validate without writing:**

```bash
node scripts/add-sentence.mjs general --dry-run '{
  "polish": "Lubię kawę z mlekiem.",
  "english": "I like coffee with milk.",
  "verbs": [
    {"infinitive": "lubić", "translation": "to like", "perfective": false},
    {"infinitive": "pić", "translation": "to drink", "perfective": false}
  ]
}'
```

**Load from a JSON file:**

```bash
cat > /tmp/my-sentence.json << 'EOF'
{"polish": "Zawsze wstaję o szóstej rano.",
 "english": "I always get up at six o'clock.",
 "verbs": [{"infinitive": "wchodzić", "translation": "to get up/rise", "perfective": false}]}
EOF

node scripts/add-sentence.mjs general --file /tmp/my-sentence.json -y
```

## Sentence JSON Schema

```jsonc
{
  "polish": "Polish sentence text",          // required, non-empty string
  "english": "English translation",          // required, non-empty string
  "verbs": [                                 // required, non-empty array
    {
      "infinitive": "verb",                  // required, non-empty string
      "translation": "translation",          // required, non-empty string
      "perfective": false                    // required, boolean: true = Perfective (dokonany), false = Imperfective (niedokonany)
    }
  ]
}
```

See [the format reference](references/jsonl-format.md) for details on the JSONL file structure and verb aspects.

## The Workflow

### 1. Choose a category

Categories are defined in `sentences/categories.json`. Each maps a display name to a `.jsonl` file. Before adding a sentence, decide which category best fits the theme:

- **`general`** — Everyday situations, common expressions
- **`phrases`** — Idioms, polite formulas, common phrases
- **`nature`** — Weather, environment, landscape, animals
- **`home_daily`** — Household tasks, daily routines, food
- **`travel_transport`** — Travel, directions, transport, hotels
- **`education`** — School, learning, study-related
- **`work`** — Office life, meetings, business
- **`tech_science`** — Technology, computing, science
- **`health`** — Medical terms, body parts, health advice
- **`family`** — Family relationships, social interactions
- **`jobs_professions`** — Professions, job descriptions, careers

To create a new category, add an entry to `sentences/categories.json`:

```jsonc
{"id": "cooking", "name": "Cooking & Recipes", "file": "cooking"}
```

Then create `sentences/cooking.jsonl` with a title line as the first entry:

```jsonl
{"title": "Cooking Practice"}
```

### 2. Analyze verbs

For every Polish verb in the sentence, provide:
- **Infinitive** — the base form (e.g., `lubić`, `widzieć`)
- **Translation** — English equivalent
- **Aspect** — `true` for Perfective (*dokonany*, completes an action) or `false` for Imperfective (*niedokonany*, describes ongoing/repeated actions)

### 3. Validate with `--dry-run`

Always run with `--dry-run` first to catch JSON syntax errors or duplicate entries before committing.

### 4. Write with `-y`

Once the dry run passes, add `-y` to write immediately without a prompt.

## Safety Features

- **JSON validation** — the sentence object is parsed and checked for required fields before writing
- **Duplicate detection** — prevents adding a sentence whose Polish text already exists in the same category
- **Cache-safe** — the `sentences.html` renderer caches loaded files; the refresh button clears the cache
- **Dry-run mode** — preview without touching files

## Related Files

| Path                        | Purpose                          |
|-----------------------------|----------------------------------|
| `sentences/categories.json` | Category manifest (dropdown data)|
| `sentences/*.jsonl`         | Category sentence data (JSONL)   |
| `sentences.html`            | Interactive card renderer        |
| `scripts/migrate-to-jsonl.mjs` | One-time migration tool (JSON → JSONL) |
