"use client";

import React, { useMemo } from "react";
import styled from "styled-components";
import type { Player } from "@/types/player";

type Props = {
  players: Player[];
  imposterUid: string;
  result: { winner: "crew" | "imposter"; eliminatedUid: string };
};

export default function ResultPanel({ players, imposterUid, result }: Props) {
  const nameByUid = useMemo(() => {
    const m = new Map<string, string>();
    players.forEach((p) => m.set(p.uid, p.name));
    return m;
  }, [players]);

  const imposterName = nameByUid.get(imposterUid) ?? "Unknown";
  const eliminatedName = nameByUid.get(result.eliminatedUid) ?? "Unknown";

  return (
    <Wrap>
      <Title>Game Over</Title>

      <Winner $winner={result.winner}>
        Winner: <b>{result.winner === "crew" ? "CREW" : "IMPOSTER"}</b>
      </Winner>

      <Box>
        <Row>
          <Label>Imposter was:</Label>
          <Value>{imposterName}</Value>
        </Row>
        <Row>
          <Label>Eliminated:</Label>
          <Value>{eliminatedName}</Value>
        </Row>
      </Box>
    </Wrap>
  );
}

const Wrap = styled.div`
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
`;

const Title = styled.div`
  font-size: 1.5rem;
  font-weight: 1000;
  color: #e2e8f0;
  margin-bottom: 0.75rem;
`;

const Winner = styled.div<{ $winner: "crew" | "imposter" }>`
  padding: 0.9rem;
  border-radius: 14px;
  font-weight: 900;
  margin-bottom: 1rem;
  color: ${({ $winner }) => ($winner === "crew" ? "#86efac" : "#fca5a5")};
  background: ${({ $winner }) => ($winner === "crew" ? "rgba(34, 197, 94, 0.10)" : "rgba(239, 68, 68, 0.10)")};
  border: 1px solid ${({ $winner }) => ($winner === "crew" ? "rgba(34, 197, 94, 0.18)" : "rgba(239, 68, 68, 0.18)")};
`;

const Box = styled.div`
  background: rgba(2, 6, 23, 0.45);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 1rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
`;

const Label = styled.div`
  color: #94a3b8;
`;

const Value = styled.div`
  font-weight: 900;
  color: #e2e8f0;
`;
