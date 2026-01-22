"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import type { Player } from "@/types/player";
import { submitChatWord, setTyping } from "@/firebase/lobby";
import { FaSatelliteDish, FaTerminal, FaChevronRight, FaHdd } from "react-icons/fa";
import type { AvatarSkin, AvatarType } from "@/firebase/avatarPrefs";
import { PlayerAvatar } from "@/components/avatars/PlayerAvatar";

// --- Types ---
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
  readOnly?: boolean;
};

export default function ChatPanel({
  inviteCode,
  myUid,
  players,
  chat,
  avatarTypeByUid = {},
  skinByUid = {},
  secretWord = null,
  isImposter = false,
  readOnly = false, 
}: Props) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const feedEndRef = useRef<HTMLDivElement>(null);
  const isMyTurn = chat.turnUid === myUid;

  const nameByUid = useMemo(() => {
    const m = new Map<string, string>();
    players.forEach((p) => m.set(p.uid, p.name));
    return m;
  }, [players]);

  const turnName = nameByUid.get(chat.turnUid) ?? "UNKNOWN";

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.log]);
  useEffect(() => {
  if (readOnly) return;
  if (!inviteCode || !myUid) return;

  // bare den som har turen skal sette typing
  if (!isMyTurn) return;

  const hasText = input.trim().length > 0;
  const t = setTimeout(() => {
    setTyping(inviteCode, myUid, hasText).catch(() => {});
  }, 250);

  return () => clearTimeout(t);
}, [input, inviteCode, myUid, isMyTurn, readOnly]);

  const handleSend = async () => {
    setError(null);
    if (!isMyTurn || !input.trim() || readOnly) return;

    const normalized = input.trim().toLowerCase();
    const secret = (secretWord ?? "").trim().toLowerCase();
    if (!isImposter && secret && normalized === secret) {
      setError("SECURITY VIOLATION: SECRET KEY DETECTED");
      return;
    }

    try {
      setSending(true);
      await submitChatWord(inviteCode, myUid, input.trim());
      setInput("");
    } catch (e: any) {
      setError("UPLINK ERROR");
   } finally {
  setSending(false);
  await setTyping(inviteCode, myUid, false).catch(() => {});
}

  };

  const groupedLog = useMemo(() => {
    const items: { type: "header" | "entry"; data: any }[] = [];
    let currentRound = 0;

    chat.log.forEach((msg) => {
      if (msg.round !== currentRound) {
        currentRound = msg.round;
        items.push({ type: "header", data: currentRound });
      }
      items.push({ type: "entry", data: msg });
    });
    return items;
  }, [chat.log]);

  return (
    <CyberContainer>
      <ScanlineOverlay />
      
      {/* HEADER */}
      <HeaderPanel>
        <HeaderContent>
            <StatusLight $active={isMyTurn && !readOnly} />
            <div style={{lineHeight: 1}}>
                <div style={{fontSize: '0.6rem', color: '#64748b', letterSpacing: '2px'}}>VINTRA NETWORK</div>
                <div style={{fontSize: '0.9rem', color: '#fff', fontWeight: 'bold'}}>
                    {readOnly ? "ARCHIVE REVIEW" : "LIVE CHAT"}
                </div>
            </div>
        </HeaderContent>
        <HeaderTech>
            <FaSatelliteDish /> 
            <span>R-{chat.round}</span>
        </HeaderTech>
      </HeaderPanel>

      {/* FEED LIST */}
      <FeedWindow>
        <GridBackground />
        
        {groupedLog.length === 0 && (
          <EmptyState>
            <FaHdd size={40} style={{marginBottom: '1rem', opacity: 0.5}}/>
            <div>DATA STREAM EMPTY</div>
            <div>AWAITING INPUT SEQUENCE...</div>
          </EmptyState>
        )}

        {groupedLog.map((item, idx) => {
          if (item.type === "header") {
            return (
              <CycleDivider key={`round-${item.data}`}>
                <div className="line" />
                <div className="label">CYCLE {item.data} INITIATED</div>
                <div className="line" />
              </CycleDivider>
            );
          }

          const m = item.data as ChatLogItem;
          const isMe = m.uid === myUid;
          const msgSkin = skinByUid?.[m.uid] ?? "classic";
          const msgType = avatarTypeByUid?.[m.uid] ?? "classicAstronaut";
          
          return (
            <DataCard key={`${m.at}-${idx}`} $isMe={isMe}>
                <CardTechSide $isMe={isMe} />
                <CardContent>
                    <CardMeta>
                        <MetaName>{nameByUid.get(m.uid)?.toUpperCase()}</MetaName>
                        <MetaId>ID: {m.uid.slice(0,4)}</MetaId>
                    </CardMeta>
                    <WordPayload $isMe={isMe}>
                        {m.text}
                    </WordPayload>
                </CardContent>
                <AvatarContainer>
                     <SkinScope data-skin={msgSkin}>
                        <PlayerAvatar type={msgType} size={40} />
                     </SkinScope>
                </AvatarContainer>
            </DataCard>
          );
        })}
        <div ref={feedEndRef} />
      </FeedWindow>

      {/* CLI INPUT */}
      {!readOnly && (
        <CLIWrap $active={isMyTurn}>
            <PromptLabel>{isMyTurn ? "INPUT_READY >" : "LOCKED >"}</PromptLabel>
            
            {isMyTurn ? (
                <CLIInput 
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="ENTER_WORD_"
                    maxLength={20}
                    disabled={sending}
                />
            ) : (
                <WaitingText>
                    WAITING FOR AGENT: <span style={{color: '#fff'}}>{turnName.toUpperCase()}</span>
                    <Ellipsis>...</Ellipsis>
                </WaitingText>
            )}

            <ExecuteBtn onClick={handleSend} disabled={!isMyTurn || !input}>
                {sending ? "..." : <FaChevronRight />}
            </ExecuteBtn>
        </CLIWrap>
      )}

      {error && <ErrorStrip>⚠ {error}</ErrorStrip>}
    </CyberContainer>
  );
}

// --- STYLES ---

const flicker = keyframes`
  0% { opacity: 0.9; } 5% { opacity: 0.8; } 10% { opacity: 0.95; } 100% { opacity: 1; }
`;

const scan = keyframes`
  0% { background-position: 0 0; } 100% { background-position: 0 100%; }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const CyberContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 550px;
  width: 100%;
  background: #0b1120; /* Dark Navy/Black base */
  border: 1px solid rgba(56, 189, 248, 0.3);
  box-shadow: 0 0 25px rgba(0,0,0,0.6);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  font-family: 'Courier New', Courier, monospace;

  /* Corner accents */
  &::before {
    content: ""; position: absolute; top: 0; left: 0; width: 15px; height: 15px;
    border-top: 2px solid #38bdf8; border-left: 2px solid #38bdf8; z-index: 2;
  }
  &::after {
    content: ""; position: absolute; bottom: 0; right: 0; width: 15px; height: 15px;
    border-bottom: 2px solid #38bdf8; border-right: 2px solid #38bdf8; z-index: 2;
  }
`;

const ScanlineOverlay = styled.div`
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.05));
  background-size: 100% 4px; animation: ${scan} 6s linear infinite; z-index: 10; opacity: 0.6;
`;

/* HEADER */
const HeaderPanel = styled.div`
  height: 50px;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(56, 189, 248, 0.2);
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 1rem; z-index: 5;
`;

const HeaderContent = styled.div` display: flex; align-items: center; gap: 0.8rem; `;
const HeaderTech = styled.div` 
    display: flex; align-items: center; gap: 0.5rem; 
    color: #38bdf8; font-size: 0.8rem; border: 1px solid rgba(56, 189, 248, 0.3);
    padding: 2px 8px; background: rgba(56, 189, 248, 0.1);
`;

const StatusLight = styled.div<{ $active: boolean }>`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${({ $active }) => $active ? "#22c55e" : "#ef4444"};
  box-shadow: 0 0 8px ${({ $active }) => $active ? "#22c55e" : "#ef4444"};
`;

/* FEED AREA */
const FeedWindow = styled.div`
  flex: 1; overflow-y: auto; position: relative;
  padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 0.8rem;
  
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: #0f172a; }
  &::-webkit-scrollbar-thumb { background: #334155; }
`;

const GridBackground = styled.div`
  position: absolute; inset: 0; pointer-events: none; z-index: -1;
  background-image: radial-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
`;

const EmptyState = styled.div`
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #38bdf8; letter-spacing: 2px; opacity: 0.6; text-align: center;
`;

const CycleDivider = styled.div`
  display: flex; align-items: center; gap: 1rem; margin: 1rem 0;
  .line { flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
  .label { font-size: 0.7rem; color: #94a3b8; letter-spacing: 2px; }
`;

/* DATA CARD (The Item) */
const DataCard = styled.div<{ $isMe: boolean }>`
  display: flex; align-items: stretch;
  background: ${({ $isMe }) => $isMe ? "rgba(16, 185, 129, 0.05)" : "rgba(30, 41, 59, 0.4)"};
  border: 1px solid ${({ $isMe }) => $isMe ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 4px;
  position: relative;
  animation: ${slideUp} 0.3s ease-out;
  min-height: 60px;
`;

const CardTechSide = styled.div<{ $isMe: boolean }>`
  width: 4px;
  background: ${({ $isMe }) => $isMe ? "#10b981" : "#64748b"};
  box-shadow: ${({ $isMe }) => $isMe ? "0 0 10px rgba(16, 185, 129, 0.5)" : "none"};
`;

const CardContent = styled.div`
  flex: 1; padding: 0.75rem; display: flex; flex-direction: column; justify-content: center;
`;

const CardMeta = styled.div`
  display: flex; gap: 0.5rem; font-size: 0.65rem; color: #64748b; margin-bottom: 0.25rem;
`;
const MetaName = styled.span` color: #94a3b8; font-weight: bold; letter-spacing: 1px; `;
const MetaId = styled.span` opacity: 0.5; `;

const WordPayload = styled.div<{ $isMe: boolean }>`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ $isMe }) => $isMe ? "#10b981" : "#e2e8f0"};
  text-shadow: ${({ $isMe }) => $isMe ? "0 0 10px rgba(16, 185, 129, 0.3)" : "none"};
`;

const AvatarContainer = styled.div`
  width: 60px;
  display: grid; place-items: center;
  border-left: 1px solid rgba(255,255,255,0.05);
  background: rgba(0,0,0,0.2);
`;

/* CLI INPUT */
const CLIWrap = styled.div<{ $active: boolean }>`
  background: #020617; border-top: 1px solid #1e293b;
  padding: 1rem; display: flex; align-items: center; gap: 0.75rem;
  transition: all 0.3s;
  ${({ $active }) => $active && css`
    border-color: #10b981; box-shadow: 0 -5px 15px rgba(16, 185, 129, 0.05);
  `}
`;

const PromptLabel = styled.div` color: #64748b; font-size: 0.8rem; font-weight: bold; `;
const CLIInput = styled.input`
  flex: 1; background: transparent; border: none; color: #10b981;
  font-family: inherit; font-size: 1.1rem; outline: none; font-weight: bold; text-transform: uppercase;
  &::placeholder { color: #1e293b; }
`;

const WaitingText = styled.div` flex: 1; color: #64748b; font-size: 0.9rem; `;
const Ellipsis = styled.span` animation: ${blink} 1.5s infinite; `;

const ExecuteBtn = styled.button`
  background: #1e293b; color: #fff; border: 1px solid #334155;
  width: 36px; height: 36px; display: grid; place-items: center; cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) { background: #10b981; border-color: #10b981; color: #000; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorStrip = styled.div`
  background: rgba(239, 68, 68, 0.1); color: #fca5a5; font-size: 0.75rem;
  padding: 4px; text-align: center; border-top: 1px solid rgba(239, 68, 68, 0.3);
`;

const SkinScope = styled.div`
  --hue: 0deg; --sat: 1; --bright: 1; --contrast: 1;
  display: grid; place-items: center;
  & > * { filter: hue-rotate(var(--hue)) saturate(var(--sat)) brightness(var(--bright)) contrast(var(--contrast)); }
  &[data-skin="classic"] { --hue: 0deg; --sat: 1; --bright: 1; --contrast: 1.02; }
  &[data-skin="midnight"] { --hue: 210deg; --sat: 1.25; --bright: 0.92; --contrast: 1.15; }
  &[data-skin="mint"] { --hue: 135deg; --sat: 1.15; --bright: 1.05; --contrast: 1.05; }
  &[data-skin="sunset"] { --hue: 320deg; --sat: 1.25; --bright: 1.03; --contrast: 1.08; }
  &[data-skin="cyber"] { --hue: 260deg; --sat: 1.45; --bright: 0.98; --contrast: 1.25; }
`;