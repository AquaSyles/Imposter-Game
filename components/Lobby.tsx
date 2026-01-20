"use client";

import styled from "styled-components";
import { FaPlay, FaUserPlus, FaGamepad, FaSignOutAlt } from "react-icons/fa";
import { useState, useEffect, useMemo } from "react";
import type { Player } from "@/types/player";


import { PlayerAvatar } from "@/components/avatars/PlayerAvatar";
import AvatarSkinScope from "@/components/avatars/AvatarSkinScope";



import { readSkin, readType, type AvatarSkin, type AvatarType } from "@/firebase/avatarPrefs";

/* ---------------- helpers ---------------- */
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


function getOrCreateUid() {
  if (typeof window === "undefined") return "";
  const key = "imposter_uid";
  let uid = localStorage.getItem(key);
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem(key, uid);
  }
  return uid;
}

type LobbyMode = "menu" | "room";

interface LobbyProps {
  mode?: LobbyMode;

  // menu actions
  onJoinGame?: (code: string) => void;
  onCreateGame?: () => void;

  // room actions
  onContinueToThemes?: () => void;
  onExitLobby?: () => void;

  // shared
  players: Player[];
  isHost?: boolean;
}

/* ---------------- component ---------------- */

export default function Lobby({
  mode = "menu",
  players,
  onJoinGame,
  onCreateGame,
  onContinueToThemes,
  onExitLobby,
  isHost = false,
}: LobbyProps) {
  const uid = useMemo(() => getOrCreateUid(), []);

  const [inviteCode, setInviteCode] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const isMobile = useIsMobile();
  // prefs
  const [avatarType, setAvatarType] = useState<AvatarType>("classicAstronaut");
  const [skin, setSkin] = useState<AvatarSkin>("classic");

  useEffect(() => {
    if (!uid) return;
    setAvatarType(readType(uid));
    setSkin(readSkin(uid));
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const onPrefs = () => {
      setAvatarType(readType(uid));
      setSkin(readSkin(uid));
    };
    window.addEventListener("imposter:avatarPrefs", onPrefs);
    return () => window.removeEventListener("imposter:avatarPrefs", onPrefs);
  }, [uid]);


  const handleJoinGame = () => {
    if (inviteCode.trim() && onJoinGame) {
      onJoinGame(inviteCode.trim().toUpperCase());
      setShowJoinForm(false);
    }
  };
 

  return (
    <LobbyContainer>
      <h2 style={{ fontSize: "2.5rem", color: "#e2e8f0", marginBottom: "1rem", textAlign: "center" }}>
        {mode === "menu" ? "Start" : "Lobby"}
      </h2>

      {/* PLAYERS always visible in room mode, optional in menu mode */}
      {mode === "room" && (
        <PlayersGrid>
          {players.map((player) => (
            <PlayerCard key={player.uid}>
              <AvatarSkinScope skin={player.uid === uid ? skin : "classic"}>
                <PlayerAvatar type={player.uid === uid ? avatarType : "classicAstronaut"} size={isMobile ? 50 : 80} />
              </AvatarSkinScope>



              <PlayerName className={player.playerId === 100 ? "host" : ""}>
                {player.name}
                {player.playerId === 100 && " (Host)"}
              </PlayerName>
            </PlayerCard>
          ))}
        </PlayersGrid>
      )}

      {/* MENU MODE */}
      {mode === "menu" && (
        <GameControls>
          {!showJoinForm ? (
            <>
              <Button
                onClick={() => onCreateGame?.()}
                $variant="primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <FaGamepad /> Create New Game
              </Button>

              <Divider>OR</Divider>

              <Button
                onClick={() => setShowJoinForm(true)}
                $variant="secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <FaUserPlus /> Join Existing Game
              </Button>
            </>
          ) : (
            <>
              <div style={{ width: "100%", textAlign: "center", marginBottom: "0.5rem" }}>
                <p style={{ color: "#e2e8f0", marginBottom: "0.5rem" }}>Enter the invite code</p>
                <Input
                  type="text"
                  placeholder="e.g., ABC123"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{ textAlign: "center", letterSpacing: "0.5em" }}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
                <Button
                  onClick={handleJoinGame}
                  $variant="primary"
                  disabled={!inviteCode.trim()}
                  style={{ flex: 1 }}
                >
                  Join
                </Button>
                <Button
                  onClick={() => setShowJoinForm(false)}
                  $variant="secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </GameControls>
      )}

      {/* ROOM MODE CONTROLS */}
      {mode === "room" && (
        <RoomActions>
          <Button
            onClick={() => onExitLobby?.()}
            $variant="secondary"
            style={{ justifyContent: "center" }}
          >
            <FaSignOutAlt /> Exit Lobby
          </Button>

          {isHost && (
            <Button
              onClick={() => onContinueToThemes?.()}
              $variant="primary"
              style={{ justifyContent: "center" }}
              disabled={players.length < 1}
            >
              <FaPlay /> Continue to Themes
            </Button>
          )}
        </RoomActions>
      )}
    </LobbyContainer>
  );
}

/* ---------------- styled ---------------- */

const LobbyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PlayersGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4rem;
  width: 100%;
  margin: 0.5rem 0 0.75rem;
  border-bottom: 2px solid #a5a5a5;
  padding-bottom: 1rem;
  @media (max-width: 768px) {
    gap: 2rem;
  }
`;

const PlayerCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  
  border-radius: 12px;
  transition: all 0.3s ease;
  min-width: fit-content;

  &:hover {
    transform: translateY(-5px);
  }
  
`;

const PlayerName = styled.div`
  font-size: 1.1rem;
  color: #e2e8f0;
  text-align: center;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.host {
    color: #818cf8;
    font-weight: 600;
  }
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 0.75rem 1.65rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  background: ${({ $variant }) => ($variant === "primary" ? "#4f46e5" : "#374151")};
  color: white;

  &:hover {
    opacity: 0.92;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Input = styled.input`
  padding: 0.85rem 1.25rem;
  border: 1px solid #4b5563;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  width: 100%;
  max-width: 300px;

  &:focus {
    outline: none;
    border-color: #4f46e5;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const GameControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  max-width: 420px;
  margin-top: 0.5rem;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  color: #6b7280;
  margin: 0.25rem 0;
  font-size: 0.9rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #4b5563, transparent);
  }
`;

const RoomActions = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

