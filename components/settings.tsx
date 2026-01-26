"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import styled, { css } from "styled-components";
import { PlayerAvatar } from "@/components/avatars/PlayerAvatar";
import AvatarSkinScope from "@/components/avatars/AvatarSkinScope";
import { AVATAR_REGISTRY, AVATAR_TYPES } from "@/components/avatars/avatarRegistry";
import ElectricAvatarPanel from "@/components/ElectricAvatarPanel";

import {
  readSkin,
  readType,
  readElectricTheme,
  writeSkin,
  writeType,
  writeElectricTheme,
  readName,
  writeName, 
  type AvatarSkin,
  type AvatarType,
  type ElectricTheme,
} from "@/firebase/avatarPrefs";

type SettingsPanelProps = {
  uid: string;
  initialSkin?: AvatarSkin;
  initialAvatarType?: AvatarType;
  onSkinChange?: (skin: AvatarSkin) => void;
  onAvatarTypeChange?: (type: AvatarType) => void;
};

const ELECTRIC_THEMES: ElectricTheme[] = [
  "blue",
  "pink",
  "red",
  "green",
  "purple",
  "white",
  "hotPink",
  "deepBlue",
  "blackEmits",
  "deepGreen",
];

const ELECTRIC_THEME_DATA: Record<ElectricTheme, { label: string; color: string }> = {
  blue: { label: "Ocean", color: "#9CD6FF" },
  pink: { label: "Sakura", color: "#FFB3E6" },
  red: { label: "Crimson", color: "#FF7A7A" },
  green: { label: "Mint", color: "#6FFFC7" },
  purple: { label: "Twilight", color: "#D7B3FF" },
  white: { label: "Pure", color: "#FFFFFF" },
  hotPink: { label: "Hot Pink", color: "#FF69B4" },
  deepBlue: { label: "Deep Blue", color: "#1E3A8A" },
  blackEmits: { label: "Black Emits", color: "#1A1A1A" },
  deepGreen: { label: "Deep Green", color: "#064E3B" },
};

const SKINS: Array<{ id: AvatarSkin; name: string; desc: string }> = [
  { id: "classic", name: "Classic", desc: "Original look." },
  { id: "midnight", name: "Midnight", desc: "Deep navy, eerie and cold." },
  { id: "mint", name: "Super Trooper", desc: "Dominant red, bold and intense." },
  { id: "sunset", name: "Midnight Sun", desc: "Warm Nordic glow: pinks, reds and gold." },
  { id: "cyber", name: "Cyber", desc: "High-contrast neon vibe." },
];

export default function SettingsPanel({
  uid,
  initialSkin,
  initialAvatarType,
  onSkinChange,
  onAvatarTypeChange,
}: SettingsPanelProps) {
  const [skin, setSkin] = useState<AvatarSkin>("classic");
  const [avatarType, setAvatarType] = useState<AvatarType>("classicAstronaut");
  const [electricTheme, setElectricTheme] = useState<ElectricTheme>("blue");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    setSkin(initialSkin ?? readSkin(uid));
    setAvatarType(initialAvatarType ?? readType(uid));
    setElectricTheme(readElectricTheme(uid));
    setDisplayName(readName(uid) || "");

  }, [uid, initialSkin, initialAvatarType]);

  const selectSkin = useCallback(
    (next: AvatarSkin) => {
      setSkin(next);
      writeSkin(uid, next);
      onSkinChange?.(next);
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("imposter:avatarPrefs"));
      }
    },
    [uid, onAvatarTypeChange]
  );

  const selectElectricTheme = useCallback(
  (next: ElectricTheme) => {
    setElectricTheme(next);
    writeElectricTheme(uid, next);

    // ✅ slik Home plukker opp endringen direkte
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("imposter:avatarPrefs"));
    }
  },
  [uid]
);
const sanitizeName = (raw: string) =>
  raw
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")        // remove zero-width
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")           // keep letters/numbers/space/_-
    .trim()
    .slice(0, 10);

  return (
    <Wrap>
      <Header>
        <Title>Avatar Settings</Title>
        <Subtitle>Customize your profile and appearance</Subtitle>
      </Header>

      <MainGrid>
        {/* LEFT COLUMN - Preview & Identity */}
        <LeftColumn>
          <Card>
            <SectionHeader>
              <SectionTitle>Preview</SectionTitle>
            </SectionHeader>

            <PreviewContainer>
              <ElectricAvatarPanel
                theme={electricTheme}
                width={240}
                height={240}
                radius={24}
                emberCount={120}
                speed={1.15}
                chaos={0.14}
                lineWidth={1.15}
              >
                <AvatarFrame>
                  <AvatarSkinScope skin={skin}>
                    <PlayerAvatar type={avatarType} size={200} />
                  </AvatarSkinScope>
                </AvatarFrame>
              </ElectricAvatarPanel>
            </PreviewContainer>

            <Divider />

            <SectionHeader>
              <SectionTitle>Display Name</SectionTitle>
            </SectionHeader>
            <NameInput
              type="text"
              placeholder="Enter your name..."
              value={displayName}
              onChange={(e) => {
                const next = sanitizeName(e.target.value);
                setDisplayName(next);
                writeName(uid, next);

                window.dispatchEvent(new Event("imposter:avatarPrefs"));
              }}
              maxLength={10}
            />
            <InputHint>{displayName.length}/10 characters</InputHint>

            <Divider />

            <SectionHeader>
              <SectionTitle>Border Color</SectionTitle>
              <SectionSubtitle>Choose your cutsom border color</SectionSubtitle>
            </SectionHeader>

            <ColorGrid>
              {ELECTRIC_THEMES.map((theme) => (
                <ColorOption
                  key={theme}
                  type="button"
                  $active={electricTheme === theme}
                  onClick={() => selectElectricTheme(theme)}
                >
                  <ColorSwatch $color={ELECTRIC_THEME_DATA[theme].color} />
                  <ColorLabel $active={electricTheme === theme}>
                    {ELECTRIC_THEME_DATA[theme].label}
                  </ColorLabel>
                </ColorOption>
              ))}
            </ColorGrid>
          </Card>
        </LeftColumn>

        {/* RIGHT COLUMN - Avatar & Skin Selection */}
        <RightColumn>
          <Card>
            <SectionHeader>
              <SectionTitle>Avatar Type</SectionTitle>
              <SectionSubtitle>Select your character model</SectionSubtitle>
            </SectionHeader>

            <AvatarGrid>
              {AVATAR_TYPES.map((type) => (
                <AvatarOption
                  key={type}
                  type="button"
                  $active={avatarType === type}
                  onClick={() => selectAvatarType(type)}
                >
                  <AvatarThumb>
                    <AvatarSkinScope skin={skin}>
                      <PlayerAvatar type={type} size={64} />
                    </AvatarSkinScope>
                  </AvatarThumb>
                </AvatarOption>
              ))}
            </AvatarGrid>
          </Card>

          <Card>
            <SectionHeader>
              <SectionTitle>Color Theme</SectionTitle>
              <SectionSubtitle>Choose your avatar's color palette</SectionSubtitle>
            </SectionHeader>

            <SkinList>
              {SKINS.map((s) => (
                <SkinOption
                  key={s.id}
                  type="button"
                  $active={skin === s.id}
                  onClick={() => selectSkin(s.id)}
                >
                  <SkinThumb>
                    <AvatarSkinScope skin={s.id}>
                      <PlayerAvatar type={avatarType} size={56} />
                    </AvatarSkinScope>
                  </SkinThumb>
                  <SkinInfo>
                    <SkinName>{s.name}</SkinName>
                    <SkinDesc>{s.desc}</SkinDesc>
                  </SkinInfo>
                </SkinOption>
              ))}
            </SkinList>
          </Card>
        </RightColumn>
      </MainGrid>
    </Wrap>
  );
}

/* ================ STYLED COMPONENTS ================ */

const Wrap = styled.section`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  color: #e5e7eb;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #818cf8 0%, #c7d2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 0;
  color: #94a3b8;
  font-size: 1rem;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(8px);
`;

const SectionHeader = styled.div`
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #e2e8f0;
`;

const SectionSubtitle = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #94a3b8;
`;

const Divider = styled.div`
  height: 1px;
  margin: 1.5rem 0;
  background: rgba(255, 255, 255, 0.08);
`;

/* Preview */
const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  margin-bottom: 1rem;
`;

const AvatarFrame = styled.div`
  width: 240px;
  height: 240px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 50% 35%, rgba(99, 102, 241, 0.18) 0%, rgba(15, 23, 42, 0) 70%);
`;

/* Name Input */
const NameInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 1rem;
  transition: all 150ms ease;

  &::placeholder {
    color: #64748b;
  }

  &:focus {
    outline: none;
    border-color: rgba(99, 102, 241, 0.5);
    background: rgba(30, 41, 59, 0.8);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const InputHint = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #64748b;
  text-align: right;
`;

/* Color Grid */
const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
`;

const ColorOption = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.4);
  border: 2px solid ${({ $active }) => ($active ? "rgba(99, 102, 241, 0.8)" : "rgba(255, 255, 255, 0.08)")};
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    background: rgba(30, 41, 59, 0.6);
    border-color: ${({ $active }) => ($active ? "rgba(99, 102, 241, 1)" : "rgba(255, 255, 255, 0.15)")};
    transform: translateY(-2px);
  }

  ${({ $active }) =>
    $active &&
    css`
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    `}
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px ${({ $color }) => `${$color}40`};
`;

const ColorLabel = styled.div<{ $active: boolean }>`
  font-size: 0.85rem;
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  color: ${({ $active }) => ($active ? "#e2e8f0" : "#94a3b8")};
`;

/* Avatar Grid */
const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
`;

const AvatarOption = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.4);
  border: 2px solid ${({ $active }) => ($active ? "rgba(99, 102, 241, 0.8)" : "rgba(255, 255, 255, 0.08)")};
  border-radius: 12px;
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    background: rgba(30, 41, 59, 0.6);
    border-color: ${({ $active }) => ($active ? "rgba(99, 102, 241, 1)" : "rgba(255, 255, 255, 0.15)")};
    transform: translateY(-2px);
  }

  ${({ $active }) =>
    $active &&
    css`
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    `}
`;

const AvatarThumb = styled.div`
  width: 80px;
  height: 80px;
  display: grid;
  place-items: center;
  background: rgba(2, 6, 23, 0.4);
  border-radius: 10px;
`;

const AvatarLabel = styled.div`
  font-size: 0.8rem;
  color: #cbd5e1;
  font-weight: 500;
  text-align: center;
`;

/* Skin List */
const SkinList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SkinOption = styled.button<{ $active: boolean }>`
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.4);
  border: 2px solid ${({ $active }) => ($active ? "rgba(99, 102, 241, 0.8)" : "rgba(255, 255, 255, 0.08)")};
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 150ms ease;

  &:hover {
    background: rgba(30, 41, 59, 0.6);
    border-color: ${({ $active }) => ($active ? "rgba(99, 102, 241, 1)" : "rgba(255, 255, 255, 0.15)")};
    transform: translateY(-1px);
  }

  ${({ $active }) =>
    $active &&
    css`
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    `}
`;

const SkinThumb = styled.div`
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  background: rgba(2, 6, 23, 0.4);
  border-radius: 10px;
`;

const SkinInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
`;

const SkinName = styled.div`
  font-weight: 600;
  color: #e2e8f0;
  font-size: 0.95rem;
`;

const SkinDesc = styled.div`
  color: #94a3b8;
  font-size: 0.85rem;
  line-height: 1.3;
`;