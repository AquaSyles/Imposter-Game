"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import Image from "next/image";
import { FaCog, FaTimes } from "react-icons/fa";
import ElectricAvatarPanel from "@/components/ElectricAvatarPanel";

import Lobby from "@/components/Lobby";
import Themes, { WORD_DATA } from "@/components/Themes";
import Game from "@/components/Game";
import SettingsPanel from "@/components/settings";

import { PlayerAvatar } from "@/components/avatars/PlayerAvatar";
import AvatarSkinScope from "@/components/avatars/AvatarSkinScope";


import type { Player } from "@/types/player";
import {
  createLobby,
  joinLobby,
  listenToLobby,
  listenToLobbyPlayersActiveSession, // ✅
  startGame,
  leaveLobby,
  closeLobby,
  updatePlayerPrefs,
} from "@/firebase/lobby";

import { findReusableLobby } from "@/firebase/lobby";
import { useTheme } from "@/components/ThemeContext";

import { readSkin, readType, readElectricTheme, type AvatarSkin, type AvatarType } from "@/firebase/avatarPrefs";
import { ElectricTheme } from "@/types/theme";

/* ---------------- helpers ---------------- */

function getOrCreateUid() {
  if (typeof window === "undefined") return crypto.randomUUID();
  const key = "imposter_uid";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const uid = crypto.randomUUID();
  localStorage.setItem(key, uid);
  return uid;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);

    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}

/* ---------------- background component ---------------- */

const StarryBackground = () => {
  const [stars, setStars] = useState<Array<{ id: number; top: string; left: string; delay: string }>>([]);

  useEffect(() => {
    const starsArray = Array(100)
      .fill(0)
      .map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
      }));
    setStars(starsArray);
  }, []);

  return (
    <StarBackground>
      {stars.map((star) => (
        <Star key={star.id} $top={star.top} $left={star.left} $delay={star.delay} />
      ))}
    </StarBackground>
  );
};

/* ---------------- page ---------------- */

export default function Home() {
  const uid = useMemo(() => getOrCreateUid(), []);
  const { selectedThemeId } = useTheme();

  const [showThemes, setShowThemes] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const [lobby, setLobby] = useState<any | null>(null);
  const isMobile = useIsMobile();

  const [lobbyPlayers, setLobbyPlayers] = useState<Player[]>([]);
const [myPlayer, setMyPlayer] = useState<Player | null>(null);


  const [isHost, setIsHost] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const handleExitLobby = useCallback(async () => {
    if (!inviteCode || !myPlayer) return;

    try {
      await leaveLobby(inviteCode, myPlayer.uid);
    } catch (e) {
      console.error(e);
    } finally {
      // reset state tilbake til startmeny
      setShowThemes(false);
      setInviteCode("");
      setLobby(null);
      setLobbyPlayers([]);
      setIsHost(false);
    }
  }, [inviteCode, myPlayer]);

  // prefs
  const [avatarType, setAvatarType] = useState<AvatarType>("classicAstronaut");
  const [skin, setSkin] = useState<AvatarSkin>("classic");
  const [electricTheme, setElectricTheme] = useState<ElectricTheme>("blue");

  useEffect(() => {
    setAvatarType(readType(uid));
    setSkin(readSkin(uid));
    setElectricTheme(readElectricTheme(uid));
  }, [uid]);
useEffect(() => {
  if (!inviteCode || !myPlayer?.uid) return;
  updatePlayerPrefs(inviteCode, myPlayer.uid, avatarType, skin).catch(console.error);
}, [inviteCode, myPlayer?.uid, avatarType, skin]);

  
useEffect(() => {
  const onPrefs = () => {
    setAvatarType(readType(uid));
    setSkin(readSkin(uid));
    setElectricTheme(readElectricTheme(uid));
  };

  onPrefs(); // ✅ init
  window.addEventListener("imposter:avatarPrefs", onPrefs);
  return () => window.removeEventListener("imposter:avatarPrefs", onPrefs);
}, [uid]);


  const copyToClipboard = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

const setupLobby = useCallback(
  async (isNewGame = false, forcedCode?: string) => {
    // ✅ alltid sørg for at player har korrekt uid
    let player: Player;

    if (!myPlayer || !myPlayer.uid) {
      player = {
  uid,
  playerId: 0,
  name: `Player ${Math.floor(100 + Math.random() * 900)}`,
  avatar: "astronaut",
  skin,                 // ✅ bruk valgt skin
  avatarType,           // ✅ bruk valgt avatarType
  joinedAt: Date.now(),
};

      setMyPlayer(player);
    } else {
      // ✅ tving korrekt uid hvis den av en eller annen grunn er feil/blank
      player = { ...myPlayer, uid: myPlayer.uid || uid };
      if (player.uid !== myPlayer.uid) setMyPlayer(player);
    }

    if (isNewGame) {
  const host: Player = { ...player, uid, playerId: 100, joinedAt: Date.now() };
  setMyPlayer(host);

  const code = forcedCode!;
  const sessionId = await createLobby(code, host);


  setInviteCode(code);
  setIsHost(true);
  return;
}



    if (!isNewGame && forcedCode) {
  const joiner: Player = { ...player, uid, playerId: 0, joinedAt: Date.now() };
  await joinLobby(forcedCode, joiner);

  setMyPlayer(joiner);
  setInviteCode(forcedCode);
  setIsHost(false);
  return;
}

  },
  [uid, myPlayer, avatarType, skin]
);

const handleCreateGame = useCallback(async () => {
  if (isCreating) return;
  setIsCreating(true);

  try {
    let code: string | null = await findReusableLobby();

    if (!code) {
      // ❌ ingen ledig → lag ny
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      code = Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    }

    await setupLobby(true, code);
  } catch (e) {
    console.error(e);
  } finally {
    setIsCreating(false);
  }
}, [setupLobby, isCreating]);


  const handleJoinGame = useCallback(
    async (code: string) => {
      if (isCreating) return;
      setIsCreating(true);
      try {
        await setupLobby(false, code);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCreating(false);
      }
    },
    [setupLobby, isCreating]
  );

 // listen players (session-safe)
useEffect(() => {
  if (!inviteCode) {
    setLobbyPlayers([]);
    return;
  }

  const unsub = listenToLobbyPlayersActiveSession(inviteCode, setLobbyPlayers);
  return () => unsub();
}, [inviteCode]);




  // listen lobby
 useEffect(() => {
  if (!inviteCode || typeof inviteCode !== "string" || !/^[A-Z0-9]{6}$/.test(inviteCode)) {
    setLobby(null);
    setLobbyPlayers([]);
    setIsHost(false);
    return;
  }

  const unsub = listenToLobby(inviteCode, (l) => {
    if (!l || l.status === "closed") {
      setShowThemes(false);
      setInviteCode("");
      setLobby(null);
      setLobbyPlayers([]);
      setIsHost(false);
      return;
    }

    setLobby(l);
  });

  return () => unsub();
}, [inviteCode]);


  useEffect(() => {
  if (!inviteCode) return;
  localStorage.setItem("imposter_last_lobby", inviteCode);
}, [inviteCode]);


  // merge + dedupe players
  const myUid = myPlayer?.uid;
  const mergedPlayers = [...(myPlayer ? [myPlayer] : []), ...lobbyPlayers] as Player[];
  const uniquePlayers = Array.from(new Map(mergedPlayers.map((p) => [p.uid, p])).values());

  const orderedPlayers = myUid
    ? [...uniquePlayers.filter((p) => p.uid === myUid), ...uniquePlayers.filter((p) => p.uid !== myUid)]
    : uniquePlayers;

  const isInGame = lobby?.status === "started" || lobby?.status === "finished";

  const gameData = lobby?.game;

  // ✅ start game: bruker temaet som ligger i lobby.settings
const handleStartGame = useCallback(async () => {
  if (!inviteCode || !myPlayer) return;

  const themeId: string | null = lobby?.settings?.selectedThemeId ?? null;
  if (!themeId) {
    alert("Host must select a theme first!");
    return;
  }

  const words = WORD_DATA[themeId];
  if (!words?.length) {
    alert("No words found for theme: " + themeId);
    return;
  }

  // ✅ Velg secret word (crew får dette)
  const randomWord = words[Math.floor(Math.random() * words.length)];

  // ✅ Lag snilt imposter-hint:
  // - fortell temaet
  // - vis 3 eksempler (ekskluder secret word)
  // - vis lengde på ordet (hjelper litt uten å avsløre)
  const pool = words.filter((w) => w !== randomWord);
  const examples: string[] = [];
  while (examples.length < Math.min(3, pool.length)) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!examples.includes(pick)) examples.push(pick);
  }

  const imposterHint = `Theme: ${themeId}. Example words: ${examples.join(", ")}. Secret word length: ${randomWord.length}.`;

  // ✅ Start game med hint
  await startGame(inviteCode, myPlayer.uid, randomWord, themeId, imposterHint);
}, [inviteCode, myPlayer, lobby]);


  return (
    <>
      <StarryBackground />

      <PageContainer>
        <GlowEffect />

       {/* Top-right player container */}
<PlayerDock>
<ElectricAvatarPanel
  theme={electricTheme}
  mirror={isMobile}
  borderRadiusCss={isMobile ? "0 0 160px 160px" : "0 0 0 60px"}
  width={isMobile ? 300 : 300}
  height={isMobile ? 150 : 200}
  radius={isMobile ? 160 : 60}
  emberCount={120}
  speed={1.15}
  chaos={0.14}
  lineWidth={1.15}
>
    <PlayerContainerInner>
      <Bar>
        <PlayerWrapper>
          <AvatarSkinScope skin={skin}>
            <PlayerAvatar type={avatarType} size={isMobile ? 80 : 100} />
          </AvatarSkinScope>



          <PlayerName>
            {myPlayer ? `${myPlayer.name} (You)` : "You (not in lobby)"}{" "}
            {myPlayer?.playerId === 100 ? "👑" : ""}
          </PlayerName>
        </PlayerWrapper>
      </Bar>

      <Bar_2>
        <VoteBadge>
          <Image src="/Vote_V.png" alt="Vote V" width={50} height={50} priority />
        </VoteBadge>

        <SettingsButton onClick={() => setShowSettings(true)} aria-label="Open settings">
          <FaCog />
        </SettingsButton>
      </Bar_2>
    </PlayerContainerInner>
  </ElectricAvatarPanel>
</PlayerDock>


        <MainContainer>
          {inviteCode && (
            <InviteCode>
              <CodeLabel>Invite Code</CodeLabel>
              <CodeDisplay onClick={copyToClipboard} title="Click to copy">
                {inviteCode}
                {isCopied && (
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "#4ade80" }}>
                    Copied!
                  </span>
                )}
              </CodeDisplay>
            </InviteCode>
          )}

          {!inviteCode && <Title>Imposter Game</Title>}

          {/* ✅ game view */}
          {isInGame ? (
  <Game
    inviteCode={inviteCode}
    players={orderedPlayers}
    myUid={uid}
    game={gameData}
    isHost={isHost}
    hostUid={myPlayer?.uid ?? ""}
  />
) : !inviteCode ? (
  // ✅ STARTMENY (Create/Join)
  <Lobby
    mode="menu"
    players={orderedPlayers}
    onJoinGame={handleJoinGame}
    onCreateGame={handleCreateGame}
  />
) : showThemes ? (
  // ✅ THEMES
  <Themes
    onBack={() => setShowThemes(false)}
    onStartGame={handleStartGame}
    isHost={isHost}
    canStartGame={!!lobby?.settings?.selectedThemeId}
    inviteCode={inviteCode}
    hostUid={myPlayer?.uid ?? ""}
  />
) : (
  // ✅ LOBBY ROM (etter join/create)
  <Lobby
    mode="room"
    players={orderedPlayers}
    isHost={isHost}
    onContinueToThemes={() => setShowThemes(true)}
    onExitLobby={handleExitLobby}
  />
)}

        </MainContainer>
      </PageContainer>

      {/* Settings Modal */}
      {showSettings && (
        <ModalOverlay onClick={() => setShowSettings(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={() => setShowSettings(false)} aria-label="Close settings">
              <FaTimes />
            </CloseBtn>

            <SettingsPanel
              uid={uid}
              initialAvatarType={avatarType}
              initialSkin={skin}
              onAvatarTypeChange={(t) => setAvatarType(t)}
              onSkinChange={(s) => setSkin(s)}
            />
          </ModalCard>
        </ModalOverlay>
      )}
    </>
  );
}

/* ---------------- styled components ---------------- */

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 2;
  box-sizing: border-box;
  overflow: hidden;
  @media (max-width: 768px) {
    padding: 0rem;
  }
`;

const StarBackground = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  z-index: 1;
  overflow: hidden;
`;

const Star = styled.div<{ $top: string; $left: string; $delay: string }>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle 3s infinite;
  animation-delay: ${({ $delay }) => $delay};
  opacity: 0.7;

  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.2;
    }
    50% {
      opacity: 1;
    }
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const GlowEffect = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, rgba(16, 24, 39, 0) 70%);
  pointer-events: none;
  z-index: 1;
`;

const MainContainer = styled.main`
  width: 100%;
  max-width: 1200px;
  position: relative;
  z-index: 2;
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PlayerDock = styled.div`
  position: absolute;
  top: -4px;
  right: -1px;
  width: 300px;
  height: 200px;
  z-index: 10;
  @media (max-width: 768px) {
    right: auto;
    left:auto;
    height: 150px;
    width: 300px;
  }
`;

const PlayerContainerInner = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 3rem;

  /* behold samme look */
  background: #1e293b;
  border-radius: 0 0 0 60px;
  padding: 1rem;

  /* ❌ fjern hvit border – electric tar over */
  border: none;
  @media (max-width: 768px) {
    gap: 0rem;
    width: 300px;
    height: 150px;
    align-items: center;
    border-radius: 0 0  160px 160px;
  }
`;


const Bar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
`;

const Bar_2 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  justify-content: center;
`;

const PlayerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  border-radius: 12px;
  min-width: 120px;
`;
const PlayerInner = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 3rem;
  padding: 1rem;
  z-index: 10;
`;

const PlayerName = styled.div`
  color: #94a3b8;
`;

const VoteBadge = styled.div`
  z-index: 10;
  img {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
  @media (max-width: 768px) {
    display: none;
    visibility: hidden;
  }
`;
const SettingsButton = styled.button`
  display: flex;
  width: 60px;
  height: 60px;
  border: 2px solid #4f46e5;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background: #1e293b;
  color: #e5e7eb;
  font-size: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.1) rotate(360deg);
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
    transition: transform 0.5s ease-in-out, box-shadow 0.3s ease;
  }
  @media (max-width: 768px) {
    position: fixed;
    bottom: 10px;
    right: 10px;
  }
`;

const InviteCode = styled.div`
  margin-bottom: 2rem;
  text-align: center;
  color: #e5e7eb;
  @media (max-width: 768px) {
    margin-top:1.5rem;
    margin-bottom: 0rem;
  }
`;

const CodeDisplay = styled.div`
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-family: monospace;
  font-size: 1.25rem;
  letter-spacing: 0.2em;
  margin-top: 0.5rem;
  border: 1px solid #4f46e5;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(79, 70, 229, 0.2);
    transform: translateY(-2px);
  }
`;

const CodeLabel = styled.div`
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
  
`;

const ViewContainer = styled.div<{ $isActive: boolean }>`
  width: 100%;
  transition: opacity 0.3s ease, transform 0.3s ease;
  position: ${({ $isActive }) => ($isActive ? "relative" : "absolute")};
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0)};
  pointer-events: ${({ $isActive }) => ($isActive ? "auto" : "none")};
  transform: ${({ $isActive }) => ($isActive ? "translateY(0)" : "translateY(20px)")};
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 1rem;
`;

const ModalCard = styled.div`
  width: min(980px, 95vw);
  max-height: 90vh;
  overflow: auto;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(30, 41, 59, 0.65);
  color: #e2e8f0;
  display: grid;
  place-items: center;
  cursor: pointer;

  &:hover {
    background: rgba(30, 41, 59, 0.9);
  }
`;

