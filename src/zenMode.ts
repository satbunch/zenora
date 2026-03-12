import { Notice, Plugin } from "obsidian";
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
  private systemThemeMQ: MediaQueryList | null = null;
  private systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null;

  constructor(plugin: Plugin, onPersist: (state: SavedState | null) => Promise<void>) {
    this.plugin = plugin;
    this.onPersist = onPersist;
  }

  get active(): boolean {
    return this.isZenMode;
  }

  private resolveBaseTheme(baseTheme: string): string {
    if (baseTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "obsidian" : "moonstone";
    }
    return baseTheme;
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

    // まず非表示にする（テーマ切り替え前にUIを隠す）
    const style = document.createElement("style");
    style.id = ZEN_STYLE_ID;
    style.textContent = this.buildStyleText(settings);
    document.head.appendChild(style);
    document.body.classList.add("zen-mode-active");

    // サイドバーを閉じる
    app.workspace.leftSplit?.collapse();
    app.workspace.rightSplit?.collapse();

    // テーマを切り替え
    const resolvedTheme = this.resolveBaseTheme(settings.baseTheme);
    try {
      await app.customCss.setTheme(settings.cssTheme);
    } catch {
      new Notice("Zenora: Community theme not found, using default.");
    }
    vault.setConfig("theme", resolvedTheme);
    vault.setConfig("cssTheme", settings.cssTheme);

    // システムテーマ追従リスナーを登録
    if (settings.baseTheme === "system") {
      this.systemThemeMQ = window.matchMedia("(prefers-color-scheme: dark)");
      this.systemThemeListener = (e: MediaQueryListEvent) => {
        const theme = e.matches ? "obsidian" : "moonstone";
        vault.setConfig("theme", theme);
        // customCss.setTheme は非同期だが、OS 変化時は fire-and-forget で十分
        app.customCss.setTheme(this.activeSettings?.cssTheme ?? "").catch(() => {});
      };
      this.systemThemeMQ.addEventListener("change", this.systemThemeListener);
    }

    // Readable line length をオン
    vault.setConfig("readableLineLength", true);

    this.activeSettings = { ...settings };
    this.isZenMode = true;
    await this.onPersist(this.savedState);
  }

  async restore(savedState: SavedState): Promise<void> {
    const app = this.plugin.app as unknown as ObsidianApp;
    const vault = app.vault;
    try {
      await app.customCss.setTheme(savedState.cssTheme);
    } catch {
      new Notice("Zenora: Could not restore community theme.");
    }
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
      `.zen-mode-active { --font-text: "${settings.font}"; --file-line-width: ${settings.contentWidth}px; --font-text-size: ${settings.fontSize}px; --line-height-normal: ${settings.lineHeight}; --letter-spacing-normal: ${settings.letterSpacing}em; }`,
      `.zen-mode-active .cm-content, .zen-mode-active .markdown-preview-view { letter-spacing: ${settings.letterSpacing}em; }`,
      `.zen-mode-active .markdown-preview-view p { margin-bottom: ${settings.paragraphSpacing}em; }`,
    ];
    if (settings.hideStatusBar) {
      parts.push(`.zen-mode-active .status-bar { display: none !important; }`);
    }
    if (settings.hideInlineTitle) {
      parts.push(`.zen-mode-active .inline-title { display: none !important; }`);
    }
    if (settings.hideProperties) {
      parts.push(`.zen-mode-active .metadata-container, .zen-mode-active .metadata-properties { display: none !important; }`);
    }
    if (settings.hideBacklinks) {
      parts.push(`.zen-mode-active .backlink-pane, .zen-mode-active .workspace-leaf-content[data-type="backlink"] { display: none !important; }`);
      parts.push(`.zen-mode-active .embedded-backlinks { display: none !important; }`);
    }
    if (settings.hideHeader) {
      parts.push(`.zen-mode-active .view-header { display: none !important; }`);
    }
    if (settings.hideScrollbar) {
      parts.push(`.zen-mode-active .cm-scroller::-webkit-scrollbar, .zen-mode-active .markdown-preview-view::-webkit-scrollbar { display: none !important; }`);
      parts.push(`.zen-mode-active .cm-scroller, .zen-mode-active .markdown-preview-view { scrollbar-width: none; }`);
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

  async applyTheme(baseTheme: string, cssTheme: string): Promise<void> {
    if (!this.isZenMode) return;
    const app = this.plugin.app as unknown as ObsidianApp;

    // システムテーマリスナーを付け替え
    if (this.systemThemeMQ && this.systemThemeListener) {
      this.systemThemeMQ.removeEventListener("change", this.systemThemeListener);
      this.systemThemeMQ = null;
      this.systemThemeListener = null;
    }
    if (baseTheme === "system") {
      this.systemThemeMQ = window.matchMedia("(prefers-color-scheme: dark)");
      this.systemThemeListener = (e: MediaQueryListEvent) => {
        const theme = e.matches ? "obsidian" : "moonstone";
        app.vault.setConfig("theme", theme);
        app.customCss.setTheme(this.activeSettings?.cssTheme ?? "").catch(() => {});
      };
      this.systemThemeMQ.addEventListener("change", this.systemThemeListener);
    }

    try {
      await app.customCss.setTheme(cssTheme);
    } catch {
      new Notice("Zenora: Community theme not found, using default.");
    }
    app.vault.setConfig("theme", this.resolveBaseTheme(baseTheme));
    app.vault.setConfig("cssTheme", cssTheme);
  }

  async disable(): Promise<void> {
    if (!this.savedState) return;

    // システムテーマリスナーを解除
    if (this.systemThemeMQ && this.systemThemeListener) {
      this.systemThemeMQ.removeEventListener("change", this.systemThemeListener);
      this.systemThemeMQ = null;
      this.systemThemeListener = null;
    }

    const app = this.plugin.app as unknown as ObsidianApp;
    const vault = app.vault;

    // 元の状態に戻す
    try {
      await app.customCss.setTheme(this.savedState.cssTheme);
    } catch {
      new Notice("Zenora: Could not restore community theme.");
    }
    vault.setConfig("theme", this.savedState.theme);
    vault.setConfig("cssTheme", this.savedState.cssTheme);
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
