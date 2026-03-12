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

  private applyStyleVars(settings: ZenModeSettings): void {
    document.body.style.setProperty("--zen-font-text", `"${settings.font}"`);
    document.body.style.setProperty("--zen-file-line-width", `${settings.contentWidth}px`);
    document.body.style.setProperty("--zen-font-size", `${settings.fontSize}px`);
    document.body.style.setProperty("--zen-line-height", `${settings.lineHeight}`);
    document.body.style.setProperty("--zen-letter-spacing", `${settings.letterSpacing}em`);
    document.body.style.setProperty("--zen-paragraph-spacing", `${settings.paragraphSpacing}em`);
    document.body.style.setProperty("--zen-padding-top", `${settings.paddingTop}px`);
    document.body.style.setProperty("--zen-padding-bottom", `${settings.paddingBottom}px`);

    document.body.classList.toggle("zen-hide-status-bar", settings.hideStatusBar);
    document.body.classList.toggle("zen-hide-inline-title", settings.hideInlineTitle);
    document.body.classList.toggle("zen-hide-properties", settings.hideProperties);
    document.body.classList.toggle("zen-hide-backlinks", settings.hideBacklinks);
    document.body.classList.toggle("zen-hide-header", settings.hideHeader);
    document.body.classList.toggle("zen-hide-scrollbar", settings.hideScrollbar);
  }

  private removeStyleVars(): void {
    for (const v of ["--zen-font-text", "--zen-file-line-width", "--zen-font-size", "--zen-line-height", "--zen-letter-spacing", "--zen-paragraph-spacing", "--zen-padding-top", "--zen-padding-bottom"]) {
      document.body.style.removeProperty(v);
    }
    for (const c of ["zen-hide-status-bar", "zen-hide-inline-title", "zen-hide-properties", "zen-hide-backlinks", "zen-hide-header", "zen-hide-scrollbar"]) {
      document.body.classList.remove(c);
    }
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
    this.applyStyleVars(settings);
    document.body.classList.add("zen-mode-active");

    // サイドバーを閉じる
    app.workspace.leftSplit?.collapse();
    app.workspace.rightSplit?.collapse();

    // テーマを切り替え
    const resolvedTheme = this.resolveBaseTheme(settings.baseTheme);
    try {
      await app.customCss.setTheme(settings.cssTheme);
    } catch {
      new Notice("Zeno: community theme not found, using default.");
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
      new Notice("Zeno: could not restore community theme.");
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
    this.removeStyleVars();
    document.body.classList.remove("zen-mode-active");
  }

  applySettings(settings: ZenModeSettings): void {
    if (!this.isZenMode || !this.activeSettings) return;
    this.activeSettings = { ...settings };
    this.applyStyleVars(this.activeSettings);
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
      new Notice("Zeno: community theme not found, using default.");
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
      new Notice("Zeno: could not restore community theme.");
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

    // スタイル変数とクラスを削除
    this.removeStyleVars();
    document.body.classList.remove("zen-mode-active");

    this.isZenMode = false;
    this.savedState = null;
    this.activeSettings = null;
    await this.onPersist(null);
  }
}
