# Zenora

Obsidian plugin that brings a distraction-free writing experience inspired by Typora.

## Features

- **One-command toggle** — activate/deactivate zen mode via the Command Palette (`Toggle Zenora`)
- **Clean writing environment** — switches to the light theme, collapses both sidebars, and enables readable line length
- **Custom typography** — set your preferred font and content width
- **Configurable UI hiding** — optionally hide the status bar, inline title, and frontmatter properties
- **Adjustable padding** — control top and bottom content padding
- **Crash recovery** — if Obsidian closes while zen mode is active, your original settings are restored on the next launch

## Installation

### From Obsidian Community Plugins (coming soon)

1. Open **Settings → Community plugins**
2. Search for **Zenora**
3. Install and enable

### Manual

1. Download `main.js`, `styles.css`, and `manifest.json` from the [latest release](../../releases/latest)
2. Copy them to `<your-vault>/.obsidian/plugins/zenora/`
3. Enable the plugin in **Settings → Community plugins**

## Usage

Open the Command Palette (`Cmd/Ctrl + P`) and run **Toggle Zenora**.

Run it again to exit zen mode and restore all original settings.

## Settings

| Setting | Default | Description |
|---|---|---|
| Base theme | `System` | Color scheme to apply (System / Light / Dark). System follows OS setting in real time |
| Community theme | `None` | Installed community theme to apply (dropdown) |
| Zen mode font | `Georgia` | Font used while zen mode is active |
| Content width | `900` | Text column width in pixels |
| Font size | `18` | Font size in pixels |
| Line height | `1.8` | Line height multiplier |
| Paragraph spacing | `1.2` | Space between paragraphs (em) |
| Letter spacing | `0` | Letter spacing (em) |
| Hide status bar | `on` | Hides the bottom status bar |
| Hide inline title | `on` | Hides the inline note title |
| Hide properties | `on` | Hides frontmatter properties block |
| Hide backlinks | `on` | Hides the backlinks panel |
| Hide header | `on` | Hides the note header bar |
| Hide scrollbar | `on` | Hides the scrollbar |
| Top padding | `60` | Top padding of the editor area (px) |
| Bottom padding | `60` | Bottom padding of the editor area (px) |

## Development

```bash
npm install
npm run dev   # watch mode
```

To build for release:

```bash
npm run build
```

Copy `main.js`, `styles.css`, and `manifest.json` to your vault's plugin folder.

## License

[MIT](LICENSE)
