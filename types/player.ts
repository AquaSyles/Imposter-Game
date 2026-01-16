export type AvatarSkin = 'classic' | 'midnight' | 'mint' | 'sunset' | 'cyber';

export type Player = {
  uid: string;        // Firestore doc id
  playerId: number;   // 101, 102, ...
  name: string;
  avatar: 'astronaut';
  skin: AvatarSkin;
  joinedAt: number;
};
