import { Plugin } from "obsidian";
import { ZenModeSettings } from "./settings";


interface ObsidianVaultConfig {
  getConfig(key: string): unknown;
  setConfig(key: string, value: unknown): void;
}

interface ObsidianSplit {
  collapse(): void;
  expand(): void;
  collapsed: boolean;
  containerEl: HTMLElement;
}

interface ObsidianApp {
  vault: ObsidianVaultConfig;
  customCss: { setTheme(theme: string): Promise<void> };
  workspace: {
    leftSplit?: ObsidianSplit;
    rightSplit?: ObsidianSplit;
  };
}

export interface SavedState {
  theme: string;
  cssTheme: string;
  readableLineLength: boolean;
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
}

const ZEN_STYLE_ID = "zen-mode-styles";

export class ZenModeManager {
  private isZenMode = false;
  private savedState: SavedState | null = null;
  private plugin: Plugin;
  private activeSettings: ZenModeSettings | null = null;
  private onPersist: (state: SavedState | null) => Promise<void>;

  constructor(plugin: Plugin, onPersist: (state: SavedState | null) => Promise<void>) {
    this.plugin = plugin;
    this.onPersist = onPersist;
  }

  get active(): boolean {
    return this.isZenMode;
  }

  async toggle(settings: ZenModeSettings): Promise<void> {
    if (this.isZenMode) {
      await this.disable();
    } else {
      await this.enable(settings);
    }
  }

  async enable(settings: ZenModeSettings): Promise<void> {
    const app = this.plugin.app as unknown as ObsidianApp;
    const vault = app.vault;

    // 現在の状態を保存
    this.savedState = {
      theme: (vault.getConfig("theme") as string) ?? "moonstone",
      cssTheme: (vault.getConfig("cssTheme") as string) ?? "",
      readableLineLength: (vault.getConfig("readableLineLength") as boolean) ?? false,
      leftSidebarCollapsed: app.workspace.leftSplit?.containerEl.classList.contains("is-sidedock-collapsed") ?? true,
      rightSidebarCollapsed: app.workspace.rightSplit?.containerEl.classList.contains("is-sidedock-collapsed") ?? true,
    };

    // ライトテーマに変更
    await app.customCss.setTheme("");
    vault.setConfig("theme", "moonstone");
	vault.setConfig("cssTheme", "")

    // Readable line length をオン
    vault.setConfig("readableLineLength", true);

    // サイドバーを閉じる
    app.workspace.leftSplit?.collapse();
    app.workspace.rightSplit?.collapse();

    // スタイルを注入
    const style = document.createElement("style");
    style.id = ZEN_STYLE_ID;
    style.textContent = this.buildStyleText(settings);
    document.head.appendChild(style);

    // body にクラスを付与
    document.body.classList.add("zen-mode-active");

    this.activeSettings = { ...settings };
    this.isZenMode = true;
    await this.onPersist(this.savedState);
  }

  async restore(savedState: SavedState): Promise<void> {
    const app = this.plugin.app as unknown as ObsidianApp;
    const vault = app.vault;
    await app.customCss.setTheme(savedState.theme === "obsidian" ? "obsidian" : "");
    vault.setConfig("theme", savedState.theme);
    vault.setConfig("cssTheme", savedState.cssTheme);
    vault.setConfig("readableLineLength", savedState.readableLineLength);
    if (savedState.leftSidebarCollapsed) {
      app.workspace.leftSplit?.collapse();
    } else {
      app.workspace.leftSplit?.expand();
    }
    if (savedState.rightSidebarCollapsed) {
      app.workspace.rightSplit?.collapse();
    } else {
      app.workspace.rightSplit?.expand();
    }
    document.getElementById(ZEN_STYLE_ID)?.remove();
    document.body.classList.remove("zen-mode-active");
  }

  private buildStyleText(settings: ZenModeSettings): string {
    const parts: string[] = [
      `.zen-mode-active { --font-text: "${settings.font}"; --file-line-width: ${settings.contentWidth}px; }`,
    ];
    if (settings.hideStatusBar) {
      parts.push(`.zen-mode-active .status-bar { display: none !important; }`);
    }
    if (settings.hideInlineTitle) {
      parts.push(`.zen-mode-active .inline-title { display: none !important; }`);
    }
    if (settings.hideProperties) {
      parts.push(`.zen-mode-active .metadata-container { display: none !important; }`);
    }
    if (settings.hideBacklinks) {
      parts.push(`.zen-mode-active .backlink-pane { display: none !important; }`);
    }
    if (settings.paddingTop > 0 || settings.paddingBottom > 0) {
      parts.push(`.zen-mode-active .view-content { padding-top: ${settings.paddingTop}px !important; padding-bottom: ${settings.paddingBottom}px !important; }`);
    }
    return parts.join("\n");
  }

  applySettings(settings: ZenModeSettings): void {
    if (!this.isZenMode || !this.activeSettings) return;
    this.activeSettings = { ...settings };
    const style = document.getElementById(ZEN_STYLE_ID);
    if (style) style.textContent = this.buildStyleText(this.activeSettings);
  }

  applyFont(font: string): void {
    if (!this.isZenMode || !this.activeSettings) return;
    this.applySettings({ ...this.activeSettings, font });
  }

  async disable(): Promise<void> {
    if (!this.savedState) return;

    const app = this.plugin.app as unknown as ObsidianApp;
    const vault = app.vault;

    // 元の状態に戻す
    await app.customCss.setTheme(this.savedState.theme === "obsidian" ? "obsidian" : "");
    vault.setConfig("theme", this.savedState.theme);
	vault.setConfig("cssTheme", this.savedState.cssTheme)
    vault.setConfig("readableLineLength", this.savedState.readableLineLength);

    // サイドバーを元の状態に戻す（setTheme の副作用後に実行）
    const leftSidebarCollapsed = this.savedState.leftSidebarCollapsed;
    const rightSidebarCollapsed = this.savedState.rightSidebarCollapsed;
    setTimeout(() => {
      if (leftSidebarCollapsed) {
        app.workspace.leftSplit?.collapse();
      } else {
        app.workspace.leftSplit?.expand();
      }
      if (rightSidebarCollapsed) {
        app.workspace.rightSplit?.collapse();
      } else {
        app.workspace.rightSplit?.expand();
      }
    }, 0);

    // 注入したスタイルを削除
    document.getElementById(ZEN_STYLE_ID)?.remove();

    // body クラスを削除
    document.body.classList.remove("zen-mode-active");

    this.isZenMode = false;
    this.savedState = null;
    this.activeSettings = null;
    await this.onPersist(null);
  }
}
