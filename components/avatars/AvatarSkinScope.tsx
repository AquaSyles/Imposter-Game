"use client";

import React from "react";
import styled from "styled-components";
import type { AvatarSkin } from "@/firebase/avatarPrefs";

type Props = {
  skin: AvatarSkin;
  children: React.ReactNode;
  className?: string;
};

export default function AvatarSkinScope({ skin, children, className }: Props) {
  return (
    <Wrap className={className} data-skin={skin}>
      {children}
    </Wrap>
  );
}

const Wrap = styled.div`
  --ring: #4f46e5;
  --avatarFilter: none;

  display: grid;
  place-items: center;

  &[data-skin="classic"] {
    --ring: #4f46e5;
    --avatarFilter: none;
  }

  &[data-skin="midnight"] {
    --ring: #1e40af;
    --avatarFilter: hue-rotate(215deg) saturate(1.35) brightness(0.78) contrast(1.25);
  }

  &[data-skin="mint"] {
    --ring: #ef4444;
    --avatarFilter: hue-rotate(350deg) saturate(1.55) brightness(0.98) contrast(1.18);
  }

  &[data-skin="sunset"] {
    --ring: #dd4878;
    --avatarFilter: hue-rotate(335deg) saturate(1.35) brightness(1.08) contrast(1.12);
  }

  &[data-skin="cyber"] {
    --ring: #22d3ee;
    --avatarFilter: hue-rotate(265deg) saturate(1.65) brightness(1.02) contrast(1.32);
  }
`;
