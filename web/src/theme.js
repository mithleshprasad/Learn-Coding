import { theme } from 'antd';

// GeeksforGeeks-inspired dark theme: near-black surfaces, GFG's signature
// green accent, flat (non-gradient) chrome.
export const themeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#2f8d46',
    colorLink: '#3fa85c',
    colorLinkHover: '#4ecb70',
    colorTextHeading: '#e6edf3',
    borderRadius: 8,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    colorBgBase: '#0d1117',
    colorBgContainer: '#161b22',
    colorBgElevated: '#1c2128',
    colorBgLayout: '#0d1117',
    colorBorder: '#30363d',
    colorBorderSecondary: '#21262d',
  },
};

export const brand = {
  bg: '#0d1117',
  surface: '#161b22',
  surfaceAlt: '#1c2128',
  border: '#30363d',
  text: '#e6edf3',
  textMuted: '#9198a1',
  green: '#2f8d46',
  greenBright: '#4ecb70',
  greenDark: '#1f6b31',
};
