# Polish Sentence Practice - Project Documentation

This project provides a lightweight web application for practicing Polish sentences. It features an interactive card-based interface that allows users to test their knowledge, reveal translations, and dismiss known sentences.

## HTML Renderer (`sentences.html`)

The renderer is a single-page application that dynamically loads sentence data from a JSON file.

### Key Features:
- **Dynamic Loading**: Loads data from `sentences.json` by default. It can load any JSON file provided via the `file` query parameter (e.g., `sentences.html?file=travel_sentences.json`).
- **Interactive Cards**: 
    - **Click/Tap**: Toggles the visibility of the English translation and associated verbs.
    - **Swipe Right**: Dismisses a card (removes it from the current session). Supported for both touch screens and mouse users.
- **Refresh Button**: A button in the header allows users to reload the entire set of sentences, restoring any that were dismissed.

## Data Schema

The application expects a JSON file with the following structure:

```json
{
  "title": "Page Title",
  "sentences": [
    {
      "polish": "Polish sentence text",
      "english": "English translation",
      "verbs": [
        "verb (translation)",
        "another verb (translation)"
      ]
    }
  ]
}
```

### Field Definitions:
- `title` (String): The heading displayed at the top of the page.
- `sentences` (Array): A list of sentence objects to be rendered as cards.
    - `polish` (String): The target language sentence to be practiced.
    - `english` (String): The translation used for verification.
    - `verbs` (Array of Strings): A list of key verbs or grammatical notes associated with the sentence, displayed below the translation.

## How to Add a New Set of Sentences

To create a new topic or a different set of practice sentences:

1.  **Create a new JSON file**: Create a file in the project root (e.g., `travel.json`).
2.  **Populate the data**: Follow the data schema described above.
    ```json
    {
      "title": "Travel Phrases",
      "sentences": [
        {
          "polish": "Gdzie jest dworzec?",
          "english": "Where is the station?",
          "verbs": ["być (to be)"]
        }
      ]
    }
    ```
3.  **Open in Browser**: Launch the renderer and pass the new file as a parameter:
    `./sentences.html?file=travel.json`
