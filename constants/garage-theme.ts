export const GarageTheme = {
  bg: '#070707',
  bgElevated: '#101010',
  bgSoft: '#171717',
  panel: '#121212',
  panelStrong: '#1a1a1a',
  border: '#26201a',
  borderStrong: '#4c3910',
  text: '#f6f1e8',
  textMuted: '#b8ae9a',
  textDim: '#847a68',
  gold: '#f2b705',
  goldBright: '#ffd54f',
  goldSoft: '#8c6900',
  glow: 'rgba(242, 183, 5, 0.18)',
  whiteGlow: 'rgba(255, 255, 255, 0.08)',
  success: '#38d39f',
  info: '#68b7ff',
  danger: '#ff8c6a',
};

export const GarageStatusColors: Record<string, string> = {
  Received: GarageTheme.goldBright,
  'In Progress': GarageTheme.info,
  Ready: GarageTheme.success,
  Completed: '#8a8a8a',
};
