"use client";

import { useState } from "react";
import styled, { css, keyframes } from "styled-components";
import type { Player } from "@/types/player";
import { FaUserSecret, FaUserAstronaut, FaEye, FaEyeSlash } from "react-icons/fa";

type GameData = {
  word?: string;
  imposterUid?: string;
  imposterHint?: string;
  assignments?: Record<string, { role: "imposter" | "word" }>;
};

type GameProps = {
  players: Player[];
  myUid: string;
  game: GameData | null | undefined;
};

/* ---------------- GAME COMPONENT ---------------- */

export default function Game({ players, myUid, game }: GameProps) {
  const role = game?.assignments?.[myUid]?.role;
  const isImposter = role === "imposter";
  const word = game?.word;
  const hint = game?.imposterHint;

  const [revealed, setRevealed] = useState(false);

  // Finn antall imposters (i denne versjonen er det alltid 1, men kjekt å ha)
  const imposterCount = 1;

  if (!role) return <Loading>Assigning roles...</Loading>;

  return (
    <Container>
      <StatusHeader>
        <StatusDot $active={true} /> Game in Progress
      </StatusHeader>

      <RoleCard onClick={() => setRevealed(!revealed)} $isImposter={isImposter && revealed}>
        <CardContent>
          {!revealed ? (
            <HiddenState>
              <LockIcon>🔒</LockIcon>
              <TapText>Tap to reveal your role</TapText>
              <SubText>Keep your screen hidden!</SubText>
            </HiddenState>
          ) : (
            <RevealedState>
              <RoleIcon>
                {isImposter ? <FaUserSecret size={50} /> : <FaUserAstronaut size={50} />}
              </RoleIcon>
              
              <RoleTitle $isImposter={isImposter}>
                {isImposter ? "YOU ARE THE IMPOSTER" : "YOU ARE CREW"}
              </RoleTitle>

              <Divider />

              {isImposter ? (
                <InfoBox $type="imposter">
                  <InfoLabel>Your Hint</InfoLabel>
                  <SecretWord>{hint ?? "No hint"}</SecretWord>
                  <InfoDesc>Blend in. Don't let them know you don't know the word.</InfoDesc>
                </InfoBox>
              ) : (
                <InfoBox $type="crew">
                  <InfoLabel>Secret Word</InfoLabel>
                  <SecretWord>{word ?? "Loading..."}</SecretWord>
                  <InfoDesc>Find the imposter who doesn't know this word.</InfoDesc>
                </InfoBox>
              )}
              
              <HideButton>
                 <FaEyeSlash /> Hide Role
              </HideButton>
            </RevealedState>
          )}
        </CardContent>
      </RoleCard>

      <PlayerGrid>
        <SectionTitle>Crewmates ({players.length})</SectionTitle>
        <List>
          {players.map((p) => (
            <PlayerRow key={p.uid} $isMe={p.uid === myUid}>
              <AvatarPlaceholder>{p.avatar === 'astronaut' ? '👨‍🚀' : '👽'}</AvatarPlaceholder>
              <PName>{p.name} {p.uid === myUid && "(You)"}</PName>
              <Status>Alive</Status>
            </PlayerRow>
          ))}
        </List>
      </PlayerGrid>
    </Container>
  );
}

/* ---------------- STYLED COMPONENTS ---------------- */

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: #fff;
`;

const Loading = styled.div`
  text-align: center;
  font-size: 1.5rem;
  color: #94a3b8;
  margin-top: 4rem;
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatusDot = styled.div<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #22c55e;
  box-shadow: 0 0 10px #22c55e;
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const RoleCard = styled.div<{ $isImposter: boolean }>`
  position: relative;
  min-height: 320px;
  background: ${({ $isImposter }) => 
    $isImposter 
      ? "linear-gradient(135deg, #450a0a, #7f1d1d)" 
      : "linear-gradient(135deg, #1e293b, #334155)"};
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }
`;

const CardContent = styled.div`
  height: 100%;
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const HiddenState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: ${pulse} 3s infinite;
`;

const LockIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const TapText = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #fff;
`;

const SubText = styled.p`
  color: #94a3b8;
  margin: 0;
`;

const RevealedState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const RoleIcon = styled.div`
  margin-bottom: 1rem;
  color: #fff;
`;

const RoleTitle = styled.h2<{ $isImposter: boolean }>`
  font-size: 1.75rem;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0 0 1.5rem 0;
  text-align: center;
  color: ${({ $isImposter }) => ($isImposter ? "#fca5a5" : "#60a5fa")};
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255,255,255,0.15);
  margin-bottom: 1.5rem;
`;

const InfoBox = styled.div<{ $type: "imposter" | "crew" }>`
  background: rgba(0,0,0,0.3);
  padding: 1.5rem;
  border-radius: 16px;
  width: 100%;
  text-align: center;
  border: 1px solid ${({ $type }) => ($type === "imposter" ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.3)")};
`;

const InfoLabel = styled.div`
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94a3b8;
  margin-bottom: 0.5rem;
`;

const SecretWord = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const InfoDesc = styled.div`
  font-size: 0.9rem;
  color: #cbd5e1;
`;

const HideButton = styled.div`
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #94a3b8;
  opacity: 0.7;
`;

/* ---------------- PLAYER LIST STYLES ---------------- */

const PlayerGrid = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #94a3b8;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PlayerRow = styled.div<{ $isMe: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: ${({ $isMe }) => ($isMe ? "rgba(59, 130, 246, 0.15)" : "rgba(30, 41, 59, 0.4)")};
  border: 1px solid ${({ $isMe }) => ($isMe ? "rgba(59, 130, 246, 0.3)" : "rgba(255,255,255,0.05)")};
  border-radius: 10px;
`;

const AvatarPlaceholder = styled.div`
  font-size: 1.5rem;
`;

const PName = styled.div`
  flex: 1;
  font-weight: 500;
  color: #e2e8f0;
`;

const Status = styled.div`
  font-size: 0.8rem;
  color: #22c55e;
`;