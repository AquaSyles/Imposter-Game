"use client";

import React, { useMemo, useState } from "react";
import styled from "styled-components";
import type { Player } from "@/types/player";
import { submitVote } from "@/firebase/lobby";

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
  const total = players.length;

  const handleVote = async () => {
    setError(null);
    if (!selected) return;

    try {
      setSending(true);
      await submitVote(inviteCode, myUid, selected);
    } catch (e: any) {
      setError(e?.message ?? "Vote failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <Wrap>
      <Header>
        <Title>Vote</Title>
        <Sub>
          Votes: <b>{voteCount}</b> / {total}
        </Sub>
      </Header>

      <Grid>
        {players.map((p) => {
          const disabled = iVoted || p.uid === myUid;
          return (
            <Card
              key={p.uid}
              $selected={selected === p.uid}
              $disabled={disabled}
              onClick={() => {
                if (disabled) return;
                setSelected(p.uid);
              }}
            >
              <Name>
                {p.name} {p.uid === myUid ? "(You)" : ""}
              </Name>
              <Small>{disabled ? "Not selectable" : "Select"}</Small>
            </Card>
          );
        })}
      </Grid>

      <Actions>
        <Btn onClick={handleVote} disabled={iVoted || !selected || sending}>
          {iVoted ? "Voted" : sending ? "Voting..." : "Submit Vote"}
        </Btn>
      </Actions>

      {error && <ErrorBox>{error}</ErrorBox>}
      {iVoted && <Info>You have voted. Waiting for others…</Info>}
    </Wrap>
  );
}

const Wrap = styled.div`
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.25rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
`;

const Title = styled.div`
  font-weight: 900;
  font-size: 1.25rem;
  color: #e2e8f0;
`;

const Sub = styled.div`
  color: #94a3b8;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
`;

const Card = styled.div<{ $selected: boolean; $disabled: boolean }>`
  border-radius: 14px;
  padding: 1rem;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
  border: 1px solid rgba(255,255,255,0.08);
  background: ${({ $selected }) => ($selected ? "rgba(99, 102, 241, 0.25)" : "rgba(2, 6, 23, 0.35)")};

  &:hover {
    background: ${({ $disabled, $selected }) =>
      $disabled ? "rgba(2, 6, 23, 0.35)" : $selected ? "rgba(99, 102, 241, 0.30)" : "rgba(255,255,255,0.04)"};
  }
`;

const Name = styled.div`
  font-weight: 800;
  color: #e2e8f0;
`;

const Small = styled.div`
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #94a3b8;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const Btn = styled.button`
  padding: 0.9rem 1.4rem;
  border-radius: 14px;
  border: none;
  background: #4f46e5;
  color: #fff;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorBox = styled.div`
  margin-top: 0.75rem;
  color: #fecaca;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.75rem;
  border-radius: 12px;
`;

const Info = styled.div`
  margin-top: 0.75rem;
  color: #cbd5e1;
  text-align: center;
`;
