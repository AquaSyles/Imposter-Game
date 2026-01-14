import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import type {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Transaction,
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

export function listenToLobby(inviteCode: string, callback: (lobby: DocumentData | null) => void) {
  const lobbyRef = doc(db, "lobbies", inviteCode);

  return onSnapshot(lobbyRef, (snapshot: DocumentSnapshot<DocumentData>) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback(snapshot.data());
  });
}

/* -------- START GAME (UPDATED FOR CATEGORY HINT) -------- */

export async function startGame(inviteCode: string, hostUid: string, word: string, hint: string) {
  const lobbyRef = doc(db, "lobbies", inviteCode);

  const playersSnap = await getDocs(collection(db, "lobbies", inviteCode, "players"));
  const playerUids = playersSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.id);
  
  if (playerUids.length < 1) {
    throw new Error("No players in lobby");
  }

  // Pick a random imposter
  const imposterUid = playerUids[Math.floor(Math.random() * playerUids.length)];

  // Assign roles
  const assignments: Record<string, { role: "imposter" | "word" }> = {};
  for (const uid of playerUids) {
    assignments[uid] = { role: uid === imposterUid ? "imposter" : "word" };
  }

  await runTransaction(db, async (tx: Transaction) => {
    const lobbySnap = await tx.get(lobbyRef);
    if (!lobbySnap.exists()) {
      throw new Error("Lobby does not exist");
    }

    const lobbyData = lobbySnap.data() as any;
    if (lobbyData?.hostId && lobbyData.hostId !== hostUid) {
      throw new Error("Only the host can start the game");
    }

    if (lobbyData?.status === "started") {
      return;
    }

    tx.set(
      lobbyRef,
      {
        status: "started",
        game: {
          startedAt: serverTimestamp(),
          word: word,         // The specific word chosen by frontend
          imposterUid: imposterUid,
          imposterHint: hint, // The category name passed from frontend
          assignments: assignments,
        },
      },
      { merge: true }
    );
  });
}

/* -------- JOIN (SAFE PLAYER ID) -------- */

export async function joinLobby(inviteCode: string, player: Player) {
  const lobbyRef = doc(db, "lobbies", inviteCode);
  const playerRef = doc(db, "lobbies", inviteCode, "players", player.uid);

  // Transaction prevents two users getting same playerId
  await runTransaction(db, async (tx: Transaction) => {
    const lobbySnap = await tx.get(lobbyRef);
    if (!lobbySnap.exists()) {
      throw new Error("Lobby does not exist");
    }

    const lobbyData = lobbySnap.data() as any;
    if (lobbyData?.status && lobbyData.status !== "waiting") {
      throw new Error("Game already started");
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

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const players: Player[] = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
      uid: d.id,
      ...(d.data() as Omit<Player, "uid">),
    }));

    callback(players);
  });
}