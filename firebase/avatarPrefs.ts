export type AvatarSkin = "classic" | "midnight" | "mint" | "sunset" | "cyber";
export type AvatarType = "classicAstronaut" | "redAstronaut";

const SKIN_VALID = ["classic", "midnight", "mint", "sunset", "cyber"] as const;
const TYPE_VALID = ["classicAstronaut", "redAstronaut"] as const;

export const skinKey = (uid: string) => `imposter_skin:${uid}`;
export const typeKey = (uid: string) => `imposter_avatarType:${uid}`;

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
