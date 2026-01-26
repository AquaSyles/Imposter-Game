import type { AvatarSkin} from "@/firebase/avatarPrefs";

export type ElectricTheme =
  | "blue"
  | "pink"
  | "red"
  | "green"
  | "purple"
  | "white"
  | "hotPink"
  | "deepBlue"
  | "blackEmits"
  | "deepGreen";


export const ELECTRIC_THEME_BY_SKIN: Record<AvatarSkin, ElectricTheme> = {
  classic: "blue",
  midnight: "purple",
  mint: "green",
  sunset: "pink",
  cyber: "purple",
};
