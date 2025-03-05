"use client";
import SettingsDialog from "./settings-dialog";
import { AuthButtons } from "./auth-button";
import { ThemeToggle } from "./theme-toggle";

interface IHeader {
  session: object | null;
  data: {
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
  } | null;
}

const Header: React.FC<IHeader> = (props) => {

  return (
    <div className="flex justify-end items-center mb-8">
      <div className="flex space-x-4">
        <ThemeToggle />
        {props.data && props.data.settings && <SettingsDialog data={props.data.settings} hidden={!props.session} />}
        <AuthButtons session={props.session} />
      </div>
    </div>
  );
};

export default Header;
