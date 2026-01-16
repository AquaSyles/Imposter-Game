import { AvatarSkin } from "./player";

export type ElectricTheme = "blue" | "pink" | "red" | "green" | "purple";

export const ELECTRIC_THEME_BY_SKIN: Record<AvatarSkin, ElectricTheme> = {
  classic: "blue",
  midnight: "purple",
  mint: "green",
  sunset: "pink",
  cyber: "purple",
};
