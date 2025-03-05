"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/app/@components/data-table";
import type { LogEntry } from "@/app/types";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { DAILY_CHECK_IN_COLUMNS, REDEEMED_COLUMNS } from "./columns";

interface GenshinRedeemContainerProps {
  data: {
    logs: {
      redeemLogs: LogEntry[];
      dailyCheckInLogs: LogEntry[];
    };
    settings: {
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
    };
  };
}

export default function GenshinRedeemContainer({ data }: GenshinRedeemContainerProps) {
  const { theme } = useTheme();


  return (
    <div className="container mx-auto py-10">
      {/* <div className="flex justify-between items-center mb-8">
        <motion.h1
          className="text-3xl font-bold"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Genshin Impact Dashboard
        </motion.h1>
        <div className="flex space-x-4">
          <ThemeToggle />
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleTriggerRedeem} hidden={!session}>
                <GitPullRequestCreate className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Trigger</TooltipContent>
          </Tooltip>
          <SettingsDialog data={data.settings} hidden={!session} />
          <AuthButtons session={session} />
        </div>
      </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Check-In History</CardTitle>
            <CardDescription>History of your daily check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={DAILY_CHECK_IN_COLUMNS} data={data.logs?.dailyCheckInLogs} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Redemption History</CardTitle>
            <CardDescription>History of your redemption attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={REDEEMED_COLUMNS} data={data.logs?.redeemLogs} />
          </CardContent>
        </Card>
      </div>
      <Toaster richColors position="top-right" theme={(theme as "system" | "light" | "dark" | undefined) ?? "system"} />
    </div>
  );
}
