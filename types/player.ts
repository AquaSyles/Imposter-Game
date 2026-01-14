export type Player = {
  uid: string;        // Firestore doc id
  playerId: number;   // 101, 102, ...
  name: string;
  avatar: 'astronaut';
  joinedAt: number;
};
