import { context, u128, PersistentVector } from "near-sdk-as";

@nearBindgen
export class PostedLevel {
    sender: string;
    levelName: string;
    levelDataHash: string;
    audioHash: string;
    constructor(level: string, audio: string, name: string) {
        this.sender = context.sender;
        this.levelDataHash = level;
        this.audioHash = audio;
        this.levelName = name;
    }
}

export const levels = new PersistentVector<PostedLevel>("m");