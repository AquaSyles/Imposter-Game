import type { AvatarSkin, AvatarType } from "@/firebase/avatarPrefs";

export type Player = {
  uid: string;
  playerId: number;
  name: string;
  avatar: string;
  skin: AvatarSkin;
  avatarType?: AvatarType;
  joinedAt: number;
};
