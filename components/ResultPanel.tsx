"use client";

import React, { useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import type { Player } from "@/types/player";
import { resetGame } from "@/firebase/lobby";

type Props = {
  inviteCode: string;
  players: Player[];
  imposterUid: string;
  result: { winner: "crew" | "imposter"; loser?: "crew" | "imposter"; eliminatedUid: string };
  isHost: boolean;
  hostUid: string;
};

export default function ResultPanel({ inviteCode, players, imposterUid, result, isHost, hostUid }: Props) {
  const [resetting, setResetting] = useState(false);

  const nameByUid = useMemo(() => {
    const m = new Map<string, string>();
    players.forEach((p) => m.set(p.uid, p.name));
    return m;
  }, [players]);

  const imposterName = nameByUid.get(imposterUid) ?? "Unknown";
  const eliminatedName = nameByUid.get(result.eliminatedUid) ?? "Skipped Vote";

  const crewWon = result.winner === "crew";

  const handlePlayAgain = async () => {
    try {
      setResetting(true);
      await resetGame(inviteCode, hostUid);
    } catch (e) {
      console.error(e);
      setResetting(false);
    }
  };

  return (
    <ResultContainer $crewWon={crewWon}>
      <ResultHeader>
        <SubTitle>GAME OVER</SubTitle>
        <MainTitle $crewWon={crewWon}>
            {crewWon ? "CREW VICTORY" : "IMPOSTER WINS"}
        </MainTitle>
      </ResultHeader>

      <ReportCard>
        <ReportRow>
             <Label>The Imposter was</Label>
             <BigValue $color="#fca5a5">{imposterName}</BigValue>
        </ReportRow>
        
        <Divider />
        
        <ReportRow>
             <Label>Eliminated</Label>
             <Value>{eliminatedName}</Value>
        </ReportRow>
        
        <ReportRow>
             <Label>Outcome</Label>
             <Value>{crewWon ? "Imposter Eliminated" : "Crew Eliminated Wrong Person"}</Value>
        </ReportRow>
      </ReportCard>

      <Footer>
        {isHost ? (
          <ResetBtn onClick={handlePlayAgain} disabled={resetting} $crewWon={crewWon}>
            {resetting ? "REBOOTING..." : "PLAY AGAIN"}
          </ResetBtn>
        ) : (
          <Waiting>Waiting for host to restart...</Waiting>
        )}
      </Footer>
    </ResultContainer>
  );
}

// --- STYLES ---

const slideUp = keyframes`
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;

const ResultContainer = styled.div<{ $crewWon: boolean }>`
  width: 100%;
  text-align: center;
  animation: ${slideUp} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  
  --theme-color: ${({ $crewWon }) => ($crewWon ? "#22c55e" : "#ef4444")};
`;

const ResultHeader = styled.div`
  margin-bottom: 2rem;
`;

const SubTitle = styled.div`
  font-family: monospace;
  color: #94a3b8;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const MainTitle = styled.h1<{ $crewWon: boolean }>`
  font-size: 3rem;
  font-weight: 900;
  margin: 0;
  text-transform: uppercase;
  background: ${({ $crewWon }) => 
    $crewWon 
      ? "linear-gradient(to bottom, #86efac, #22c55e)" 
      : "linear-gradient(to bottom, #fca5a5, #ef4444)"};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 15px ${({ $crewWon }) => ($crewWon ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)")});
`;

const ReportCard = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
`;

const ReportRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const Label = styled.div`
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
  color: #64748b;
`;

const Value = styled.div`
  font-size: 1.25rem;
  color: #e2e8f0;
  font-weight: 600;
`;

const BigValue = styled(Value)<{ $color?: string }>`
  font-size: 2rem;
  font-weight: 900;
  color: ${({ $color }) => $color || "#fff"};
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255,255,255,0.1);
  width: 100%;
  margin: 1rem 0;
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
`;

const ResetBtn = styled.button<{ $crewWon: boolean }>`
  background: var(--theme-color);
  color: #000;
  border: none;
  padding: 1rem 3rem;
  font-weight: 900;
  font-size: 1.1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 0 20px var(--theme-color);

  &:hover {
      transform: scale(1.05);
  }
  
  &:disabled {
      opacity: 0.7;
      cursor: wait;
  }
`;

const Waiting = styled.div`
    color: #94a3b8;
    font-style: italic;
    animation: pulse 2s infinite;
`;