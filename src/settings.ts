export interface ZenModeSettings {
  baseTheme: "moonstone" | "obsidian";
  cssTheme: string;
  backgroundColor: string;
  font: string;
  contentWidth: number;
  hideStatusBar: boolean;
  hideInlineTitle: boolean;
  hideProperties: boolean;
  hideBacklinks: boolean;
  hideHeader: boolean;
  hideScrollbar: boolean;
  fadeInDuration: number;
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
  backgroundColor: "#faf8ee",
  font: "Georgia",
  contentWidth: 900,
  hideStatusBar: true,
  hideInlineTitle: true,
  hideProperties: true,
  hideBacklinks: true,
  hideHeader: true,
  hideScrollbar: true,
  fadeInDuration: 300,
  fontSize: 18,
  lineHeight: 1.8,
  paragraphSpacing: 1.2,
  letterSpacing: 0,
  paddingTop: 60,
  paddingBottom: 60,
};
