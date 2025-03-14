"use server";

import { revalidatePath } from "next/cache";
import prisma from "./prisma";
import type { LogEntry } from "@/app/_components/types";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

async function fetchActiveCodes(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      return false;
    }
    const redeemCodes = await prisma.redeemCode.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { code: true },
    });

    await Promise.all(
      redeemCodes.map((item) =>
        prisma.redeemedCode.upsert({
          where: { code: item.code }, // Check if the code exists
          update: {}, // Keep existing records unchanged
          create: { code: item.code, status: "NOT_REDEEMED", userId: userId }, // Create new records
        })
      )
    );

    return true;
  } catch {
    return false;
  }
}

async function getRedeemedCodes(userId: string): Promise<Set<string>> {
  if (!userId) {
    return new Set();
  }
  const redeemedCodes = await prisma.redeemedCode.findMany({
    select: { code: true },
    where: {
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      status: "NOT_REDEEMED",
      userId: userId,
    },
  });
  return new Set(redeemedCodes.map((doc) => doc.code));
}

async function redeemCode(cdkey: string, userId: string): Promise<boolean> {
  try {
    if (!userId) {
      return false;
    }
    const settings = await prisma.settings.findFirst({ where: { userId: userId } });

    if (!settings) {
      return false;
    }
    console.log(settings);
    const baseUrl = "https://public-operation-hk4e.hoyoverse.com/common/apicdkey/api/webExchangeCdkey";
    const queryParams = new URLSearchParams({
      uid: settings.uid,
      region: settings.region,
      lang: settings.lang,
      cdkey: cdkey,
      game_biz: settings.gameBiz,
      sLangKey: settings.sLangKey,
    });

    const cookies = [
      `cookie_token_v2=${settings.cookieTokenV2.trim()}`,
      `account_mid_v2=${settings.accountMidV2.trim()}`,
      `account_id_v2=${settings.accountIdV2.trim()}`,
    ].join("; ");

    const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
      headers: {
        Cookie: cookies,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://webstatic-sea.hoyoverse.com/",
        Origin: "https://webstatic-sea.hoyoverse.com",
        Connection: "keep-alive",
        DNT: "1",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    const apiData = await response.json();

    if (apiData?.retcode === 0) {
      const data = await prisma.redeemedCode.update({ where: { code: cdkey }, data: { status: "REDEEMED" } });
      await prisma.log.create({
        data: {
          message: `${apiData?.message || "Successfully redeemed"}`,
          status: "REDEEMED",
          redeemedCodeId: data.id,
          userId: userId,
        },
      });
      return true;
    } else {
      const data = await prisma.redeemedCode.update({ where: { code: cdkey }, data: { status: "FAILED" } });
      await prisma.log.create({
        data: {
          message: `${apiData?.message || "Failed to redeem"}`,
          status: "FAILED",
          redeemedCodeId: data.id,
          userId: userId,
        },
      });
      return false;
    }
  } catch {
    return false;
  }
}

export async function processCodes() {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
   fetchActiveCodes(user.id);
    const redeemedCodes = await getRedeemedCodes(user.id);
    if (redeemedCodes.size > 0) {
      const code = redeemedCodes.values().next().value;
      if (code) {
        await redeemCode(code, user.id);
      }
    }
  }
}



export const updateSettings = async (setting: {
  uid: string;
  cookie_token_v2: string;
  account_mid_v2: string;
  account_id_v2: string;
  game_biz: string;
  ltuid_v2: string;
  ltoken_v2: string;
  act_id: string;
}) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return false;
    }
    await prisma.settings.upsert({
      where: { uid: setting.uid, userId: session.user.id },
      update: {
        ltuidV2: setting.ltuid_v2,
        ltokenV2: setting.ltoken_v2,
        cookieTokenV2: setting.cookie_token_v2,
        accountMidV2: setting.account_mid_v2,
        accountIdV2: setting.account_id_v2,
        gameBiz: setting.game_biz,
        actId: setting.act_id,
      },
      create: {
        userId: session.user.id,
        uid: setting.uid,
        region: "os_asia",
        lang: "en",
        gameBiz: setting.game_biz,
        sLangKey: "en-us",
        ltuidV2: setting.ltuid_v2,
        ltokenV2: setting.ltoken_v2,
        actId: setting.act_id,
        cookieTokenV2: setting.cookie_token_v2,
        accountMidV2: setting.account_mid_v2,
        accountIdV2: setting.account_id_v2,
      },
    });
    revalidatePath("/");
    return true;
  } catch {
    return false;
  }
};
const defaultSettings = {
  id: "",
  uid: "",
  region: "",
  lang: "en",
  gameBiz: "",
  sLangKey: "",
  cookieTokenV2: "",
  accountMidV2: "",
  accountIdV2: "",
  ltokenV2: "",
  ltuidV2: "",
  actId: "",
};
export const getSettings = async (userId: string) => {
  try {
    const settings = await prisma.settings.findFirst({ where: { userId } });
    console.log(settings);
    if (!settings) {
      return defaultSettings;
    }

    return settings;
  } catch {
    return defaultSettings;
  }
};

export const getLogs = async (userId: string) => {
  try {
    const logs = await prisma.log.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        message: true,
        status: true,
        createdAt: true,
        userId: true,
        type: true,
        redeemed: { select: { code: true } },
      },
    });

    const redeemLogs: LogEntry[] = logs
      .filter((log) => log.type !== "DAILY_CHECK_IN")
      .map((log) => ({
        id: log.id,
        message: log.message?.replace(process.env.REPLACE_FROM || "", process.env.REPLACE_TO || ""),
        status: log.status,
        createdAt: log.createdAt,
        code: log.redeemed?.code || "",
      }));

    const dailyCheckInLogs: LogEntry[] = logs
      .filter((log) => log.type == "DAILY_CHECK_IN")
      .map((log) => ({
        id: log.id,
        message: log.message?.replace(process.env.REPLACE_FROM || "", process.env.REPLACE_TO || ""),
        status: log.status,
        createdAt: log.createdAt,
        code: log.redeemed?.code || "",
      }));

    return { redeemLogs, dailyCheckInLogs };
  } catch {
    return { redeemLogs: [], dailyCheckInLogs: [] };
  }
};

export const getScreenData = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { settings: defaultSettings, logs: { redeemLogs: [], dailyCheckInLogs: [] } };
  }
  const [settings, logs] = await Promise.all([getSettings(session?.user?.id), getLogs(session?.user?.id)]);
  return { settings, logs };
};
