export interface LogEntry {
  id: string;
  message: string;
  status: string;
  createdAt: Date;
  code?: string;
  type?: "REDEEMED" | "DAILY_CHECK_IN";
}

export interface Settings {
  id: string;
  uid: string;
  region: string;
  lang: string;
  game_biz: string;
  sLangKey: string;
  cookie_token_v2: string;
  account_mid_v2: string;
  account_id_v2: string;
  ltoken_v2: string;
  ltuid_v2: string;
  act_id: string;
}

export interface GameAccount {
  game_biz: string;
  region: string;
  game_uid: string;
  level: number;
  nickname: string;
}

export interface Reward {
  name: string;
  cnt: number;
  icon: string;
}