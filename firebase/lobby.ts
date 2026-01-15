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

export async function setLobbyTheme(inviteCode: string, hostUid: string, themeId: string) {
  const lobbyRef = doc(db, "lobbies", inviteCode);

  await runTransaction(db, async (tx: Transaction) => {
    const snap = await tx.get(lobbyRef);
    if (!snap.exists()) throw new Error("Lobby does not exist");

    const data = snap.data() as any;
    if (data.hostId !== hostUid) throw new Error("Only host can set theme");
    if (data.status !== "waiting") throw new Error("Game already started");

    tx.set(
      lobbyRef,
      {
        settings: {
          selectedThemeId: themeId,
        },
      },
      { merge: true }
    );
  });
}


/* -------- START GAME (UPDATED FOR CATEGORY HINT) -------- */
export async function startGame(inviteCode: string, hostUid: string, word: string, themeId: string) {
  const lobbyRef = doc(db, "lobbies", inviteCode);

  // ✅ hent players i deterministisk rekkefølge (joinedAt)
  const playersQ = query(collection(db, "lobbies", inviteCode, "players"), orderBy("joinedAt", "asc"));
  const playersSnap = await getDocs(playersQ);

  const playerUids = playersSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.id);

  if (playerUids.length < 2) {
    throw new Error("Need at least 2 players to start");
  }

  const imposterUid = playerUids[Math.floor(Math.random() * playerUids.length)];

  const assignments: Record<string, { role: "imposter" | "word" }> = {};
  for (const uid of playerUids) {
    assignments[uid] = { role: uid === imposterUid ? "imposter" : "word" };
  }

  await runTransaction(db, async (tx: Transaction) => {
    const lobbySnap = await tx.get(lobbyRef);
    if (!lobbySnap.exists()) throw new Error("Lobby does not exist");

    const lobbyData = lobbySnap.data() as any;

    if (lobbyData?.hostId !== hostUid) throw new Error("Only host can start");
    if (lobbyData?.status === "started") return;

    tx.set(
      lobbyRef,
      {
        status: "started",
        game: {
          startedAt: serverTimestamp(),
          themeId,
          word,
          imposterUid,
          imposterHint: "Blend in. Do your best.",
          assignments,

          // ✅ flow
          phase: "reveal",

          // ✅ turn-system
          playerOrder: playerUids,
          chat: {
            round: 1,
            turnIndex: 0,
            turnUid: playerUids[0],
            log: [],
          },

          votes: {},
          result: null,
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
export async function goToChatPhase(inviteCode: string, hostUid: string) {
  const lobbyRef = doc(db, "lobbies", inviteCode);

  await runTransaction(db, async (tx: Transaction) => {
    const snap = await tx.get(lobbyRef);
    if (!snap.exists()) throw new Error("Lobby does not exist");

    const data = snap.data() as any;
    if (data.hostId !== hostUid) throw new Error("Only host can change phase");

    if (data?.game?.phase !== "reveal") return;

    tx.set(
      lobbyRef,
      { game: { phase: "chat" } },
      { merge: true }
    );
  });
}
function normalizeOneWord(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // fjern flere spaces
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length !== 1) return null;

  // valgfritt: fjern rare tegn, behold bokstaver/tall/æøå/-
  const cleaned = parts[0].replace(/[^\p{L}\p{N}\-ÆØÅæøå]/gu, "");
  if (!cleaned) return null;

  return cleaned;
}

export async function submitChatWord(inviteCode: string, playerUid: string, rawText: string) {
  const lobbyRef = doc(db, "lobbies", inviteCode);

  const text = normalizeOneWord(rawText);
  if (!text) throw new Error("You must submit exactly ONE word");

  await runTransaction(db, async (tx: Transaction) => {
    const snap = await tx.get(lobbyRef);
    if (!snap.exists()) throw new Error("Lobby does not exist");

    const data = snap.data() as any;
    const game = data.game;
    if (!game) throw new Error("No game");

    if (game.phase !== "chat") throw new Error("Chat is not active");

    const playerOrder: string[] = game.playerOrder ?? [];
    if (playerOrder.length < 2) throw new Error("Invalid player order");

    const chat = game.chat;
    if (!chat) throw new Error("No chat state");

    if (chat.turnUid !== playerUid) throw new Error("Not your turn");

    const round: number = chat.round ?? 1;
    const turnIndex: number = chat.turnIndex ?? 0;

    // ✅ log entry
    const log = Array.isArray(chat.log) ? chat.log : [];
    const nextLog = [
      ...log,
      {
        uid: playerUid,
        text,
        round,
        index: turnIndex,
        at: Date.now(),
      },
    ];

    // ✅ compute next turn
    const n = playerOrder.length;
    const isLastInRound = turnIndex === n - 1;

    let nextRound = round;
    let nextTurnIndex = turnIndex + 1;
    let nextPhase: "chat" | "vote" = "chat";

    if (isLastInRound) {
      nextTurnIndex = 0;
      nextRound = round + 1;
    }

    // After 3 rounds complete => vote
    if (isLastInRound && round >= 3) {
      nextPhase = "vote";
    }

    const nextTurnUid =
      nextPhase === "chat"
        ? playerOrder[nextTurnIndex]
        : chat.turnUid; // irrelevant i vote

    const update: any = {
      game: {
        chat: {
          round: nextRound,
          turnIndex: nextTurnIndex,
          turnUid: nextTurnUid,
          log: nextLog,
        },
        phase: nextPhase,
      },
    };

    // hvis vi går til vote, init votes hvis ikke finnes
    if (nextPhase === "vote") {
      update.game.votes = game.votes ?? {};
    }

    tx.set(lobbyRef, update, { merge: true });
  });
}
export async function submitVote(inviteCode: string, voterUid: string, targetUid: string) {
  const lobbyRef = doc(db, "lobbies", inviteCode);

  await runTransaction(db, async (tx: Transaction) => {
    const snap = await tx.get(lobbyRef);
    if (!snap.exists()) throw new Error("Lobby does not exist");

    const data = snap.data() as any;
    const game = data.game;
    if (!game) throw new Error("No game");

    if (game.phase !== "vote") throw new Error("Voting is not active");

    const playerOrder: string[] = game.playerOrder ?? [];
    const n = playerOrder.length;

    if (!playerOrder.includes(voterUid)) throw new Error("Not a player");
    if (!playerOrder.includes(targetUid)) throw new Error("Invalid vote target");

    const votes: Record<string, string> = game.votes ?? {};

    if (votes[voterUid]) throw new Error("You already voted");

    const nextVotes = { ...votes, [voterUid]: targetUid };

    // if not all voted yet, just save
    if (Object.keys(nextVotes).length < n) {
      tx.set(lobbyRef, { game: { votes: nextVotes } }, { merge: true });
      return;
    }

    // ✅ tally votes
    const tally: Record<string, number> = {};
    for (const v of Object.values(nextVotes)) {
      tally[v] = (tally[v] ?? 0) + 1;
    }

    // find max vote count
    let max = -1;
    for (const uid of Object.keys(tally)) {
      if (tally[uid] > max) max = tally[uid];
    }

    const top = Object.keys(tally).filter((uid) => tally[uid] === max);

    // deterministic tie-break: lexicographically smallest uid
    top.sort();
    const eliminatedUid = top[0];

    const imposterUid: string = game.imposterUid;
    const winner: "crew" | "imposter" = eliminatedUid === imposterUid ? "crew" : "imposter";

    tx.set(
      lobbyRef,
      {
        game: {
          votes: nextVotes,
          phase: "result",
          result: {
            winner,
            eliminatedUid,
          },
        },
        status: "finished",
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