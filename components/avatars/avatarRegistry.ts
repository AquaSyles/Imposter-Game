import type { ComponentType } from "react";
import type { AvatarType } from "@/firebase/avatarPrefs";

import { AstronautAvatar } from "@/components/avatars/AstronautAvatar";
import { RedAstronautAvatar } from "@/components/avatars/RedAstronautAvatar";
import { RobotAvatar } from "@/components/avatars/RobotAvatar"; // din nye

export type AvatarComponentProps = { size?: number; className?: string };

export const AVATAR_REGISTRY: Record<
  AvatarType,
  { label: string; Component: ComponentType<AvatarComponentProps> }
> = {
  classicAstronaut: { label: "Classic Astronaut", Component: AstronautAvatar },
  redAstronaut: { label: "Red Astronaut", Component: RedAstronautAvatar },
  robot: { label: "Robot", Component: RobotAvatar },
};

export const AVATAR_TYPES = Object.keys(AVATAR_REGISTRY) as AvatarType[];
