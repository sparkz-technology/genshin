"use server";

import { revalidatePath } from "next/cache";
import prisma from "./prisma";
import { LogEntry } from "@/app/types";

async function fetchActiveCodes(): Promise<string[]> {
  try {
    const response = await fetch("https://genshin-impact.fandom.com/wiki/Promotional_Code");
    const text = await response.text();

    const codes = [...text.matchAll(/<code>(.*?)<\/code>/g)].map((match) => match[1]);

    const uniqueCodes = [...new Set(codes)];

    await Promise.all(
      uniqueCodes.map((code) =>
        prisma.redeemedCode.upsert({
          where: { code: code }, // Check if the code exists
          update: {}, // Keep existing records unchanged
          create: { code, status: "NOT_REDEEMED" }, // Insert new codes
        })
      )
    );

    return uniqueCodes;
  } catch (error) {
    return [];
  }
}

async function getRedeemedCodes(): Promise<Set<string>> {
  const redeemedCodes = await prisma.redeemedCode.findMany({
    select: { code: true },
    where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, status: "NOT_REDEEMED" },
  });
  return new Set(redeemedCodes.map((doc) => doc.code));
}

const settings = await prisma.settings.findFirst();

async function redeemCode(cdkey: string): Promise<boolean> {
  try {
    if (!settings) {
      return false;
    }
    const baseUrl = "https://public-operation-hk4e.hoyoverse.com/common/apicdkey/api/webExchangeCdkey";
    const queryParams = new URLSearchParams({
      uid: settings.uid,
      region: settings.region,
      lang: settings.lang,
      cdkey: cdkey,
      game_biz: settings.game_biz,
      sLangKey: settings.sLangKey,
    });

    const cookies = [
      `cookie_token_v2=${settings.cookie_token_v2}`,
      `account_mid_v2=${settings.account_mid_v2}`,
      `account_id_v2=${settings.account_id_v2}`,
    ].join("; ");

    const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
      headers: {
        Cookie: cookies,
        "User-Agent": "Mozilla/5.0",
      },
    });

    const apiData = await response.json();

    if (apiData?.retcode === 0) {
      const data = await prisma.redeemedCode.update({ where: { code: cdkey }, data: { status: "REDEEMED" } });
      await prisma.log.create({
        data: { message: `Successfully redeemed `, status: "REDEEMED", redeemedCodeId: data.id },
      });
      return true;
    } else {
      const data = await prisma.redeemedCode.update({ where: { code: cdkey }, data: { status: "FAILED" } });
      await prisma.log.create({
        data: { message: `${apiData?.message || "Failed to redeem"}`, status: "FAILED", redeemedCodeId: data.id },
      });
      return false;
    }
  } catch {
    return false;
  }
}

export async function processCodes() {
  await fetchActiveCodes();
  const redeemedCodes = await getRedeemedCodes();
  redeemedCodes.forEach((code) => redeemCode(code));
}

export const updateSettings = async (setting: {
  uid: string;
  cookie_token_v2: string;
  account_mid_v2: string;
  account_id_v2: string;
  game_biz: string;
}) => {
  try {
    await prisma.settings.upsert({
      where: { uid: setting.uid },
      update: {
        cookie_token_v2: setting.cookie_token_v2,
        account_mid_v2: setting.account_mid_v2,
        account_id_v2: setting.account_id_v2,
        game_biz: setting.game_biz,
      },
      create: {
        uid: setting.uid,
        region: "os_asia",
        lang: "en",
        game_biz: setting.game_biz,
        sLangKey: "en-us",
        cookie_token_v2: setting.cookie_token_v2,
        account_mid_v2: setting.account_mid_v2,
        account_id_v2: setting.account_id_v2,
      },
    });
    revalidatePath("/");
    return true;
  } catch (error) {
    return false;
  }
};

export const getSettings = async () => {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings) {
      return null;
    }

    return settings;
  } catch (error) {
    return null;
  }
};

export const getLogs = async () => {
  try {
    const logs = await prisma.log.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        message: true,
        status: true,
        createdAt: true,
        redeemed: { select: { code: true } },
      },
    });
    const formattedLogs: LogEntry[] = logs.map((log) => ({
      id: log.id,
      message: log.message,
      status: log.status,
      createdAt: log.createdAt,
      code: log.redeemed?.code || "", // Handle missing `redeemed`
    }));

    return formattedLogs;
  } catch (error) {
    return [];
  }
};

export const getScreenData = async () => {
  const [settings, logs] = await Promise.all([getSettings(), getLogs()]);
  return { settings, logs };
};
