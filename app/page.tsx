"use server";

import { getScreenData } from "@/lib/action";
import GenshinRedeemContainer from "./container";

export default async function GenshinRedeemPage() {
  const data = await getScreenData();
  if (!data || !data.settings) {
    return <div>Error: Settings not found</div>;
  }
  const defaultSettings = {
    id: "",
    uid: "",
    region: "",
    lang: "en",
    game_biz: "",
    sLangKey: "",
    cookie_token_v2: "",
    account_mid_v2: "",
    account_id_v2: "",
  };
  
  return <GenshinRedeemContainer data={{ ...data, settings: data.settings ?? defaultSettings }} />
}