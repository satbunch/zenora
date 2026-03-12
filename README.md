# Zeno

A flexible, customizable zen mode plugin for Obsidian. Tailor your distraction-free writing environment exactly to your preference.

## Features

- **One-command toggle** — activate/deactivate zen mode via the Command Palette (`Toggle Zeno`)
- **Clean writing environment** — switches to the light theme, collapses both sidebars, and enables readable line length
- **Custom typography** — set your preferred font and content width
- **Configurable UI hiding** — optionally hide the status bar, inline title, and frontmatter properties
- **Adjustable padding** — control top and bottom content padding
- **Crash recovery** — if Obsidian closes while zen mode is active, your original settings are restored on the next launch

## Installation

### Via BRAT (recommended)

[BRAT](https://github.com/TfTHacker/obsidian42-brat) lets you install plugins directly from GitHub.

1. Install **BRAT** from the Obsidian Community plugins
2. Open BRAT settings and click **Add Beta plugin**
3. Enter `satbunch/zeno` and click **Add plugin**
4. Enable Zeno in **Settings → Community plugins**

### Manual (ZIP)

1. Download `zeno.zip` from the [latest release](../../releases/latest)
2. Extract and copy the `zeno` folder to `<your-vault>/.obsidian/plugins/`
3. Enable the plugin in **Settings → Community plugins**

### From Obsidian Community Plugins (coming soon)

1. Open **Settings → Community plugins**
2. Search for **Zeno**
3. Install and enable

## Usage

Open the Command Palette (`Cmd/Ctrl + P`) and run **Toggle Zeno**.

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
