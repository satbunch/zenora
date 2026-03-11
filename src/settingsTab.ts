import { App, PluginSettingTab, Setting } from "obsidian";
import ZenModePlugin from "./main";

export class ZenModeSettingTab extends PluginSettingTab {
  plugin: ZenModePlugin;

  constructor(app: App, plugin: ZenModePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Zenora settings" });

    new Setting(containerEl)
      .setName("Zen mode font")
      .setDesc("禅モード中に使用するフォント名")
      .addText((text) =>
        text
          .setPlaceholder("例: Georgia, Noto Serif JP")
          .setValue(this.plugin.settings.font)
          .onChange(async (value) => {
            this.plugin.settings.font = value;
            await this.plugin.saveSettings();
            this.plugin.zenMode.applyFont(value);
          })
      );

    new Setting(containerEl)
      .setName("Content width")
      .setDesc("禅モード中のコンテンツ幅 (px)")
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
      .setName("Hide status bar")
      .setDesc("禅モード中にステータスバーを非表示にする")
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
      .setDesc("禅モード中にインラインタイトルを非表示にする")
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
      .setDesc("禅モード中にプロパティ（フロントマター）を非表示にする")
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
      .setDesc("禅モード中にバックリンクパネルを非表示にする")
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
      .setName("Top padding")
      .setDesc("禅モード中のコンテンツ上部の余白 (px)")
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
      .setDesc("禅モード中のコンテンツ下部の余白 (px)")
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
