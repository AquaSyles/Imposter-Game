"use client";

import { useState, useEffect, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import type { Player } from "@/types/player";
import { readSkin, readType, type AvatarSkin, type AvatarType } from "@/firebase/avatarPrefs";
import { PlayerAvatar } from "@/components/avatars/PlayerAvatar";

import { RedAstronautAvatar } from "@/components/avatars/RedAstronautAvatar";
import { FaUserSecret, FaUserAstronaut, FaEyeSlash, FaFingerprint } from "react-icons/fa";
import { AstronautAvatar } from "./avatars/AstronautAvatar";
import ChatPanel from "@/components/ChatPanel";
import VotePanel from "@/components/VotePanel";
import ResultPanel from "@/components/ResultPanel";
import { goToChatPhase } from "@/firebase/lobby";

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


// --- Types ---
type GameData = {
  word?: string;
  themeId?: string;
  imposterUid?: string;
  imposterHint?: string;
  phase?: "reveal" | "chat" | "vote" | "result";
  votes?: Record<string, string>;
  result?: { winner: "crew" | "imposter"; eliminatedUid: string } | null;
  chat?: {
    round: number;
    turnIndex: number;
    turnUid: string;
    log: Array<{ uid: string; text: string; round: number; index: number; at: number }>;
  };
  assignments?: Record<string, { role: "imposter" | "word" }>;
};

type GameProps = {
  inviteCode: string;
  players: Player[];
  myUid: string;
  game: GameData | null | undefined;
  isHost: boolean;
  hostUid: string;
  
};

export default function Game({ inviteCode, players, myUid, game, isHost, hostUid }: GameProps) {
  // Avatar prefs
  const [avatarType, setAvatarType] = useState<AvatarType>("classicAstronaut");
  const [skin, setSkin] = useState<AvatarSkin>("classic");

  useEffect(() => {
    if (!myUid) return;
    const loadPrefs = () => {
      setAvatarType(readType(myUid));
      setSkin(readSkin(myUid));
    };
    loadPrefs();
    window.addEventListener("imposter:avatarPrefs", loadPrefs);
    return () => window.removeEventListener("imposter:avatarPrefs", loadPrefs);
  }, [myUid]);

  const AvatarComponent = avatarType === "redAstronaut" ? RedAstronautAvatar : AstronautAvatar;
  const role = game?.assignments?.[myUid]?.role;
  const isImposter = role === "imposter";
  const word = game?.word;
  const hint = game?.imposterHint;
  const phase = game?.phase ?? "reveal";
  const isMobile = useIsMobile();
const showMiniCardInChatMobile = isMobile && phase === "chat";
const activeTurnUid = phase === "chat" ? game?.chat?.turnUid : null;
const typingUid = phase === "chat" ? (game as any)?.chat?.typingUid ?? null : null;



  const [cardFlipped, setCardFlipped] = useState(false);
  const [miniHidden, setMiniHidden] = useState(false);


  const avatarTypeByUid = useMemo(() => {
  const out: Record<string, AvatarType> = {};
  players.forEach((p) => (out[p.uid] = readType(p.uid)));
  return out;
}, [players]);

const skinByUid = useMemo(() => {
  const out: Record<string, AvatarSkin> = {};
  players.forEach((p) => (out[p.uid] = readSkin(p.uid)));
  return out;
}, [players]);

  if (!role) return <LoadingScreen>Initializing Neural Link...</LoadingScreen>;

  return (
    <MainContainer>
      <BackgroundOrb />
      
      {/* HEADER / HUD */}
      <HudHeader>
        <GameStatusBadge>
          <StatusPulse />
          {phase === "reveal" && "SECURE CHANNEL ESTABLISHED"}
          {phase === "chat" && "AUDIO CHANNELS OPEN"}
          {phase === "vote" && "VOTING IN PROGRESS"}
          {phase === "result" && "MISSION REPORT"}
        </GameStatusBadge>
        <PhaseIndicator>
          Phase: <span>{phase.toUpperCase()}</span>
        </PhaseIndicator>
      </HudHeader>

      <ContentArea>
        {/* --- LEFT COLUMN: ACTION AREA --- */}
        <ActionColumn>

  {/* ✅ STOR FLIP-KORT kun i reveal */}
  {phase === "reveal" && (
    <PerspectiveContainer>
      <FlipCard $flipped={cardFlipped} onClick={() => setCardFlipped(!cardFlipped)}>
        <CardFront>
          <FingerprintIcon><FaFingerprint /></FingerprintIcon>
          <TapText>AUTHENTICATE</TapText>
          <SubText>Tap to reveal identity</SubText>
        </CardFront>

        <CardBack $isImposter={isImposter}>
          <RoleIconWrapper>
            {isImposter ? <FaUserSecret /> : <FaUserAstronaut />}
          </RoleIconWrapper>
          <RoleTitle>{isImposter ? "IMPOSTER" : "CREW MEMBER"}</RoleTitle>

          <SecretContainer $isImposter={isImposter}>
            <SecretLabel>{isImposter ? "YOUR HINT" : "SECRET WORD"}</SecretLabel>
            <SecretValue>{isImposter ? (hint ?? "Blend in") : (word ?? "???")}</SecretValue>
          </SecretContainer>

          <HideInstruction><FaEyeSlash /> Tap to hide</HideInstruction>
        </CardBack>
      </FlipCard>
    </PerspectiveContainer>
  )}

  {/* ✅ Chat skal ligge her (tar plassen der flipkortet var) */}
{phase === "chat" && game?.chat && (
  <>
    {showMiniCardInChatMobile && (
      <RoleMiniCard
  $isImposter={isImposter}
  $compact
  $hidden={miniHidden}
  onClick={() => setMiniHidden((v) => !v)}
  role="button"
  aria-label={miniHidden ? "Show role info" : "Hide role info"}
>
  <RoleMiniHeaderRow>
    <RoleMiniTop>
      <RoleMiniTag>{"ROLE -"}</RoleMiniTag>
      <RoleMiniTitle>{isImposter ? "IMPOSTER" : "CREW"}</RoleMiniTitle>
    </RoleMiniTop>

    <MiniToggle>
      {miniHidden ? "UNHIDE" : "HIDE"}
    </MiniToggle>
  </RoleMiniHeaderRow>

  <RoleMiniBody>
    {isImposter ? (
      <>
        <MiniLabel>Hint - </MiniLabel>
        <MiniValue>{hint ?? "Blend in"}</MiniValue>
      </>
    ) : (
      <>
        <MiniLabel>Word - </MiniLabel>
        <MiniValue>{word ?? "???"}</MiniValue>
      </>
    )}
  </RoleMiniBody>
</RoleMiniCard>

    )}

    {/* ✅ MOBILE: Crew + Chat i samme “attached” modul */}
    {isMobile ? (
      <AttachedStack>
        <CrewManifestMobile>
          <ManifestTitle>CREW MANIFEST</ManifestTitle>
          <CrewList>
            {players.map((p) => {
              const pType = avatarTypeByUid[p.uid] ?? "classicAstronaut";
              const pSkin = skinByUid[p.uid] ?? "classic";

              const isMe = p.uid === myUid;
              const hasTurn = !!activeTurnUid && p.uid === activeTurnUid;
              const dimOthers = !!activeTurnUid && p.uid !== activeTurnUid;
              const isTyping = !!typingUid && p.uid === typingUid;

              return (
                <CrewItem key={p.uid} $isMe={isMe} $hasTurn={hasTurn} $dim={dimOthers}>
                  <AvatarFrame data-skin={pSkin}>
                    <PlayerAvatar type={pType} size={40} />
                  </AvatarFrame>

                  <CrewInfo>
                    <CrewName>
                      {p.name}
                      {isTyping && <TypingPill>typing…</TypingPill>}
                    </CrewName>
                    <CrewStatus>{hasTurn ? "IMPOSTER?" : "ONLINE"}</CrewStatus>
                  </CrewInfo>

                  {isMe && <MeBadge>ME:)</MeBadge>}
                </CrewItem>
              );
            })}
          </CrewList>
        </CrewManifestMobile>

        <ChatShellMobile>
          <ChatPanel
            inviteCode={inviteCode}
            myUid={myUid}
            players={players}
            chat={game.chat}
            avatarTypeByUid={avatarTypeByUid}
            skinByUid={skinByUid}
            avatarSize={26}
            secretWord={game.word ?? null}
            isImposter={isImposter}
          />
        </ChatShellMobile>
      </AttachedStack>
    ) : (
      /* ✅ DESKTOP: vanlig chat i GlassPanel */
      <GlassPanel>
        <ChatPanel
          inviteCode={inviteCode}
          myUid={myUid}
          players={players}
          chat={game.chat}
          avatarTypeByUid={avatarTypeByUid}
          skinByUid={skinByUid}
          avatarSize={26}
          secretWord={game.word ?? null}
          isImposter={isImposter}
        />
      </GlassPanel>
    )}
  </>
)}



{phase === "vote" && (
  <VotePanel
    inviteCode={inviteCode}
    myUid={myUid}
    players={players}
    votes={game?.votes ?? {}}
    chat={game?.chat}
  />
)}


  {phase === "result" && game?.result && game?.imposterUid && (
    <ResultPanel
      inviteCode={inviteCode}
      players={players}
      imposterUid={game.imposterUid}
      result={game.result as any}
      isHost={isHost}
      hostUid={hostUid}
    />
  )}

  {/* reveal action box */}
  {phase === "reveal" && (
    <PhaseActionBox>
      <h3>Mission Briefing</h3>
      <p>Memorize your secret. Identify the traitor.</p>
      {isHost ? (
        <NeonButton onClick={() => goToChatPhase(inviteCode, hostUid)}>
          INITIATE CHAT LINK
        </NeonButton>
      ) : (
        <WaitingText>Waiting for Commander...</WaitingText>
      )}
    </PhaseActionBox>
  )}
</ActionColumn>

        {/* --- RIGHT COLUMN: CREW MANIFEST --- */}
        <SideColumn>
  {/* Skjul hele sidekolonnen når mobil+chat (fordi den flyttes inn i attached) */}
  {!(isMobile && phase === "chat") && (
    <>
      {phase !== "reveal" && !showMiniCardInChatMobile && (
       <RoleMiniCard
  $isImposter={isImposter}
  $compact
  $hidden={miniHidden}
  onClick={() => setMiniHidden((v) => !v)}
  role="button"
  aria-label={miniHidden ? "Show role info" : "Hide role info"}
>
  <RoleMiniHeaderRow>
    <RoleMiniTop>
      <RoleMiniTag>{"ROLE -"}</RoleMiniTag>
      <RoleMiniTitle>{isImposter ? "IMPOSTER" : "CREW"}</RoleMiniTitle>
    </RoleMiniTop>

    <MiniToggle>
      {miniHidden ? "SHOW ROLE" : "HIDE ROLE"}
    </MiniToggle>
  </RoleMiniHeaderRow>

  <RoleMiniBody>
    {miniHidden ? (
      <HiddenPlaceholder>
        <MiniLabel>Hidden</MiniLabel>
        <MiniValue>••••••</MiniValue>
      </HiddenPlaceholder>
    ) : isImposter ? (
      <>
        <MiniLabel>Hint - </MiniLabel>
        <MiniValue>{hint ?? "Blend in"}</MiniValue>
      </>
    ) : (
      <>
        <MiniLabel>Word - </MiniLabel>
        <MiniValue>{word ?? "???"}</MiniValue>
      </>
    )}
  </RoleMiniBody>
</RoleMiniCard>

      )}

      <CrewManifest>
        <ManifestTitle>CREW MANIFEST</ManifestTitle>
        <CrewList>
          {players.map((p) => {
            const pType = avatarTypeByUid[p.uid] ?? "classicAstronaut";
            const pSkin = skinByUid[p.uid] ?? "classic";

            const isMe = p.uid === myUid;
            const hasTurn = !!activeTurnUid && p.uid === activeTurnUid;
            const dimOthers = !!activeTurnUid && p.uid !== activeTurnUid;
            const isTyping = !!typingUid && p.uid === typingUid;

            return (
              <CrewItem key={p.uid} $isMe={isMe} $hasTurn={hasTurn} $dim={dimOthers}>
                <AvatarFrame data-skin={pSkin}>
                  <PlayerAvatar type={pType} size={40} />
                </AvatarFrame>

                <CrewInfo>
                  <CrewName>
                    {p.name}
                    {isTyping && <TypingPill>typing…</TypingPill>}
                  </CrewName>
                  <CrewStatus>{hasTurn ? "IMPOSTER?" : "ONLINE"}</CrewStatus>
                </CrewInfo>

                {isMe && <MeBadge>ME :)</MeBadge>}
              </CrewItem>
            );
          })}
        </CrewList>
      </CrewManifest>
    </>
  )}
</SideColumn>

      </ContentArea>
    </MainContainer>
  );
}

// --- STYLED COMPONENTS ---

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 5px #22c55e; }
  50% { box-shadow: 0 0 20px #22c55e, 0 0 10px #22c55e inset; }
  100% { box-shadow: 0 0 5px #22c55e; }
`;

const MainContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  color: #fff;
  position: relative;
  overflow-x: hidden;
`;

const BackgroundOrb = styled.div`
  position: fixed;
  top: -20%;
  left: -20%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(0,0,0,0) 70%);
  z-index: -1;
  pointer-events: none;
`;

const LoadingScreen = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: monospace;
  color: #6366f1;
  font-size: 1.5rem;
  letter-spacing: 2px;
`;

const HudHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 768px) {
    visibility: hidden;
  }
`;

const GameStatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: monospace;
  font-size: 0.9rem;
  color: #94a3b8;
  letter-spacing: 1px;
`;

const StatusPulse = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: ${pulseGlow} 2s infinite;
`;

const PhaseIndicator = styled.div`
  font-size: 0.9rem;
  color: #64748b;
  
  span {
    color: #fff;
    font-weight: 800;
    margin-left: 0.5rem;
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 900px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const ActionColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SideColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

/* --- 3D CARD FLIP --- */

const PerspectiveContainer = styled.div`
  perspective: 1000px;
  width: 100%;
  height: 350px;
  margin-bottom: 1rem;
  cursor: pointer;
`;

const FlipCard = styled.div<{ $flipped: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform: ${({ $flipped }) => ($flipped ? "rotateY(180deg)" : "rotateY(0deg)")};
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardFront = styled(CardFace)`
  background: linear-gradient(145deg, #1e293b, #0f172a);
  color: white;
  
  &::before {
     content: "";
     position: absolute;
     inset: 0;
     border-radius: 24px;
     background: repeating-linear-gradient(
        45deg,
        rgba(255,255,255,0.03) 0px,
        rgba(255,255,255,0.03) 1px,
        transparent 1px,
        transparent 10px
     );
  }
`;

const CardBack = styled(CardFace)<{ $isImposter: boolean }>`
  background: ${({ $isImposter }) => 
    $isImposter 
      ? "linear-gradient(145deg, #450a0a, #7f1d1d)" 
      : "linear-gradient(145deg, #0c4a6e, #0369a1)"};
  transform: rotateY(180deg);
`;

const FingerprintIcon = styled.div`
  font-size: 5rem;
  color: rgba(255,255,255,0.1);
  margin-bottom: 1.5rem;
  animation: ${float} 4s ease-in-out infinite;
`;

const TapText = styled.h2`
  font-size: 1.8rem;
  letter-spacing: 3px;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(to right, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SubText = styled.p`
  color: #64748b;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const RoleIconWrapper = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
`;

const RoleTitle = styled.h2`
  font-size: 2rem;
  text-transform: uppercase;
  font-weight: 900;
  margin: 0 0 1.5rem 0;
  letter-spacing: 1px;
`;
const RoleMiniCard = styled.div<{
  $isImposter: boolean;
  $compact?: boolean;
  $hidden?: boolean;
}>`
  width: 100%;
  margin-bottom: 1rem;
  border-radius: 16px;
  padding: 1rem;

  /* ✅ NORMAL / ROLE-BASED BAKGRUNN */
  background: ${({ $isImposter, $hidden }) =>
    $hidden
      ? "linear-gradient(145deg, rgba(55, 65, 81, 0.75), rgba(31, 41, 55, 0.75))"
      : $isImposter
      ? "linear-gradient(145deg, rgba(69, 10, 10, 0.75), rgba(127, 29, 29, 0.55))"
      : "linear-gradient(145deg, rgba(12, 74, 110, 0.75), rgba(3, 105, 161, 0.55))"};

  border: 1px solid
    ${({ $hidden }) =>
      $hidden ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.08)"};

  backdrop-filter: blur(10px);

  cursor: pointer;
  user-select: none;
  transition: background 0.25s ease, filter 0.25s ease;

  /* ✅ NÅ BLURRER VI HELE INNHOLDET */
  ${({ $hidden }) =>
    $hidden &&
    css`
      filter: saturate(0.2) brightness(0.9);

      ${RoleMiniTop},
      ${RoleMiniBody} {
        filter: blur(6px);
        opacity: 0.8;
      }
    `}

  ${({ $compact }) =>
    $compact &&
    css`
      padding: 0.75rem;
      border-radius: 14px;
      margin-bottom: -1rem;

      ${RoleMiniTitle} {
        font-size: 0.85rem;
        letter-spacing: 1.2px;
      }

      ${RoleMiniTag} {
        font-size: 0.65rem;
        padding: 3px 7px;
      }

      ${MiniValue} {
        font-size: 1rem;
      }
    `}
`;


const RoleMiniHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const MiniToggle = styled.div`
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.18);
  color: rgba(255,255,255,0.85);
`;

const HiddenPlaceholder = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RoleMiniTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const RoleMiniTitle = styled.div`
  font-weight: 900;
  letter-spacing: 1.5px;
  font-size: 0.95rem;
`;

const RoleMiniTag = styled.div`
  font-size: 1.15rem;
  letter-spacing: 2px;
  padding: 4px 8px;
  border-radius: 999px;
  

  color: rgba(255,255,255,0.8);
`;

const RoleMiniBody = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;

const MiniLabel = styled.div`
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.65);
`;

const MiniValue = styled.div`
  font-size: 1.15rem;
  font-weight: 900;
  color: #fff;
  line-height: 1.2;
  word-break: break-word;
`;

const SecretContainer = styled.div<{ $isImposter: boolean }>`
  background: rgba(0,0,0,0.3);
  padding: 1.5rem;
  border-radius: 12px;
  width: 80%;
  text-align: center;
  border: 1px solid ${({ $isImposter }) => $isImposter ? "rgba(252, 165, 165, 0.3)" : "rgba(125, 211, 252, 0.3)"};
`;

const SecretLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.6);
  margin-bottom: 0.5rem;
`;

const SecretValue = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
`;

const HideInstruction = styled.div`
  margin-top: 2rem;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PhaseActionBox = styled.div`
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  
  h3 { margin-top: 0; font-size: 1.5rem; }
  p { color: #94a3b8; margin-bottom: 1.5rem; }
`;

const GlassPanel = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  overflow: hidden;
`;

const NeonButton = styled.button`
  background: linear-gradient(90deg, #4f46e5, #6366f1);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 0 25px rgba(99, 102, 241, 0.6);
  }
`;

const WaitingText = styled.div`
  color: #64748b;
  font-style: italic;
  font-family: monospace;
`;

/* --- CREW LIST --- */

const CrewManifest = styled.div`
  background: rgba(15, 23, 42, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ManifestTitle = styled.h4`
  margin: 0 0 1rem 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #64748b;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 0.5rem;
`;

const CrewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CrewItem = styled.div<{ $isMe: boolean; $hasTurn?: boolean; $dim?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;

  border-radius: 0 8px 8px 0;
  transition: all 0.2s ease;

  background: ${({ $isMe, $hasTurn }) =>
    $hasTurn
      ? "rgba(99, 102, 241, 0.28)"
      : $isMe
      ? "rgba(99, 102, 241, 0.15)"
      : "rgba(255,255,255,0.03)"};

  border-left: 2px solid ${({ $hasTurn, $isMe }) => ($hasTurn ? "#a5b4fc" : $isMe ? "#6366f1" : "transparent")};

  opacity: ${({ $dim }) => ($dim ? 0.45 : 1)};
  filter: ${({ $dim }) => ($dim ? "saturate(0.6)" : "none")};

  ${({ $hasTurn }) =>
    $hasTurn &&
    css`
      transform: translateX(2px);
      box-shadow: 0 0 18px rgba(99, 102, 241, 0.18);
    `}
`;

const TypingPill = styled.span`
  margin-left: 0.5rem;
  font-size: 0.65rem;
  letter-spacing: 1px;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid rgba(56, 189, 248, 0.25);
  background: rgba(56, 189, 248, 0.08);
  color: #7dd3fc;
`;


const AvatarFrame = styled.div`
  /* Avatar skin logic copied from original */
  &[data-skin="classic"] { filter: contrast(1.02); }
  &[data-skin="midnight"] { filter: hue-rotate(210deg) saturate(1.25) brightness(0.92); }
  &[data-skin="mint"] { filter: hue-rotate(135deg) saturate(1.15) brightness(1.05); }
  &[data-skin="sunset"] { filter: hue-rotate(320deg) saturate(1.25) brightness(1.03); }
  &[data-skin="cyber"] { filter: hue-rotate(260deg) saturate(1.45) brightness(0.98); }
`;

const CrewInfo = styled.div`
  flex: 1;
`;

const CrewName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: #e2e8f0;
`;

const CrewStatus = styled.div`
  font-size: 0.7rem;
  color: #22c55e;
  letter-spacing: 1px;
`;

const MeBadge = styled.div`
  background: #6366f1;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 800;
`;
const AttachedStack = styled.div`
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(15, 23, 42, 0.55);
`;

const CrewManifestMobile = styled.div`
  padding: 1rem;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(255,255,255,0.08);

  /* Top rounded, bottom sharp */
  border-radius: 16px 16px 0 0;
`;

const ChatShellMobile = styled.div`
  /* Top sharp, bottom rounded */
  border-radius: 0 0 16px 16px;
  overflow: hidden;

  /* viktig: ChatPanel sin root bør fylle */
`;
