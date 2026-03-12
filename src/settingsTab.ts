import { App, PluginSettingTab, Setting } from "obsidian";
import ZenModePlugin from "./main";

interface ObsidianAppWithCustomCss {
  customCss?: { themes?: string[] | Record<string, unknown> };
}

export class ZenModeSettingTab extends PluginSettingTab {
  plugin: ZenModePlugin;

  constructor(app: App, plugin: ZenModePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Base theme")
      .setDesc("Color scheme to use while zen mode is active")
      .addDropdown((drop) =>
        drop
          .addOption("system", "System")
          .addOption("moonstone", "Light")
          .addOption("obsidian", "Dark")
          .setValue(this.plugin.settings.baseTheme)
          .onChange(async (value: string) => {
            this.plugin.settings.baseTheme = value as "moonstone" | "obsidian" | "system";
            await this.plugin.saveSettings();
            await this.plugin.zenMode.applyTheme(value, this.plugin.settings.cssTheme);
          })
      );

    const rawThemes = (this.plugin.app as unknown as ObsidianAppWithCustomCss).customCss?.themes ?? {};
    const installedThemes: string[] = Array.isArray(rawThemes)
      ? rawThemes
      : Object.keys(rawThemes);
    new Setting(containerEl)
      .setName("Community theme")
      .setDesc("Installed community theme to apply (none = use default)")
      .addDropdown((drop) => {
        drop.addOption("", "None");
        for (const theme of installedThemes) {
          drop.addOption(theme, theme);
        }
        drop
          .setValue(this.plugin.settings.cssTheme)
          .onChange(async (value) => {
            this.plugin.settings.cssTheme = value;
            await this.plugin.saveSettings();
            await this.plugin.zenMode.applyTheme(this.plugin.settings.baseTheme, value);
          });
      });

    new Setting(containerEl)
      .setName("Zen mode font")
      .setDesc("Font to use while zen mode is active")
      .addText((text) =>
        text
          .setPlaceholder("Georgia")
          .setValue(this.plugin.settings.font)
          .onChange(async (value) => {
            this.plugin.settings.font = value;
            await this.plugin.saveSettings();
            this.plugin.zenMode.applyFont(value);
          })
      );

    new Setting(containerEl)
      .setName("Content width")
      .setDesc("Text column width while zen mode is active (px)")
      .addText((text) =>
        text
          .setPlaceholder("900")
          .setValue(String(this.plugin.settings.contentWidth))
          .onChange(async (value) => {
            const num = parseInt(value, 10);
            if (!isNaN(num) && num > 0) {
              this.plugin.settings.contentWidth = num;
              await this.plugin.saveSettings();
              this.plugin.zenMode.applySettings(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName("Font size")
      .setDesc("Font size while zen mode is active (px)")
      .addText((text) =>
        text
          .setPlaceholder("18")
          .setValue(String(this.plugin.settings.fontSize))
          .onChange(async (value) => {
            const num = parseFloat(value);
            if (!isNaN(num) && num > 0) {
              this.plugin.settings.fontSize = num;
              await this.plugin.saveSettings();
              this.plugin.zenMode.applySettings(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName("Line height")
      .setDesc("Line height while zen mode is active (e.g. 1.8)")
      .addText((text) =>
        text
          .setPlaceholder("1.8")
          .setValue(String(this.plugin.settings.lineHeight))
          .onChange(async (value) => {
            const num = parseFloat(value);
            if (!isNaN(num) && num > 0) {
              this.plugin.settings.lineHeight = num;
              await this.plugin.saveSettings();
              this.plugin.zenMode.applySettings(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName("Paragraph spacing")
      .setDesc("Space between paragraphs while zen mode is active (em)")
      .addText((text) =>
        text
          .setPlaceholder("1.2")
          .setValue(String(this.plugin.settings.paragraphSpacing))
          .onChange(async (value) => {
            const num = parseFloat(value);
            if (!isNaN(num) && num >= 0) {
              this.plugin.settings.paragraphSpacing = num;
              await this.plugin.saveSettings();
              this.plugin.zenMode.applySettings(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName("Letter spacing")
      .setDesc("Letter spacing while zen mode is active (em, e.g. 0.02)")
      .addText((text) =>
        text
          .setPlaceholder("0")
          .setValue(String(this.plugin.settings.letterSpacing))
          .onChange(async (value) => {
            const num = parseFloat(value);
            if (!isNaN(num)) {
              this.plugin.settings.letterSpacing = num;
              await this.plugin.saveSettings();
              this.plugin.zenMode.applySettings(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName("Hide status bar")
      .setDesc("Hide the status bar while zen mode is active")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hideStatusBar)
          .onChange(async (value) => {
            this.plugin.settings.hideStatusBar = value;
            await this.plugin.saveSettings();
            this.plugin.zenMode.applySettings(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Hide inline title")
      .setDesc("Hide the inline title while zen mode is active")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hideInlineTitle)
          .onChange(async (value) => {
            this.plugin.settings.hideInlineTitle = value;
            await this.plugin.saveSettings();
            this.plugin.zenMode.applySettings(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Hide properties")
      .setDesc("Hide the frontmatter properties block while zen mode is active")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hideProperties)
          .onChange(async (value) => {
            this.plugin.settings.hideProperties = value;
            await this.plugin.saveSettings();
            this.plugin.zenMode.applySettings(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Hide backlinks")
      .setDesc("Hide the backlinks panel while zen mode is active")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hideBacklinks)
          .onChange(async (value) => {
            this.plugin.settings.hideBacklinks = value;
            await this.plugin.saveSettings();
            this.plugin.zenMode.applySettings(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Hide header")
      .setDesc("Hide the note header bar while zen mode is active")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hideHeader)
          .onChange(async (value) => {
            this.plugin.settings.hideHeader = value;
            await this.plugin.saveSettings();
            this.plugin.zenMode.applySettings(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Hide scrollbar")
      .setDesc("Hide the scrollbar while zen mode is active")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hideScrollbar)
          .onChange(async (value) => {
            this.plugin.settings.hideScrollbar = value;
            await this.plugin.saveSettings();
            this.plugin.zenMode.applySettings(this.plugin.settings);
          })
      );

    new Setting(containerEl)
      .setName("Top padding")
      .setDesc("Top padding of the editor area while zen mode is active (px)")
      .addText((text) =>
        text
          .setPlaceholder("60")
          .setValue(String(this.plugin.settings.paddingTop))
          .onChange(async (value) => {
            const num = parseInt(value, 10);
            if (!isNaN(num) && num >= 0) {
              this.plugin.settings.paddingTop = num;
              await this.plugin.saveSettings();
              this.plugin.zenMode.applySettings(this.plugin.settings);
            }
          })
      );

    new Setting(containerEl)
      .setName("Bottom padding")
      .setDesc("Bottom padding of the editor area while zen mode is active (px)")
      .addText((text) =>
        text
          .setPlaceholder("60")
          .setValue(String(this.plugin.settings.paddingBottom))
          .onChange(async (value) => {
            const num = parseInt(value, 10);
            if (!isNaN(num) && num >= 0) {
              this.plugin.settings.paddingBottom = num;
              await this.plugin.saveSettings();
              this.plugin.zenMode.applySettings(this.plugin.settings);
            }
          })
      );
  }
}
