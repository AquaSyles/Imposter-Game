import {
  collection,
  doc,
  setDoc,
  getDoc,
  where, limit,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
  getDocs,
  Timestamp,
  deleteDoc,
  deleteField,
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
  const newSessionId = crypto.randomUUID();

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(lobbyRef);
    const existing = snap.exists() ? (snap.data() as any) : null;

    if (existing && existing.status && existing.status !== "closed") {
      throw new Error("Lobby code is currently in use");
    }

    // IKKE bruk deleteField her (siden du bruker tx.set uten merge)
    // Bare overskriv hele dokumentet rent.
    tx.set(lobbyRef, {
      createdAt: serverTimestamp(),
      status: "waiting",
      hostId: host.uid,
      nextPlayerNumber: 101,
      sessionId: newSessionId,
      closedAt: null,
      settings: null,
      game: null,
    });
  });

  await setDoc(
    doc(db, "lobbies", inviteCode, "players", host.uid),
    {
      sessionId: newSessionId,
      playerId: 100,
      name: host.name,
      avatar: host.avatar,
      skin: host.skin ?? "classic",
      avatarType: host.avatarType ?? "classicAstronaut",
      joinedAt: host.joinedAt ?? Date.now(),
    },
    { merge: true }
  );

  return newSessionId;
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
export function listenToLobbyPlayersActiveSession(
  inviteCode: string,
  callback: (players: Player[]) => void
) {
  if (!inviteCode) {
    callback([]);
    return () => {};
  }

  const lobbyRef = doc(db, "lobbies", inviteCode);

  let unsubPlayers: (() => void) | null = null;

  const unsubLobby = onSnapshot(lobbyRef, (lobbySnap) => {
    if (!lobbySnap.exists()) {
      callback([]);
      if (unsubPlayers) unsubPlayers();
      unsubPlayers = null;
      return;
    }

    const lobby = lobbySnap.data() as any;
    const activeSessionId: string | null = lobby?.sessionId ?? null;

    if (!activeSessionId) {
      callback([]);
      if (unsubPlayers) unsubPlayers();
      unsubPlayers = null;
      return;
    }

    // Re-subscribe only if needed
    if (unsubPlayers) unsubPlayers();

    const qPlayers = query(
      collection(db, "lobbies", inviteCode, "players"),
      orderBy("joinedAt", "asc")
    );

    unsubPlayers = onSnapshot(qPlayers, (snapshot) => {
      const players: Player[] = snapshot.docs
        .map((d) => ({ uid: d.id, ...(d.data() as any) }))
        .filter((p: any) => p.sessionId === activeSessionId);

      callback(players);
    });
  });

  return () => {
    unsubLobby();
    if (unsubPlayers) unsubPlayers();
  };
}

export async function findReusableLobby(): Promise<string | null> {
  const q = query(
    collection(db, "lobbies"),
    where("status", "==", "closed"),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  return snap.docs[0].id; // inviteCode
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
export async function updatePlayerName(inviteCode: string, uid: string, name: string) {
  const ref = doc(db, "lobbies", inviteCode, "players", uid);
  await updateDoc(ref, { name });
}
export async function updatePlayerPrefs(
  inviteCode: string,
  uid: string,
  avatarType: string,
  skin: string
) {
  const ref = doc(db, "lobbies", inviteCode, "players", uid);
  await updateDoc(ref, { avatarType, skin });
}
/* -------- START GAME (UPDATED FOR CATEGORY HINT) -------- */
export async function startGame(
  inviteCode: string,
  hostUid: string,
  word: string,
  themeId: string,
  imposterHint: string // ✅ NYTT
) {
  const lobbyRef = doc(db, "lobbies", inviteCode);

  // deterministisk rekkefølge
  const playersQ = query(collection(db, "lobbies", inviteCode, "players"), orderBy("joinedAt", "asc"));
  const playersSnap = await getDocs(playersQ);
  const playerUids = playersSnap.docs.map((d) => d.id);

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
          imposterHint, // ✅ lagrer hintet vi sender inn
          assignments,

          phase: "reveal",

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
  if (!inviteCode) throw new Error("joinLobby: missing inviteCode");
  if (!player?.uid) throw new Error("joinLobby: player.uid is missing");

  const lobbyRef = doc(db, "lobbies", inviteCode);
  const playerRef = doc(db, "lobbies", inviteCode, "players", player.uid);

  await runTransaction(db, async (tx) => {
    const lobbySnap = await tx.get(lobbyRef);
    if (!lobbySnap.exists()) throw new Error("Lobby does not exist");

    const lobbyData = lobbySnap.data() as any;

    if (lobbyData.status !== "waiting") {
      throw new Error("Lobby is not joinable");
    }

    const sessionId = lobbyData.sessionId;
    if (!sessionId) throw new Error("Lobby session missing");

    const existingPlayerSnap = await tx.get(playerRef);

    // Hvis player-doc finnes men er fra gammel session -> overskriv som ny join
    const existing = existingPlayerSnap.exists() ? (existingPlayerSnap.data() as any) : null;
    const isSameSession = existing?.sessionId === sessionId;

    if (existingPlayerSnap.exists() && isSameSession) {
      tx.set(playerRef, {
        name: player.name,
        avatar: player.avatar,
        skin: player.skin ?? "classic",
        avatarType: player.avatarType ?? "classicAstronaut",
      }, { merge: true });
      return;
    }

    const next = typeof lobbyData.nextPlayerNumber === "number" ? lobbyData.nextPlayerNumber : 101;
    const assignedId = next;

    tx.set(lobbyRef, { nextPlayerNumber: next + 1 }, { merge: true });

    tx.set(playerRef, {
      sessionId,
      playerId: assignedId,
      name: player.name,
      avatar: player.avatar,
      skin: player.skin ?? "classic",
      avatarType: player.avatarType ?? "classicAstronaut",
      joinedAt: player.joinedAt ?? Date.now(),
    });
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
  if (!input) return null;

  // 1) trim + unicode normalize (gjør f.eks. “fullwidth” bokstaver normale)
  let s = input.trim().normalize("NFKC");
  if (!s) return null;

  // 2) fjern zero-width / usynlige tegn (kan brukes til trolling)
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  if (!s) return null;

  // 3) må være nøyaktig ett "ord" => ingen whitespace inni
  //    (du kan også tillate newline etc. ved \s)
  if (/\s/.test(s)) return null;

  // 4) Strip tegn i start/slutt som ofte kommer med: !!word??  -> word
  //    (men behold bindestrek/apostrof inni ordet)
  s = s.replace(/^[^0-9A-Za-zÆØÅæøå]+|[^0-9A-Za-zÆØÅæøå]+$/g, "");

  // 5) Fjern alt som ikke er bokstav/tall/æøå/ bindestrek / apostrof
  //    - apostrof er valgfritt: ta bort ' hvis du ikke vil ha det
  s = s.replace(/[^0-9A-Za-zÆØÅæøå\-']/g, "");

  // 6) Ikke tillat at ordet kun er bindestreker/apostrofer
  const hasLetterOrNumber = /[0-9A-Za-zÆØÅæøå]/.test(s);
  if (!s || !hasLetterOrNumber) return null;

  // 7) valgfritt: maks lengde her også (du har maxLength=20 i UI)
  if (s.length > 20) s = s.slice(0, 20);

  return s;
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
    const role = game.assignments?.[playerUid]?.role;
    const isImposter = role === "imposter";

    const secretWord = normalizeOneWord((game.word ?? "").toString())?.toLowerCase() ?? "";
    const attempted = text.toLowerCase();


    if (!isImposter && secretWord && attempted === secretWord) {
      throw new Error("Crew cannot submit the secret word");
    }


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

      // ✅ nullstill typing når ord sendes
      typingUid: null,
      typingAt: Date.now(),
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

    // Ikke alle har stemt enda
    if (Object.keys(nextVotes).length < n) {
      tx.set(lobbyRef, { game: { votes: nextVotes } }, { merge: true });
      return;
    }

    // ✅ tell stemmer
    const tally: Record<string, number> = {};
    for (const v of Object.values(nextVotes)) {
      tally[v] = (tally[v] ?? 0) + 1;
    }

    // finn max
    let max = -1;
    for (const uid of Object.keys(tally)) {
      if (tally[uid] > max) max = tally[uid];
    }

    // tie-break deterministisk
    const top = Object.keys(tally).filter((uid) => tally[uid] === max);
    top.sort();
    const eliminatedUid = top[0];

    const imposterUid: string = game.imposterUid;
    const winner: "crew" | "imposter" = eliminatedUid === imposterUid ? "crew" : "imposter";
    const loser: "crew" | "imposter" = winner === "crew" ? "imposter" : "crew"; // ✅ NYTT

    tx.set(
      lobbyRef,
      {
        game: {
          votes: nextVotes,
          phase: "result",
          result: {
            winner,
            loser,        // ✅ NYTT
            eliminatedUid,
          },
        },
        status: "finished",
      },
      { merge: true }
    );
  });
}

export async function resetGame(inviteCode: string, hostUid: string) {
  const lobbyRef = doc(db, "lobbies", inviteCode);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(lobbyRef);
    if (!snap.exists()) throw new Error("Lobby does not exist");

    const data = snap.data() as any;
    if (data.hostId !== hostUid) throw new Error("Only host can reset");

    tx.set(
      lobbyRef,
      {
        status: "waiting",
        game: deleteField(),
        // behold tema-valget (valgfritt)
        // settings: { selectedThemeId: null },
      },
      { merge: true }
    );
  });
}

export async function closeLobby(inviteCode: string, hostUid: string) {
  const lobbyRef = doc(db, "lobbies", inviteCode);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(lobbyRef);
    if (!snap.exists()) return;

    const data = snap.data() as any;
    if (data.hostId !== hostUid) return;

    // ✅ update støtter deleteField uten merge-krav
    tx.update(lobbyRef, {
      status: "closed",
      closedAt: serverTimestamp(),
      game: deleteField(),
      settings: deleteField(),
      nextPlayerNumber: 101,
      hostId: "",
    });
  });
}



export async function leaveLobby(inviteCode: string, uid: string) {
  const lobbyRef = doc(db, "lobbies", inviteCode);
  const playerRef = doc(db, "lobbies", inviteCode, "players", uid);

  // fjern spilleren fra lobbyen
  await deleteDoc(playerRef);

  // hvis lobbyen ikke finnes, stopp
  const snapPlayers = await getDocs(collection(db, "lobbies", inviteCode, "players"));
  const remaining = snapPlayers.size;

  // hvis ingen spillere igjen -> close lobby (TTL rydder opp)
  if (remaining === 0) {
    await setDoc(
      lobbyRef,
      {
        status: "closed",
        closedAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now()),
      },
      { merge: true }
    );
    return;
  }

  // hvis host forsvinner, close lobby (så folk sendes ut)
  // (du kan endre dette til “transfer host” senere)
  // vi må sjekke hostId:
  // (vi leser lobby doc – enkelt)
  // NB: Ikke transaction her – good enough
  // Hvis du vil helt safe, si fra.
  // eslint-disable-next-line
  const lobbySnap = await (await import("firebase/firestore")).getDoc(lobbyRef);
  const lobbyData = lobbySnap.exists() ? (lobbySnap.data() as any) : null;

  if (lobbyData?.hostId === uid) {
    await setDoc(
      lobbyRef,
      {
        status: "closed",
        closedAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now()),
      },
      { merge: true }
    );
  }
}

export async function setTyping(inviteCode: string, uid: string, isTyping: boolean) {
  const lobbyRef = doc(db, "lobbies", inviteCode);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(lobbyRef);
    if (!snap.exists()) return;

    tx.set(
      lobbyRef,
      {
        game: {
          chat: {
            typingUid: isTyping ? uid : null,
            typingAt: Date.now(),
          },
        },
      },
      { merge: true }
    );
  });
}



/* -------- REALTIME LISTENER -------- */

export function listenToLobbyPlayers(
  inviteCode: string,
  sessionId: string,
  callback: (players: Player[]) => void
) {
  if (!inviteCode || !sessionId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, "lobbies", inviteCode, "players"),
    orderBy("joinedAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const players: Player[] = snapshot.docs
      .map((d) => ({ uid: d.id, ...(d.data() as any) }))
      .filter((p: any) => p.sessionId === sessionId);

    callback(players);
  });
}
