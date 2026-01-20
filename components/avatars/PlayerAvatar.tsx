"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { AvatarType } from "@/firebase/avatarPrefs";
import { readType } from "@/firebase/avatarPrefs";
import { AVATAR_REGISTRY } from "@/components/avatars/avatarRegistry";

type PlayerAvatarProps = {
  size?: number;
  className?: string;

  /** Bruk enten uid eller type */
  uid?: string;
  type?: AvatarType;

  /** fallback hvis ingenting finnes */
  fallbackType?: AvatarType;
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  size = 60,
  className,
  uid,
  type,
  fallbackType = "classicAstronaut",
}) => {
  const [resolvedType, setResolvedType] = useState<AvatarType>(fallbackType);

  useEffect(() => {
    // hvis type er gitt, bruk den
    if (type) {
      setResolvedType(type);
      return;
    }

    // hvis uid er gitt, les prefs
    if (uid) {
      const apply = () => setResolvedType(readType(uid) ?? fallbackType);
      apply();
      window.addEventListener("imposter:avatarPrefs", apply);
      return () => window.removeEventListener("imposter:avatarPrefs", apply);
    }

    // fallback
    setResolvedType(fallbackType);
  }, [uid, type, fallbackType]);

  const Comp = useMemo(() => {
    return AVATAR_REGISTRY[resolvedType]?.Component ?? AVATAR_REGISTRY[fallbackType].Component;
  }, [resolvedType, fallbackType]);

  return <Comp size={size} className={className} />;
};
