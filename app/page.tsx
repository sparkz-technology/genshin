import { getScreenData } from "@/lib/action";
import GenshinRedeemContainer from "@/app/_components/container";
import { getServerSession } from "next-auth";
import NextAuth from "@/lib/auth";
import Header from "@/app/_components/header";
import InteractiveLanding from "./_components/InteractiveLanding";

export const dynamic = "force-dynamic";

export default async function GenshinRedeemPage() {
  const session = await getServerSession(NextAuth) as object | null;
  let data = null;
  if (session) {
    data = await getScreenData();
  }

  return (
      <div className="container mx-auto py-10">
        <InteractiveLanding/>
        <Header data={data ? { settings: { 
          id: data.settings.id, 
          uid: data.settings.uid, 
          region: data.settings.region, 
          lang: data.settings.lang, 
          game_biz: data.settings.gameBiz, 
          sLangKey: data.settings.sLangKey, 
          cookie_token_v2: data.settings.cookieTokenV2, 
          account_mid_v2: data.settings.accountMidV2, 
          account_id_v2: data.settings.accountIdV2, 
          ltoken_v2: data.settings.ltokenV2, 
          ltuid_v2: data.settings.ltuidV2, 
          act_id: data.settings.actId 
        }} : null} session={session} />
        {!!session && data && <GenshinRedeemContainer data={data} />}
      </div>
  );
}
