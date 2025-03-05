import { getScreenData } from "@/lib/action";
import GenshinRedeemContainer from "@/app/_components/container";
import { getServerSession } from "next-auth";
import NextAuth from "@/lib/auth";
import Header from "@/app/@components/header";
import InteractiveLanding from "./@components/InteractiveLanding";

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
        <Header data={data} session={session} />
        {!!session && data && <GenshinRedeemContainer data={data} />}
      </div>
  );
}
