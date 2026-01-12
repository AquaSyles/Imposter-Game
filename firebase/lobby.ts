import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Player } from "@/types/player";

/**
 * We store a counter on the lobby doc:
 * lobbies/{inviteCode}.nextPlayerNumber (starts at 101)
 * Host is always 100.
 */

/* -------- CREATE -------- */

export async function createLobby(inviteCode: string, host: Player) {
  const lobbyRef = doc(db, "lobbies", inviteCode);

  // Create lobby if it doesn't exist
  await setDoc(
    lobbyRef,
    {
      createdAt: serverTimestamp(),
      status: "waiting",
      hostId: host.uid,
      nextPlayerNumber: 101, // next joiner becomes 101, 102, ...
    },
    { merge: true }
  );

  // Ensure host is stored as player 100
  await setDoc(
    doc(db, "lobbies", inviteCode, "players", host.uid),
    {
      playerId: 100,
      name: host.name,
      avatar: host.avatar,
      joinedAt: host.joinedAt ?? Date.now(),
    },
    { merge: true }
  );
}

/* -------- JOIN (SAFE PLAYER ID) -------- */

export async function joinLobby(inviteCode: string, player: Player) {
  const lobbyRef = doc(db, "lobbies", inviteCode);
  const playerRef = doc(db, "lobbies", inviteCode, "players", player.uid);

  // Transaction prevents two users getting same playerId
  await runTransaction(db, async (tx) => {
    const lobbySnap = await tx.get(lobbyRef);
    if (!lobbySnap.exists()) {
      throw new Error("Lobby does not exist");
    }

    // If player already exists, do not re-assign id (idempotent)
    const existingPlayerSnap = await tx.get(playerRef);
    if (existingPlayerSnap.exists()) {
      // Just merge updates (name/avatar) without changing id/joinedAt unless you want to
      tx.set(
        playerRef,
        {
          name: player.name,
          avatar: player.avatar,
        },
        { merge: true }
      );
      return;
    }

    const lobbyData = lobbySnap.data() as any;
    const next = typeof lobbyData.nextPlayerNumber === "number" ? lobbyData.nextPlayerNumber : 101;

    // assign new id
    const assignedId = player.playerId && player.playerId === 100 ? 100 : next;

    // update lobby counter only for non-host joiners
    if (assignedId !== 100) {
      tx.set(
        lobbyRef,
        { nextPlayerNumber: next + 1 },
        { merge: true }
      );
    }

    // create player doc
    tx.set(
      playerRef,
      {
        playerId: assignedId,
        name: player.name,
        avatar: player.avatar,
        joinedAt: player.joinedAt ?? Date.now(),
      },
      { merge: true }
    );
  });
}

/* -------- REALTIME LISTENER -------- */

export function listenToLobbyPlayers(inviteCode: string, callback: (players: Player[]) => void) {
  const q = query(collection(db, "lobbies", inviteCode, "players"), orderBy("joinedAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const players: Player[] = snapshot.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<Player, "uid">),
    }));

    callback(players);
  });
}
