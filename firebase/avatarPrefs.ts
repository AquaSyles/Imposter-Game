export type AvatarSkin = "classic" | "midnight" | "mint" | "sunset" | "cyber";
export type AvatarType = "classicAstronaut" | "redAstronaut" | "robot";
export type ElectricTheme = "blue" | "pink" | "red" | "green" | "purple" | "white" | "hotPink" | "deepBlue" | "blackEmits" | "deepGreen";

const SKIN_VALID = ["classic", "midnight", "mint", "sunset", "cyber"] as const;
const TYPE_VALID = ["classicAstronaut", "redAstronaut", "robot"] as const;
const ELECTRIC_THEME_VALID = ["blue", "pink", "red", "green", "purple", "white", "hotPink", "deepBlue", "blackEmits", "deepGreen"] as const;
const KEY_NAME = "imposter_name";

export const skinKey = (uid: string) => `imposter_skin:${uid}`;
export const typeKey = (uid: string) => `imposter_avatarType:${uid}`;
export const electricThemeKey = (uid: string) => `imposter_electricTheme:${uid}`;

export function readSkin(uid: string): AvatarSkin {
  if (typeof window === "undefined") return "classic";
  const raw = localStorage.getItem(skinKey(uid));
  return raw && (SKIN_VALID as readonly string[]).includes(raw) ? (raw as AvatarSkin) : "classic";
}

export function readType(uid: string): AvatarType {
  if (typeof window === "undefined") return "classicAstronaut";
  const raw = localStorage.getItem(typeKey(uid));
  return raw && (TYPE_VALID as readonly string[]).includes(raw) ? (raw as AvatarType) : "classicAstronaut";
}

export function writeSkin(uid: string, skin: AvatarSkin) {
  if (typeof window === "undefined") return;
  localStorage.setItem(skinKey(uid), skin);

  // 🔥 trigger update for other components
  window.dispatchEvent(new Event("imposter:avatarPrefs"));
}

export function writeType(uid: string, type: AvatarType) {
  if (typeof window === "undefined") return;
  localStorage.setItem(typeKey(uid), type);

  // 🔥 trigger update for other components
  window.dispatchEvent(new Event("imposter:avatarPrefs"));
}

export function readElectricTheme(uid: string): ElectricTheme {
  if (typeof window === "undefined") return "blue";
  const raw = localStorage.getItem(electricThemeKey(uid));
  return raw && (ELECTRIC_THEME_VALID as readonly string[]).includes(raw) 
    ? (raw as ElectricTheme) 
    : "blue";
}

export function writeElectricTheme(uid: string, theme: ElectricTheme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(electricThemeKey(uid), theme);
  
  // 🔥 trigger update for other components
  window.dispatchEvent(new Event("imposter:avatarPrefs"));
}

export type DisplayName = string;
export function readName(uid: string): DisplayName {
  if (typeof window === "undefined") return "";
  const v = localStorage.getItem(`${KEY_NAME}:${uid}`);
  return v ?? "";
}

export function writeName(uid: string, name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${KEY_NAME}:${uid}`, name);
}