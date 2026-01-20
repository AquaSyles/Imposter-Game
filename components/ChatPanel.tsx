"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import type { Player } from "@/types/player";
import { submitChatWord } from "@/firebase/lobby";
import { FaPaperPlane, FaBroadcastTower, FaLock } from "react-icons/fa";
import type { AvatarSkin, AvatarType } from "@/firebase/avatarPrefs";

import { PlayerAvatar } from "@/components/avatars/PlayerAvatar";

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

  avatarTypeByUid?: Record<string, AvatarType>;
  skinByUid?: Record<string, AvatarSkin>;

  avatarSize?: number;
  secretWord?: string | null;
  isImposter?: boolean;
};

export default function ChatPanel({
  inviteCode,
  myUid,
  players,
  chat,
  avatarTypeByUid = {},
  skinByUid = {},
  avatarSize = 42,
  secretWord = null,
  isImposter = false,
}: Props) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMyTurn = chat.turnUid === myUid;

  const nameByUid = useMemo(() => {
    const m = new Map<string, string>();
    players.forEach((p) => m.set(p.uid, p.name));
    return m;
  }, [players]);

  const turnName = nameByUid.get(chat.turnUid) ?? "Unknown";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.log]);

  const handleSend = async () => {
    setError(null);
    if (!isMyTurn || !input.trim()) return;

    const normalized = input.trim().toLowerCase();
    const secret = (secretWord ?? "").trim().toLowerCase();
    if (!isImposter && secret && normalized === secret) {
      setError("Crew cannot transmit the secret word.");
      return;
    }

    try {
      setSending(true);
      await submitChatWord(inviteCode, myUid, input.trim());
      setInput("");
    } catch (e: any) {
      setError(e?.message ?? "Transmission failed");
    } finally {
      setSending(false);
    }
  };

  const groupedMessages = useMemo(() => {
    const groups: { type: "round" | "msg"; data: any }[] = [];
    let currentRound = 0;

    chat.log.forEach((msg) => {
      if (msg.round !== currentRound) {
        currentRound = msg.round;
        groups.push({ type: "round", data: currentRound });
      }
      groups.push({ type: "msg", data: msg });
    });

    return groups;
  }, [chat.log]);

  return (
    <PanelWrap>
      <HeaderBar $isMyTurn={isMyTurn}>
        <StatusIcon>{isMyTurn ? <FaBroadcastTower /> : <FaLock />}</StatusIcon>
        <StatusText>
          {isMyTurn ? (
            <span>
              CHANNEL OPEN: <b>YOUR TURN</b>
            </span>
          ) : (
            <span>
              WAITING FOR: <b>{turnName.toUpperCase()}</b>
            </span>
          )}
        </StatusText>
        <RoundBadge>ROUND {chat.round}</RoundBadge>
      </HeaderBar>

      <ChatWindow>
        {groupedMessages.length === 0 && (
          <EmptyState>
            <FaBroadcastTower size={40} />
            <p>
              Comms Link Established.
              <br />
              Waiting for first transmission...
            </p>
          </EmptyState>
        )}

        {groupedMessages.map((item, idx) => {
          if (item.type === "round") {
            return (
              <RoundDivider key={`r-${item.data}`}>
                <span>Cycle {item.data} Initiated</span>
              </RoundDivider>
            );
          }

          const m = item.data as ChatLogItem;
          const isMe = m.uid === myUid;

          const msgSkin = skinByUid?.[m.uid] ?? "classic";
          const msgType = avatarTypeByUid?.[m.uid] ?? "classicAstronaut";

          return (
            <MessageRow key={`${m.at}-${idx}`} $isMe={isMe}>
              {/* LEFT avatar only for others */}
              {!isMe && (
                <AvatarCircle>
                  <SkinScope data-skin={msgSkin}>
                    <PlayerAvatar type={msgType} size={avatarSize} />
                  </SkinScope>
                </AvatarCircle>
              )}

              <MessageBubble $isMe={isMe}>
                {!isMe && <SenderName>{nameByUid.get(m.uid)}</SenderName>}
                <MessageText>{m.text}</MessageText>
              </MessageBubble>

              {/* RIGHT avatar only for me */}
              {isMe && (
                <AvatarCircle $isMe>
                  <SkinScope data-skin={msgSkin}>
                    <PlayerAvatar type={msgType} size={avatarSize} />
                  </SkinScope>
                </AvatarCircle>
              )}
            </MessageRow>
          );
        })}

        <div ref={messagesEndRef} />
      </ChatWindow>

      <InputArea>
        <StyledInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isMyTurn ? "Transmit one word..." : `Waiting for ${turnName}...`}
          disabled={!isMyTurn || sending}
          autoFocus={isMyTurn}
          maxLength={20}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <SendButton onClick={handleSend} disabled={!isMyTurn || sending || !input.trim()}>
          {sending ? "..." : <FaPaperPlane />}
        </SendButton>
      </InputArea>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </PanelWrap>
  );
}

/* --- STYLES --- */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseBorder = keyframes`
  0% { border-color: rgba(99, 102, 241, 0.3); box-shadow: 0 0 0 rgba(99, 102, 241, 0); }
  50% { border-color: rgba(99, 102, 241, 0.8); box-shadow: 0 0 15px rgba(99, 102, 241, 0.3); }
  100% { border-color: rgba(99, 102, 241, 0.3); box-shadow: 0 0 0 rgba(99, 102, 241, 0); }
`;

const PanelWrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px; /* Fixed height for consistency */
  width: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(10px);
  /* The GlassPanel in parent handles borders, but we ensure layout fills it */
`;

const HeaderBar = styled.div<{ $isMyTurn: boolean }>`
  padding: 0.75rem 1rem;
  background: ${({ $isMyTurn }) => $isMyTurn
        ? "linear-gradient(90deg, rgba(79, 70, 229, 0.2), rgba(6, 182, 212, 0.1))"
        : "rgba(15, 23, 42, 0.6)"};
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
`;

const StatusIcon = styled.div`
  color: #fff;
  font-size: 1.1rem;
`;

const StatusText = styled.div`
  flex: 1;
  font-size: 0.85rem;
  color: #cbd5e1;
  letter-spacing: 0.5px;
  
  b {
    color: #fff;
    margin-left: 4px;
    text-transform: uppercase;
  }
`;

const RoundBadge = styled.div`
  font-size: 0.7rem;
  background: rgba(255,255,255,0.1);
  padding: 2px 8px;
  border-radius: 4px;
  color: #94a3b8;
  border: 1px solid rgba(255,255,255,0.05);
`;

const ChatWindow = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  scroll-behavior: smooth;

  /* Custom Scrollbar */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #475569;
  text-align: center;
  
  p { margin-top: 1rem; font-size: 0.9rem; }
`;

const RoundDivider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0 1rem 0;
  
  &::before, &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.1);
  }
  
  span {
    padding: 0 1rem;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 2px;
  }
`;

const MessageRow = styled.div<{ $isMe: boolean }>`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  justify-content: ${({ $isMe }) => $isMe ? "flex-end" : "flex-start"};
  margin-bottom: 0.25rem;
  animation: ${fadeIn} 0.3s ease-out;
`;
const SkinScope = styled.div`
  --hue: 0deg;
  --sat: 1;
  --bright: 1;
  --contrast: 1;

  display: grid;
  place-items: center;

  & > * {
    filter: hue-rotate(var(--hue)) saturate(var(--sat)) brightness(var(--bright)) contrast(var(--contrast));
  }

  &[data-skin="classic"] { --hue: 0deg; --sat: 1; --bright: 1; --contrast: 1.02; }
  &[data-skin="midnight"] { --hue: 210deg; --sat: 1.25; --bright: 0.92; --contrast: 1.15; }
  &[data-skin="mint"] { --hue: 135deg; --sat: 1.15; --bright: 1.05; --contrast: 1.05; }
  &[data-skin="sunset"] { --hue: 320deg; --sat: 1.25; --bright: 1.03; --contrast: 1.08; }
  &[data-skin="cyber"] { --hue: 260deg; --sat: 1.45; --bright: 0.98; --contrast: 1.25; }
`;

const AvatarCircle = styled.div<{ $isMe?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ $isMe }) => ($isMe ? "rgba(79, 70, 229, 0.35)" : "rgba(51, 65, 85, 0.55)")};
  display: grid;
  place-items: center;
  border: 1px solid rgba(255,255,255,0.12);
  overflow: hidden;
`;

const MessageBubble = styled.div<{ $isMe: boolean }>`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  position: relative;
  
  /* Bubble Tail logic */
  border-bottom-left-radius: ${({ $isMe }) => $isMe ? "16px" : "2px"};
  border-bottom-right-radius: ${({ $isMe }) => $isMe ? "2px" : "16px"};

  background: ${({ $isMe }) => $isMe
        ? "linear-gradient(135deg, #4f46e5, #4338ca)"
        : "rgba(30, 41, 59, 0.8)"};
  
  border: 1px solid ${({ $isMe }) => $isMe
        ? "rgba(99, 102, 241, 0.5)"
        : "rgba(255,255,255,0.05)"};

  color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const SenderName = styled.div`
  font-size: 0.65rem;
  color: #94a3b8;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MessageText = styled.div`
  font-size: 1rem;
  line-height: 1.4;
`;

const InputArea = styled.div`
  padding: 1rem;
  background: rgba(2, 6, 23, 0.3);
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  gap: 0.75rem;
`;

const StyledInput = styled.input`
  flex: 1;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.9rem 1.2rem;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;

  &:focus {
    background: rgba(15, 23, 42, 0.9);
    border-color: #6366f1;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.15);
  }

  &:disabled {
    background: rgba(0,0,0,0.2);
    border-color: transparent;
    color: #64748b;
    cursor: not-allowed;
  }
  
  ${props => !props.disabled && css`
    animation: ${pulseBorder} 2s infinite;
  `}
`;

const SendButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: none;
  background: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #4338ca;
    transform: scale(1.05);
  }

  &:disabled {
    background: #1e293b;
    color: #475569;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(220, 38, 38, 0.2);
  color: #fca5a5;
  font-size: 0.8rem;
  text-align: center;
  padding: 0.5rem;
  border-top: 1px solid rgba(239, 68, 68, 0.3);
`;