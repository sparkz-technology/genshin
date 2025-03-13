import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GameAccount, Reward } from "@/app/_components/types";

export async function GET() {
  try {
    console.log("Fetching settings from database...");
    const settingsArray = await prisma.settings.findMany();

    if (!settingsArray || settingsArray.length === 0) {
      return NextResponse.json({ error: "No settings found in database" }, { status: 404 });
    }

    const results = [];
    const errors = [];

    for (const settings of settingsArray) {
      try {
        if (
          !settings.cookieTokenV2 ||
          !settings.accountMidV2 ||
          !settings.accountIdV2 ||
          !settings.ltokenV2 ||
          !settings.ltuidV2 ||
          !settings.actId
        ) {
          const errorMsg = `Missing required settings`;
          await logError(errorMsg, settings.userId);
          errors.push({ userId: settings.userId, error: errorMsg });
          continue; // Skip to next setting
        }

        const cookies = [
          `cookie_token_v2=${settings.cookieTokenV2.trim()}`,
          `account_mid_v2=${settings.accountMidV2.trim()}`,
          `account_id_v2=${settings.accountIdV2.trim()}`,
          `ltoken_v2=${settings.ltokenV2.trim()}`,
          `ltuid_v2=${settings.ltuidV2.trim()}`,
        ].join("; ");

        const client = new HoyolabClient(cookies, settings.actId);

        const isValid = await client.verifyCookie();
        if (!isValid) {
          const errorMsg = `Invalid Hoyolab cookie`;
          await logError(errorMsg, settings.userId);
          errors.push({ userId: settings.userId, error: errorMsg });
          continue; // Skip to next setting
        }

        const accounts = await client.getGameAccounts();
        if (!accounts.length) {
          const errorMsg = `No Genshin Impact account found`;
          await logError(errorMsg, settings.userId);
          errors.push({ userId: settings.userId, error: errorMsg });
          continue; // Skip to next setting
        }

        const accountResults = [];
        for (const account of accounts) {
          try {
            const checkInResult = await client.checkIn(account);
            await logSuccess(checkInResult, settings.userId);
            accountResults.push(checkInResult);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            await logError(errorMessage, settings.userId);
            errors.push({ userId: settings.userId, error: errorMessage });
          }
        }

        results.push({
          userId: settings.userId,
          message: "Check-in completed successfully",
          accounts: accountResults,
        });
      } catch (settingError) {
        const errorMessage = settingError instanceof Error ? settingError.message : "Unknown error";
        const errorMsg = `Error processing : ${errorMessage}`;
        await logError(errorMsg, settings.userId);
        errors.push({ userId: settings.userId, error: errorMsg });
      }
    }
    return NextResponse.json({
      message: "Genshin Impact Daily Check-in process completed",
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await logError(errorMessage, "Unknown");
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function logError(message: string, userId: string) {
  console.error(message);
  await prisma.log.create({
    data: {
      userId,
      message,
      status: "ERROR",
      type: "DAILY_CHECK_IN",
    },
  });
}


async function logSuccess(message: string, userId: string) {
  console.log(message);
  await prisma.log.create({
    data: {
      userId,
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

  async checkIn(account: GameAccount): Promise<string> {
    const info_url = `https://sg-hk4e-api.hoyolab.com/event/sol/info?act_id=${this.act_id}`;
    const reward_url = `https://sg-hk4e-api.hoyolab.com/event/sol/home?act_id=${this.act_id}`;
    const sign_url = `https://sg-hk4e-api.hoyolab.com/event/sol/sign?act_id=${this.act_id}`;

    const infoRes = await this._request<{ data?: { is_sign: boolean; total_sign_day: number } }>(info_url);
    if (!infoRes?.data) return `Failed to fetch check-in info for ${account.nickname}`;

    const rewardsRes = await this._request<{ data?: { awards: Reward[] } }>(reward_url);
    if (!rewardsRes?.data?.awards) return `Failed to fetch check-in rewards for ${account.nickname}`;

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
          return `Failed to check in: ${signResJson.message}`;
        }

        const reward = rewards[total_sign_day];
        return `Check-in successful for ${account.nickname}: ${reward.name} x ${reward.cnt}`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Error checking in for ${account.nickname}: ${errorMessage}`);
      }
    }
    return `Already checked in for ${account.nickname}`;
  }
}
