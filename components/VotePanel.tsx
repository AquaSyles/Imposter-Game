"use client";

import React, { useMemo, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import type { Player } from "@/types/player";
import { submitVote } from "@/firebase/lobby";
import { FaFingerprint, FaCheckCircle } from "react-icons/fa";

type Props = {
  inviteCode: string;
  myUid: string;
  players: Player[];
  votes: Record<string, string>;
};

export default function VotePanel({ inviteCode, myUid, players, votes }: Props) {
  const [selected, setSelected] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const iVoted = !!votes?.[myUid];
  const voteCount = useMemo(() => Object.keys(votes ?? {}).length, [votes]);
  
  // Players I can vote for (everyone except me)
  const candidates = useMemo(() => players.filter(p => p.uid !== myUid), [players, myUid]);

  const handleVote = async () => {
    setError(null);
    if (!selected) return;

    try {
      setSending(true);
      await submitVote(inviteCode, myUid, selected);
    } catch (e: any) {
      setError(e?.message ?? "Vote failed");
      setSending(false);
    }
  };

  if (iVoted) {
      return (
          <VotedState>
              <PulseIcon><FaFingerprint /></PulseIcon>
              <VotedTitle>VOTE REGISTERED</VotedTitle>
              <VotedSub>Analysis pending... Waiting for crew consensus.</VotedSub>
              <ProgressBar>
                  <ProgressFill style={{ width: `${(voteCount / players.length) * 100}%` }} />
              </ProgressBar>
              <Count>{voteCount} / {players.length} votes cast</Count>
          </VotedState>
      )
  }

  return (
    <PanelWrap>
      <HeaderSection>
        <AlertTitle>EMERGENCY MEETING</AlertTitle>
        <Subtitle>Identify the Imposter. Choose carefully.</Subtitle>
      </HeaderSection>

      <SuspectGrid>
        {candidates.map((p) => (
          <SuspectCard
            key={p.uid}
            $selected={selected === p.uid}
            onClick={() => setSelected(p.uid)}
          >
            <SuspectAvatar>
                {/* Placeholder for avatar, or import real avatar here if available */}
                <div style={{fontSize: '2rem'}}>👤</div> 
            </SuspectAvatar>
            <SuspectName>{p.name}</SuspectName>
            <SuspectStatus>{selected === p.uid ? "TARGET ACQUIRED" : "SUSPECT"}</SuspectStatus>
            {selected === p.uid && <TargetOverlay />}
          </SuspectCard>
        ))}
      </SuspectGrid>

      <ActionFooter>
        <VoteButton 
            onClick={handleVote} 
            disabled={!selected || sending}
            $active={!!selected}
        >
            {sending ? "TRANSMITTING..." : selected ? "CONFIRM ACCUSATION" : "SELECT A SUSPECT"}
        </VoteButton>
      </ActionFooter>

      {error && <ErrorMsg>{error}</ErrorMsg>}
    </PanelWrap>
  );
}

// --- STYLES ---

const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

const PanelWrap = styled.div`
  width: 100%;
  animation: ${fadeIn} 0.5s ease-out;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const AlertTitle = styled.h2`
  color: #ef4444;
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
`;

const Subtitle = styled.div`
  color: #94a3b8;
  margin-top: 0.5rem;
`;

const SuspectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SuspectCard = styled.div<{ $selected: boolean }>`
  position: relative;
  background: ${({ $selected }) => $selected ? "rgba(220, 38, 38, 0.1)" : "rgba(30, 41, 59, 0.5)"};
  border: 1px solid ${({ $selected }) => $selected ? "#ef4444" : "rgba(255,255,255,0.1)"};
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;

  &:hover {
    background: rgba(220, 38, 38, 0.05);
    border-color: rgba(239, 68, 68, 0.5);
    transform: translateY(-2px);
  }

  ${({ $selected }) => $selected && css`
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
    transform: scale(1.05);
  `}
`;

const SuspectAvatar = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(0,0,0,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
`;

const SuspectName = styled.div`
  font-weight: 700;
  color: #e2e8f0;
  text-align: center;
  font-size: 0.9rem;
`;

const SuspectStatus = styled.div`
  font-size: 0.65rem;
  margin-top: 0.25rem;
  color: #94a3b8;
  letter-spacing: 1px;
`;

const TargetOverlay = styled.div`
  position: absolute;
  inset: 0;
  border: 2px solid #ef4444;
  border-radius: 12px;
  pointer-events: none;
  
  &::after {
      content: "";
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 100px; height: 100px;
      background: radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%);
  }
`;

const ActionFooter = styled.div`
  display: flex;
  justify-content: center;
`;

const VoteButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => $active ? "#ef4444" : "#334155"};
  color: ${({ $active }) => $active ? "#fff" : "#94a3b8"};
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 1px;
  cursor: ${({ $active }) => $active ? "pointer" : "not-allowed"};
  transition: all 0.2s;
  box-shadow: ${({ $active }) => $active ? "0 0 20px rgba(239, 68, 68, 0.4)" : "none"};

  &:hover {
      filter: brightness(1.1);
  }
`;

const ErrorMsg = styled.div`
  margin-top: 1rem;
  color: #fca5a5;
  text-align: center;
  font-size: 0.9rem;
`;

// --- VOTED STATE ---

const VotedState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    animation: ${fadeIn} 0.5s ease-out;
`;

const pulse = keyframes`
    0% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 0.5; }
`;

const PulseIcon = styled.div`
    font-size: 4rem;
    color: #22c55e;
    margin-bottom: 1.5rem;
    animation: ${pulse} 2s infinite;
`;

const VotedTitle = styled.h2`
    font-size: 1.5rem;
    color: #fff;
    margin: 0 0 0.5rem 0;
`;

const VotedSub = styled.p`
    color: #94a3b8;
    margin-bottom: 2rem;
`;

const ProgressBar = styled.div`
    width: 100%;
    max-width: 300px;
    height: 6px;
    background: #1e293b;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 1rem;
`;

const ProgressFill = styled.div`
    height: 100%;
    background: #22c55e;
    transition: width 0.5s ease;
`;

const Count = styled.div`
    font-family: monospace;
    color: #64748b;
`;