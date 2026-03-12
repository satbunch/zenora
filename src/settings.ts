export interface ZenModeSettings {
  baseTheme: "moonstone" | "obsidian" | "system";
  cssTheme: string;
  font: string;
  contentWidth: number;
  hideStatusBar: boolean;
  hideInlineTitle: boolean;
  hideProperties: boolean;
  hideBacklinks: boolean;
  hideHeader: boolean;
  hideScrollbar: boolean;
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  letterSpacing: number;
  paddingTop: number;
  paddingBottom: number;
}

export const DEFAULT_SETTINGS: ZenModeSettings = {
  baseTheme: "moonstone",
  cssTheme: "",
  font: "Georgia",
  contentWidth: 900,
  hideStatusBar: true,
  hideInlineTitle: true,
  hideProperties: true,
  hideBacklinks: true,
  hideHeader: true,
  hideScrollbar: true,
  fontSize: 18,
  lineHeight: 1.8,
  paragraphSpacing: 1.2,
  letterSpacing: 0,
  paddingTop: 60,
  paddingBottom: 60,
};
