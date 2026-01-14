"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import styled, { css } from "styled-components";
import { AstronautAvatar } from "@/components/avatars/AstronautAvatar";
import { RedAstronautAvatar } from "@/components/avatars/RedAstronautAvatar";

// ✅ BRUK KUN disse (ikke redefiner lokalt)
import {
  readSkin,
  readType,
  writeSkin,
  writeType,
  type AvatarSkin,
  type AvatarType,
} from "@/firebase/avatarPrefs";

/* ---------------- props ---------------- */

type SettingsPanelProps = {
  uid: string;
  initialSkin?: AvatarSkin;
  initialAvatarType?: AvatarType;
  onSkinChange?: (skin: AvatarSkin) => void;
  onAvatarTypeChange?: (type: AvatarType) => void;
};

/* ---------------- component ---------------- */

export default function SettingsPanel({
  uid,
  initialSkin,
  initialAvatarType,
  onSkinChange,
  onAvatarTypeChange,
}: SettingsPanelProps) {
  const [skin, setSkin] = useState<AvatarSkin>("classic");
  const [avatarType, setAvatarType] = useState<AvatarType>("classicAstronaut");

  useEffect(() => {
    setSkin(initialSkin ?? readSkin(uid));
    setAvatarType(initialAvatarType ?? readType(uid));
  }, [uid, initialSkin, initialAvatarType]);

  const selectSkin = useCallback(
    (next: AvatarSkin) => {
      setSkin(next);
      writeSkin(uid, next);
      onSkinChange?.(next);

      // 🔥 notify the app
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("imposter:avatarPrefs"));
      }
    },
    [uid, onSkinChange]
  );

  const selectAvatarType = useCallback(
    (next: AvatarType) => {
      setAvatarType(next);
      writeType(uid, next);
      onAvatarTypeChange?.(next);

      // 🔥 notify the app
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("imposter:avatarPrefs"));
      }
    },
    [uid, onAvatarTypeChange]
  );

  const previewSize = 200;

  const PreviewAvatar = useMemo(() => {
    return avatarType === "redAstronaut" ? RedAstronautAvatar : AstronautAvatar;
  }, [avatarType]);

  return (
    <Wrap>
      <Header>
        <Title>Settings</Title>
        <Subtitle>Pick your avatar + skin. Saved per uid.</Subtitle>
      </Header>

      <Grid>
        <Card>
          <CardTitle>Avatar Preview</CardTitle>
          <PreviewRow>
            <BigAvatarFrame>
              <SkinScope data-skin={skin}>
                <PreviewAvatar size={previewSize} />
              </SkinScope>
            </BigAvatarFrame>

            <MiniInfo>
              <InfoLine>
                <Label>UID</Label>
                <Value title={uid}>{uid}</Value>
              </InfoLine>
              <InfoLine>
                <Label>Avatar</Label>
                <Value>{avatarType}</Value>
              </InfoLine>
              <InfoLine>
                <Label>Skin</Label>
                <Value>{skin}</Value>
              </InfoLine>
              <Hint>Preview is large so you can see details.</Hint>
            </MiniInfo>
          </PreviewRow>
        </Card>

        <Card>
          <CardTitle>Choose Avatar</CardTitle>
          <ChoiceGrid>
            <ChoiceButton
              type="button"
              $active={avatarType === "classicAstronaut"}
              onClick={() => selectAvatarType("classicAstronaut")}
            >
              <ChoiceThumb>
                <SkinScope data-skin={skin}>
                  <AstronautAvatar size={84} />
                </SkinScope>
              </ChoiceThumb>
              <ChoiceMeta>
                <ChoiceName>Classic Astronaut</ChoiceName>
                <ChoiceDesc>Your original avatar.</ChoiceDesc>
              </ChoiceMeta>
            </ChoiceButton>

            <ChoiceButton
              type="button"
              $active={avatarType === "redAstronaut"}
              onClick={() => selectAvatarType("redAstronaut")}
            >
              <ChoiceThumb>
                <SkinScope data-skin={skin}>
                  <RedAstronautAvatar size={84} />
                </SkinScope>
              </ChoiceThumb>
              <ChoiceMeta>
                <ChoiceName>Red Astronaut</ChoiceName>
                <ChoiceDesc>Backpack + red details.</ChoiceDesc>
              </ChoiceMeta>
            </ChoiceButton>
          </ChoiceGrid>

          <Divider />

          <CardTitle>Skins (filter-based for now)</CardTitle>
          <SkinGrid>
            {SKINS.map((s) => (
              <SkinButton
                key={s.id}
                type="button"
                $active={skin === s.id}
                onClick={() => selectSkin(s.id)}
              >
                <SkinThumb>
                  <SkinScope data-skin={s.id}>
                    <PreviewAvatar size={72} />
                  </SkinScope>
                </SkinThumb>
                <SkinMeta>
                  <SkinName>{s.name}</SkinName>
                  <SkinDesc>{s.desc}</SkinDesc>
                </SkinMeta>
              </SkinButton>
            ))}
          </SkinGrid>
        </Card>
      </Grid>
    </Wrap>
  );
}

/* ---------------- skins list ---------------- */

const SKINS: Array<{ id: AvatarSkin; name: string; desc: string }> = [
  { id: "classic", name: "Classic", desc: "Original look." },
  { id: "midnight", name: "Midnight", desc: "Darker + neon-ish." },
  { id: "mint", name: "Mint", desc: "Fresh mint tones." },
  { id: "sunset", name: "Sunset", desc: "Warm highlights." },
  { id: "cyber", name: "Cyber", desc: "High-contrast vibe." },
];

/* ---------------- styled ---------------- */

const Wrap = styled.section`
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 1.5rem;
  color: #e5e7eb;
`;

const Header = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 2rem;
  letter-spacing: 0.02em;
  background: linear-gradient(45deg, #818cf8, #c7d2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  margin: 0.35rem 0 0;
  color: #94a3b8;
  font-size: 0.95rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1rem;
  backdrop-filter: blur(6px);
`;

const CardTitle = styled.div`
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 0.75rem;
`;

const Divider = styled.div`
  height: 1px;
  margin: 1rem 0;
  background: rgba(255, 255, 255, 0.08);
`;

const PreviewRow = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
`;

const BigAvatarFrame = styled.div`
  width: 240px;
  height: 240px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  background: radial-gradient(
    circle at 50% 35%,
    rgba(99, 102, 241, 0.18) 0%,
    rgba(15, 23, 42, 0) 70%
  );
  border: 1px solid rgba(99, 102, 241, 0.25);
`;

const MiniInfo = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const InfoLine = styled.div`
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 0.75rem;
  align-items: baseline;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.div`
  color: #94a3b8;
  font-size: 0.85rem;
`;

const Value = styled.div`
  color: #e2e8f0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Hint = styled.div`
  margin-top: 0.25rem;
  color: #94a3b8;
  font-size: 0.9rem;
`;

/* ---- avatar type choices ---- */

const ChoiceGrid = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const ChoiceButton = styled.button<{ $active?: boolean }>`
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(30, 41, 59, 0.55);
  border-radius: 12px;
  padding: 0.75rem;
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 0.75rem;
  cursor: pointer;
  text-align: left;
  transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(99, 102, 241, 0.45);
    background: rgba(30, 41, 59, 0.75);
  }

  ${({ $active }) =>
    $active &&
    css`
      border-color: rgba(99, 102, 241, 0.9);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
    `}
`;

const ChoiceThumb = styled.div`
  width: 96px;
  height: 78px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(2, 6, 23, 0.35);
  overflow: hidden;
`;

const ChoiceMeta = styled.div`
  display: grid;
  gap: 0.25rem;
  align-content: center;
`;

const ChoiceName = styled.div`
  font-weight: 700;
  color: #e2e8f0;
`;

const ChoiceDesc = styled.div`
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.25rem;
`;

/* ---- skins list ---- */

const SkinGrid = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const SkinButton = styled.button<{ $active?: boolean }>`
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(30, 41, 59, 0.55);
  border-radius: 12px;
  padding: 0.75rem;
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 0.75rem;
  cursor: pointer;
  text-align: left;
  transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(99, 102, 241, 0.45);
    background: rgba(30, 41, 59, 0.75);
  }

  ${({ $active }) =>
    $active &&
    css`
      border-color: rgba(99, 102, 241, 0.9);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
    `}
`;

const SkinThumb = styled.div`
  width: 88px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(2, 6, 23, 0.35);
  overflow: hidden;
`;

const SkinMeta = styled.div`
  display: grid;
  gap: 0.25rem;
  align-content: center;
`;

const SkinName = styled.div`
  font-weight: 700;
  color: #e2e8f0;
`;

const SkinDesc = styled.div`
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.25rem;
`;

/* ---------------- SkinScope ---------------- */

const SkinScope = styled.div`
  --hue: 0deg;
  --sat: 1;
  --bright: 1;
  --contrast: 1;

  display: grid;
  place-items: center;

  & > * {
    filter: hue-rotate(var(--hue)) saturate(var(--sat)) brightness(var(--bright))
      contrast(var(--contrast));
  }

  &[data-skin="classic"] {
    --hue: 0deg;
    --sat: 1;
    --bright: 1;
    --contrast: 1.02;
  }

  &[data-skin="midnight"] {
    --hue: 210deg;
    --sat: 1.25;
    --bright: 0.92;
    --contrast: 1.15;
  }

  &[data-skin="mint"] {
    --hue: 135deg;
    --sat: 1.15;
    --bright: 1.05;
    --contrast: 1.05;
  }

  &[data-skin="sunset"] {
    --hue: 320deg;
    --sat: 1.25;
    --bright: 1.03;
    --contrast: 1.08;
  }

  &[data-skin="cyber"] {
    --hue: 260deg;
    --sat: 1.45;
    --bright: 0.98;
    --contrast: 1.25;
  }
`;
