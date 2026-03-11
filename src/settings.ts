export interface ZenModeSettings {
  font: string;
  contentWidth: number;
  hideStatusBar: boolean;
  hideInlineTitle: boolean;
  hideProperties: boolean;
  hideBacklinks: boolean;
  paddingTop: number;
  paddingBottom: number;
}

export const DEFAULT_SETTINGS: ZenModeSettings = {
  font: "Georgia",
  contentWidth: 900,
  hideStatusBar: true,
  hideInlineTitle: true,
  hideProperties: true,
  hideBacklinks: true,
  paddingTop: 60,
  paddingBottom: 60,
};
