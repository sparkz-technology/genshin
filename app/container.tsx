"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/app/data-table";
import { ThemeToggle } from "@/app/theme-toggle";
import type { LogEntry } from "./types.js";
import { toast, Toaster } from "sonner";
import { useTheme } from "next-themes";
import { processCodes } from "@/lib/action";
import { GitPullRequestCreate } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { DAILY_CHECK_IN_COLUMNS, REDEEMED_COLUMNS } from "./columns";
import SettingsDialog from "./settings-dialog";

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

  const [canUpdate, setCanUpdate] = useState(false);
  let lastTap = 0; // For double tap detection

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "r") {
        event.preventDefault(); // Prevent refresh
        setCanUpdate((prev) => !prev); // Toggle state
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSecretTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      setCanUpdate((prev) => !prev); // Toggle on double tap
    }
    lastTap = now;
  };

  const handleTriggerRedeem = () => {
    processCodes();
    toast.message("Redeem Triggered", {
      description: "Redeem process has been triggered.",
    });
  };
console.log(data);
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <motion.h1
          className="text-3xl font-bold"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleSecretTap}
        >
          Genshin Impact Settings
        </motion.h1>
        <div className="flex space-x-4">
          <ThemeToggle />
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleTriggerRedeem} disabled={!canUpdate}>
                <GitPullRequestCreate className="h-5 w-5 text-purple-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Trigger</TooltipContent>
          </Tooltip>
          <SettingsDialog data={data.settings} disabled={!canUpdate} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Enter your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="act_id">Act Id</Label>
                  <Input
                    id="act_id"
                    name="act_id"
                    value={formik.values.act_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!canUpdate}
                  />
                  {formik.touched.act_id && formik.errors.act_id ? (
                    <div className="text-sm text-red-500">{formik.errors.act_id}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ltoken_v2">Token</Label>
                  <Textarea
                    id="ltoken_v2"
                    name="ltoken_v2"
                    value={formik.values.ltoken_v2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!canUpdate}
                  />
                  {formik.touched.ltoken_v2 && formik.errors.ltoken_v2 ? (
                    <div className="text-sm text-red-500">{formik.errors.ltoken_v2}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ltuid_v2">UID</Label>
                  <Input
                    id="ltuid_v2"
                    name="ltuid_v2"
                    value={formik.values.ltuid_v2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!canUpdate}
                  />
                  {formik.touched.ltuid_v2 && formik.errors.ltuid_v2 ? (
                    <div className="text-sm text-red-500">{formik.errors.ltuid_v2}</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="game_biz">Game Business</Label>
                  <Input
                    id="game_biz"
                    name="game_biz"
                    value={formik.values.game_biz}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!canUpdate}
                  />
                  {formik.touched.game_biz && formik.errors.game_biz ? (
                    <div className="text-sm text-red-500">{formik.errors.game_biz}</div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cookie_token_v2">Cookie Token</Label>
                  <Textarea
                    id="cookie_token_v2"
                    name="cookie_token_v2"
                    value={formik.values.cookie_token_v2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!canUpdate}
                  />
                  {formik.touched.cookie_token_v2 && formik.errors.cookie_token_v2 ? (
                    <div className="text-sm text-red-500">{formik.errors.cookie_token_v2}</div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_mid_v2">Account MID</Label>
                  <Input
                    id="account_mid_v2"
                    name="account_mid_v2"
                    value={formik.values.account_mid_v2}
                    onChange={formik.handleChange}
                    disabled={!canUpdate}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.account_mid_v2 && formik.errors.account_mid_v2 ? (
                    <div className="text-sm text-red-500">{formik.errors.account_mid_v2}</div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_id_v2">Account ID</Label>
                  <Input
                    id="account_id_v2"
                    name="account_id_v2"
                    value={formik.values.account_id_v2}
                    disabled={!canUpdate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.account_id_v2 && formik.errors.account_id_v2 ? (
                    <div className="text-sm text-red-500">{formik.errors.account_id_v2}</div>
                  ) : null}
                </div>

                <Button type="submit" className="w-full" disabled={formik.isSubmitting || !canUpdate}>
                  {formik.isSubmitting ? "Updateing..." : "Update Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div> */}
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
