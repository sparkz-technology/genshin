import { Input } from "@/components/ui/input";
import { updateSettings } from "@/lib/action";
import { useFormik } from "formik";
import {  useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Settings } from "./types";
import {  Settings as SettingsIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ISettingsDialog  {
  data: Settings | null;
  hidden?: boolean;
}

const SettingsDialog: React.FC<ISettingsDialog> = ({ data, hidden }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      ...data,
      act_id: data?.act_id,
      ltoken_v2: data?.ltoken_v2,
      ltuid_v2: data?.ltuid_v2,
      game_biz: data?.game_biz,
      account_mid_v2: data?.account_mid_v2,
      account_id_v2: data?.account_id_v2,
      cookie_token_v2: data?.cookie_token_v2,
    },
    validationSchema: Yup.object({
      act_id: Yup.string().required("Required"),
      ltoken_v2: Yup.string().required("Required"),
      ltuid_v2: Yup.string().required("Required"),
      game_biz: Yup.string().required("Required"),
      cookie_token_v2: Yup.string().required("Cookie token is required"),
      account_mid_v2: Yup.string().required("Account MID is required"),
      account_id_v2: Yup.string().required("Account ID is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const { uid, ...rest } = values;
      const success = await updateSettings({
        uid: uid || "",
        act_id: rest.act_id || "",
        ltoken_v2: rest.ltoken_v2 || "",
        ltuid_v2: rest.ltuid_v2 || "",
        game_biz: rest.game_biz || "",
        account_mid_v2: rest.account_mid_v2 || "",
        account_id_v2: rest.account_id_v2 || "",
        cookie_token_v2: rest.cookie_token_v2 || ""
      });

      if (success) {
        toast.message("Settings Saved!", {
          description: "Your account settings have been updated successfully.",
        });
        resetForm();
      } else {
        toast.message("Save Failed", {
          description: "Unable to save settings. Please try again.",
        });
      }
    },
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen} key={isOpen ? "open" : "close"}>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => setIsOpen(true)} hidden={hidden}>
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] w-full">
          <DialogHeader>
            <DialogTitle>
              Settings
            </DialogTitle>
            <DialogDescription>
              Enter your Genshin Impact account details to redeem codes automatically and check-in daily.
            </DialogDescription>
          </DialogHeader>
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <form onSubmit={formik.handleSubmit} className="space-y-4" key={isOpen ? "open" : "close"}>
              <div className="flex gap-2 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="act_id">Act Id</Label>
                  <Input
                    id="act_id"
                    name="act_id"
                    value={formik.values.act_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={hidden}
                  />
                  {formik.touched.act_id && formik.errors.act_id ? (
                    <div className="text-sm text-red-500">{formik.errors.act_id}</div>
                  ) : null}
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="ltuid_v2">UID</Label>
                  <Input
                    id="ltuid_v2"
                    name="ltuid_v2"
                    value={formik.values.ltuid_v2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={hidden}
                  />
                  {formik.touched.ltuid_v2 && formik.errors.ltuid_v2 ? (
                    <div className="text-sm text-red-500">{formik.errors.ltuid_v2}</div>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="game_biz">Game Business</Label>
                  <Input
                    id="game_biz"
                    name="game_biz"
                    value={formik.values.game_biz}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={hidden}
                  />
                  {formik.touched.game_biz && formik.errors.game_biz ? (
                    <div className="text-sm text-red-500">{formik.errors.game_biz}</div>
                  ) : null}
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="account_mid_v2">Account MID</Label>
                  <Input
                    id="account_mid_v2"
                    name="account_mid_v2"
                    value={formik.values.account_mid_v2}
                    onChange={formik.handleChange}
                    disabled={hidden}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.account_mid_v2 && formik.errors.account_mid_v2 ? (
                    <div className="text-sm text-red-500">{formik.errors.account_mid_v2}</div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_id_v2">Account ID</Label>
                <Input
                  id="account_id_v2"
                  name="account_id_v2"
                  value={formik.values.account_id_v2}
                  disabled={hidden}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.account_id_v2 && formik.errors.account_id_v2 ? (
                  <div className="text-sm text-red-500">{formik.errors.account_id_v2}</div>
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
                  disabled={hidden}
                />
                {formik.touched.cookie_token_v2 && formik.errors.cookie_token_v2 ? (
                  <div className="text-sm text-red-500">{formik.errors.cookie_token_v2}</div>
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
                  disabled={hidden}
                />
                {formik.touched.ltoken_v2 && formik.errors.ltoken_v2 ? (
                  <div className="text-sm text-red-500">{formik.errors.ltoken_v2}</div>
                ) : null}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={formik.isSubmitting}>
                  Cancel
                </Button>
                
              <Button type="submit" disabled={formik.isSubmitting || hidden}>
                {formik.isSubmitting ? "Updateing..." : "Update Settings"}
              </Button>
            </div>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsDialog;
