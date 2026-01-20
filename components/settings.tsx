"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import styled, { css } from "styled-components";
import { PlayerAvatar } from "@/components/avatars/PlayerAvatar";
import AvatarSkinScope from "@/components/avatars/AvatarSkinScope";
import { AVATAR_REGISTRY, AVATAR_TYPES } from "@/components/avatars/avatarRegistry";
import ElectricAvatarPanel from "@/components/ElectricAvatarPanel";

// ✅ BRUK KUN disse (ikke redefiner lokalt)
import {
  readSkin,
  readType,
  readElectricTheme,
  writeSkin,
  writeType,
  writeElectricTheme,
  type AvatarSkin,
  type AvatarType,
  type ElectricTheme,
} from "@/firebase/avatarPrefs";

/* ---------------- props ---------------- */

type SettingsPanelProps = {
  uid: string;
  initialSkin?: AvatarSkin;
  initialAvatarType?: AvatarType;
  onSkinChange?: (skin: AvatarSkin) => void;
  onAvatarTypeChange?: (type: AvatarType) => void;
};

/* ---------------- electric theme (NYTT, separat fra skin) ---------------- */


const ELECTRIC_THEMES: ElectricTheme[] = ["blue", "pink", "red", "green", "purple","white" ];

const ELECTRIC_THEME_LABEL: Record<ElectricTheme, string> = {
  blue: "Blue",
  pink: "Pink",
  red: "Red",
  green: "Green",
  purple: "Purple",
  white: "White",
};

const ELECTRIC_THEME_SWATCH: Record<ElectricTheme, string> = {
  blue: "#9CD6FF",
  pink: "#FFB3E6",
  red: "#FF7A7A",
  green: "#6FFFC7",
  purple: "#D7B3FF",
  white: "#FFFFFF",
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

  // ✅ NYTT: electric-fargevalg for border (ikke skin)
  const [electricTheme, setElectricTheme] = useState<ElectricTheme>("blue");

 useEffect(() => {
  setSkin(initialSkin ?? readSkin(uid));
  setAvatarType(initialAvatarType ?? readType(uid));
  setElectricTheme(readElectricTheme(uid));
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

 const selectElectricTheme = useCallback(
  (next: ElectricTheme) => {
    setElectricTheme(next);
    writeElectricTheme(uid, next); // ✅ bruker shared pref
  },
  [uid]
);


  const previewSize = 200;
const skinLabel = useMemo(() => {
  const found = SKINS.find((s) => s.id === skin);
  return found?.name ?? skin;
}, [skin]);

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
            <PreviewCol>
              <ElectricPreviewWrap>
                <ElectricAvatarPanel
                  theme={electricTheme} // ✅ border-farge styres her (ikke skin)
                  width={240}
                  height={240}
                  radius={24}
                  emberCount={120}
                  speed={1.15}
                  chaos={0.14}
                  lineWidth={1.15}
                >
                  <BigAvatarFrame>
                    <AvatarSkinScope skin={skin}>
                      <PlayerAvatar type={avatarType} size={previewSize} />
                    </AvatarSkinScope>

                  </BigAvatarFrame>
                </ElectricAvatarPanel>
              </ElectricPreviewWrap>

              {/* ✅ NYTT: fargeknapper under preview */}
              <ElectricControls>
                <ElectricLabel>Electric color</ElectricLabel>
                <SwatchRow>
                  {ELECTRIC_THEMES.map((th) => (
                    <SwatchButton
                      key={th}
                      type="button"
                      aria-label={`Electric color: ${ELECTRIC_THEME_LABEL[th]}`}
                      title={ELECTRIC_THEME_LABEL[th]}
                      $active={electricTheme === th}
                      $color={ELECTRIC_THEME_SWATCH[th]}
                      onClick={() => selectElectricTheme(th)}
                    />
                  ))}
                </SwatchRow>
              </ElectricControls>
            </PreviewCol>

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
                <Value>{skinLabel}</Value>
              </InfoLine>
              <Hint>Preview is large so you can see details.</Hint>
            </MiniInfo>
          </PreviewRow>
        </Card>

        <Card>
          <CardTitle>Choose Avatar</CardTitle>
          <ChoiceGrid>
  {AVATAR_TYPES.map((t) => (
    <ChoiceButton
      key={t}
      type="button"
      $active={avatarType === t}
      onClick={() => selectAvatarType(t)}
    >
      <ChoiceThumb>
        <AvatarSkinScope skin={skin}>
          <PlayerAvatar type={t} size={84} />
        </AvatarSkinScope>
      </ChoiceThumb>
      <ChoiceMeta>
        <ChoiceName>{AVATAR_REGISTRY[t].label}</ChoiceName>
        <ChoiceDesc>Choose this avatar.</ChoiceDesc>
      </ChoiceMeta>
    </ChoiceButton>
  ))}
</ChoiceGrid>


          <Divider />

          <CardTitle>Skins (filter-based for now)</CardTitle>
          <SkinGrid>
            {SKINS.map((s) => (
              <SkinButton key={s.id} type="button" $active={skin === s.id} onClick={() => selectSkin(s.id)}>
                <SkinThumb>
                  <AvatarSkinScope skin={skin}>
                    <PlayerAvatar type={avatarType} size={72} />
                  </AvatarSkinScope>
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
  { id: "midnight", name: "Midnight", desc: "Deep navy, eerie and cold." },
  { id: "mint", name: "Super Trooper", desc: "Dominant red, bold and intense." },
  { id: "sunset", name: "Midnight Sun", desc: "Warm Nordic glow: pinks, reds and gold." },
  { id: "cyber", name: "Cyber", desc: "High-contrast neon vibe." },
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
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
`;

const PreviewCol = styled.div`
  display: grid;
  gap: 0.75rem;
  justify-items: center;
`;

const ElectricPreviewWrap = styled.div`
  position: relative;
  width: 240px;
  height: 240px;
`;

const BigAvatarFrame = styled.div`
  width: 240px;
  height: 240px;
  border-radius: 24px;
  display: grid;
  place-items: center;

  background: radial-gradient(circle at 50% 35%, rgba(99, 102, 241, 0.18) 0%, rgba(15, 23, 42, 0) 70%);

  /* ❌ fjernet border – electric border tar over */
  border: none;
`;

const ElectricControls = styled.div`
  display: grid;
  gap: 0.45rem;
  justify-items: center;
`;

const ElectricLabel = styled.div`
  font-size: 0.85rem;
  color: #94a3b8;
`;

const SwatchRow = styled.div`
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const SwatchButton = styled.button<{ $active: boolean; $color: string }>`
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: ${({ $color }) => $color};
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;

  ${({ $active, $color }) =>
    $active &&
    css`
      transform: scale(1.12);
      border-color: rgba(255, 255, 255, 0.55);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.08), 0 0 18px ${$color}66;
    `}

  &:hover {
    transform: scale(1.12);
    box-shadow: 0 0 14px ${({ $color }) => `${$color}66`};
  }
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
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
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