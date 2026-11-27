export const CONFIG = {
  GOOGLE_CLIENT_ID: '306027444125-m0a614spn717rbt3iflsdjolu3skejjr.apps.googleusercontent.com',
  SHEET_ID: '1LnDtzpMVk_MIxgZZnA52Whm9xTB8k0JQNpTntEkga7o',
};

export const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
].join(' ');

// Net worth thresholds (USD) from the assignment
export const NET_WORTH = {
  ORANGE_FROM: 100_000, // < 100K  => red
  GREEN_FROM: 200_000,  // > 200K  => green, in between => orange
};

export const COLORS = {
  red: '#EF3022',
  orange: '#FDCA35',
  green: '#3A9F48',
};
