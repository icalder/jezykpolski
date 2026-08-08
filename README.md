# jezykpolski — Polish Sentence Practice

Interactive flashcards for learning Polish through example sentences. Sentences are organized by category and rendered as swipeable cards with translations and verb analysis.

## Practice

[![sentences.html](sentences.html)](https://icalder.github.io/jezykpolski/sentences.html)

Open the live site on **GitHub Pages**:  
https://icalder.github.io/jezykpolski/sentences.html

## Data Format

Sentence data lives in `sentences/` as **JSONL** files (one sentence per line). A `categories.json` manifest drives the category selector dynamically — new categories appear automatically.

To add a sentence:

```bash
node scripts/add-sentence.mjs <category> '<sentence-json>' -y
```

See `.agents/skills/polish-sentence-builder/SKILL.md` for full documentation.

## Project Structure

```
.
├── sentences.html              # Interactive card renderer
├── sentences/
│   ├── categories.json         # Category manifest
│   ├── general.jsonl           # Sentence data (one per line)
│   └── ...                     # One .jsonl per category
├── scripts/
│   ├── add-sentence.mjs        # Add validated sentences
│   └── migrate-to-jsonl.mjs    # One-time JSON→JSONL migration
└── .agents/skills/polish-sentence-builder/
    └── SKILL.md                # Skill: add-sentence tool guide
```
