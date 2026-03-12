import { Plugin } from "obsidian";
import { ZenModeSettings, DEFAULT_SETTINGS } from "./settings";
import { ZenModeManager, SavedState } from "./zenMode";
import { ZenModeSettingTab } from "./settingsTab";

export default class ZenModePlugin extends Plugin {
  settings: ZenModeSettings;
  zenMode: ZenModeManager;
  private ribbonIcon: HTMLElement;

  async onload() {
    const data = (await this.loadData()) ?? {};
    // data.settings があれば新形式、なければ旧フラット形式として後方互換で読み込む
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data.settings ?? data);

    this.zenMode = new ZenModeManager(this, (state) => this.persistSavedState(state));

    // 強制終了時の復元（ワークスペース準備完了後に実行）
    if (data._savedState) {
      const savedState = data._savedState;
      this.app.workspace.onLayoutReady(async () => {
        await this.zenMode.restore(savedState);
        await this.persistSavedState(null);
        this.updateRibbonIcon();
      });
    }

    this.ribbonIcon = this.addRibbonIcon("eye", "Enable Zenora", async () => {
      await this.zenMode.toggle(this.settings);
      this.updateRibbonIcon();
    });

    this.addCommand({
      id: "toggle-zen-mode",
      name: "Toggle Zenora",
      callback: async () => {
        await this.zenMode.toggle(this.settings);
        this.updateRibbonIcon();
      },
    });

    this.addSettingTab(new ZenModeSettingTab(this.app, this));
  }

  async onunload() {
    if (this.zenMode?.active) {
      await this.zenMode.disable();
    }
  }

  async saveSettings() {
    const data = (await this.loadData()) ?? {};
    await this.saveData({ ...data, settings: this.settings });
  }

  private updateRibbonIcon() {
    this.ribbonIcon.ariaLabel = this.zenMode.active ? "Disable Zenora" : "Enable Zenora";
  }

  private async persistSavedState(state: SavedState | null): Promise<void> {
    const data = (await this.loadData()) ?? {};
    if (state === null) {
      delete data._savedState;
    } else {
      data._savedState = state;
    }
    await this.saveData(data);
  }
}
