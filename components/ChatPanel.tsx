"use client";

import React, { useMemo, useState } from "react";
import styled from "styled-components";
import type { Player } from "@/types/player";
import { submitChatWord } from "@/firebase/lobby";

type ChatLogItem = {
  uid: string;
  text: string;
  round: number;
  index: number;
  at: number;
};

type ChatState = {
  round: number;
  turnIndex: number;
  turnUid: string;
  log: ChatLogItem[];
};

type Props = {
  inviteCode: string;
  myUid: string;
  players: Player[];
  chat: ChatState;
};

export default function ChatPanel({ inviteCode, myUid, players, chat }: Props) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const isMyTurn = chat.turnUid === myUid;

  const nameByUid = useMemo(() => {
    const m = new Map<string, string>();
    players.forEach((p) => m.set(p.uid, p.name));
    return m;
  }, [players]);

  const turnName = nameByUid.get(chat.turnUid) ?? "Unknown";

  const handleSend = async () => {
    setError(null);
    if (!isMyTurn) return;

    try {
      setSending(true);
      await submitChatWord(inviteCode, myUid, input);
      setInput("");
    } catch (e: any) {
      setError(e?.message ?? "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <Wrap>
      <Header>
        <Title>Chat (Round {chat.round}/3)</Title>
        <Turn>
          Turn: <b>{turnName}</b> {isMyTurn ? "(you)" : ""}
        </Turn>
        <Hint>Only ONE word. Everyone sees the chat.</Hint>
      </Header>

      <ChatBox>
        {chat.log?.length ? (
          chat.log.map((m, idx) => (
            <Msg key={`${m.at}-${idx}`}>
              <Tag>R{m.round}</Tag>
              <Name>{nameByUid.get(m.uid) ?? "Player"}</Name>
              <Word>{m.text}</Word>
            </Msg>
          ))
        ) : (
          <Empty>Chat will appear here…</Empty>
        )}
      </ChatBox>

      <Composer>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isMyTurn ? "Write ONE word…" : "Wait for your turn…"}
          disabled={!isMyTurn || sending}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <SendBtn onClick={handleSend} disabled={!isMyTurn || sending}>
          {sending ? "Sending..." : "Send"}
        </SendBtn>
      </Composer>

      {error && <ErrorBox>{error}</ErrorBox>}
    </Wrap>
  );
}

/* styles */

const Wrap = styled.div`
  width: 100%;
  max-width: 720px;
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
  font-weight: 800;
  font-size: 1.15rem;
  color: #e2e8f0;
`;

const Turn = styled.div`
  color: #cbd5e1;
`;

const Hint = styled.div`
  font-size: 0.9rem;
  color: #94a3b8;
`;

const ChatBox = styled.div`
  background: rgba(2, 6, 23, 0.5);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 0.75rem;
  min-height: 220px;
  max-height: 320px;
  overflow: auto;
`;

const Msg = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding: 0.45rem 0.5rem;
  border-radius: 10px;

  &:hover {
    background: rgba(255,255,255,0.04);
  }
`;

const Tag = styled.span`
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.2);
  color: #c7d2fe;
`;

const Name = styled.span`
  font-weight: 700;
  color: #e2e8f0;
`;

const Word = styled.span`
  color: #f1f5f9;
`;

const Empty = styled.div`
  color: #94a3b8;
  font-style: italic;
  padding: 1rem;
`;

const Composer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(30, 41, 59, 0.55);
  color: #fff;
  outline: none;

  &:disabled {
    opacity: 0.6;
  }
`;

const SendBtn = styled.button`
  padding: 0.85rem 1.2rem;
  border-radius: 12px;
  border: none;
  background: #4f46e5;
  color: white;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
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
