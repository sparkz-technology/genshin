import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GameAccount, Reward } from "@/app/types";

export async function GET() {
  try {
    console.log("Fetching settings from database...");
    const settings = await prisma.settings.findFirst();

    if (
      !settings ||
      !settings.cookie_token_v2 ||
      !settings.account_mid_v2 ||
      !settings.account_id_v2 ||
      !settings.ltoken_v2 ||
      !settings.ltuid_v2 ||
      !settings.act_id
    ) {
      await logError("Missing required settings in database");
      return NextResponse.json({ error: "Missing required settings in database" }, { status: 400 });
    }

    const cookies = [
      `cookie_token_v2=${settings.cookie_token_v2}`,
      `account_mid_v2=${settings.account_mid_v2}`,
      `account_id_v2=${settings.account_id_v2}`,
      `ltoken_v2=${settings.ltoken_v2}`,
      `ltuid_v2=${settings.ltuid_v2}`,
    ].join("; ");

    const client = new HoyolabClient(cookies, settings.act_id);

    const isValid = await client.verifyCookie();
    if (!isValid) {
      await logError("Invalid Hoyolab cookie");
      return NextResponse.json({ error: "Invalid Hoyolab cookie" }, { status: 401 });
    }

    const accounts = await client.getGameAccounts();
    if (!accounts.length) {
      await logError("No Genshin Impact account found");
      return NextResponse.json({ error: "No Genshin Impact account found" }, { status: 404 });
    }

    for (const account of accounts) {
      await client.checkIn(account);
    }

    // await logSuccess("Genshin Impact Daily Check-in Completed");
    return NextResponse.json({ message: "Genshin Impact Daily Check-in Completed!" });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await logError(errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Logs an error message to the database.
 */
async function logError(message: string) {
  console.error(message);
  await prisma.log.create({
    data: {
      message,
      status: "ERROR",
      type: "DAILY_CHECK_IN",
    },
  });
}

/**
 * Logs a success message to the database.
 */
async function logSuccess(message: string) {
  console.log(message);
  await prisma.log.create({
    data: {
      message,
      status: "SUCCESS",
      type: "DAILY_CHECK_IN",
    },
  });
}

class HoyolabClient {
  private headers: Record<string, string>;

  constructor(private cookie: string, private act_id: string) {
    this.headers = {
      Cookie: cookie,
      "User-Agent":
        process.env.USER_AGENT ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Referer: "https://act.hoyolab.com/",
      Origin: "https://act.hoyolab.com/",
      "Accept-Encoding": "gzip, deflate, br",
    };
  }

  private async _request<T>(url: string): Promise<T | null> {
    try {
      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Request error for ${url}:`, error);
      return null;
    }
  }

  async verifyCookie(): Promise<boolean> {
    const url = "https://api-account-os.hoyolab.com/auth/api/getUserAccountInfoByLToken";
    const res = await this._request<{ retcode: number }>(url);
    return res?.retcode === 0;
  }

  async getGameAccounts(): Promise<GameAccount[]> {
    const url = "https://api-os-takumi.hoyolab.com/binding/api/getUserGameRolesByCookie";
    const res = await this._request<{ data?: { list?: GameAccount[] } }>(url);
    return res?.data?.list?.filter((account) => account.game_biz === "hk4e_global") || [];
  }

  async checkIn(account: GameAccount): Promise<void> {
    const info_url = `https://sg-hk4e-api.hoyolab.com/event/sol/info?act_id=${this.act_id}`;
    const reward_url = `https://sg-hk4e-api.hoyolab.com/event/sol/home?act_id=${this.act_id}`;
    const sign_url = `https://sg-hk4e-api.hoyolab.com/event/sol/sign?act_id=${this.act_id}`;

    const infoRes = await this._request<{ data?: { is_sign: boolean; total_sign_day: number } }>(info_url);
    if (!infoRes?.data) return;

    const rewardsRes = await this._request<{ data?: { awards: Reward[] } }>(reward_url);
    if (!rewardsRes?.data?.awards) return;

    const { is_sign, total_sign_day } = infoRes.data;
    const rewards = rewardsRes.data.awards;

    if (!is_sign) {
      try {
        const signRes = await fetch(sign_url, {
          method: "POST",
          headers: this.headers,
        });

        const signResJson = await signRes.json();
        if (signResJson.retcode !== 0) {
          await logError(`Failed to check in: ${signResJson.message}`);
          return;
        }

        const reward = rewards[total_sign_day];
        await logSuccess(`Check-in successful for ${account.nickname}: ${reward.name} x ${reward.cnt}`);
      } catch (error) {
        await logError(`Check-in request failed for ${account.nickname}: ${error}`);
      }
    }
  }
}
