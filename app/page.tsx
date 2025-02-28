"use server";

import { getScreenData } from "@/lib/action";
import GenshinRedeemContainer from "./container";

export const dynamic = "force-dynamic";

export default async function GenshinRedeemPage() {
  const data = await getScreenData();
  if (!data || !data.settings) {
    return <div>Error: Settings not found</div>;
  }
  return <GenshinRedeemContainer data={{ ...data }} />
}
