import { PersistentVector } from "near-sdk-as";
import { PostedLevel, levels } from "./model";

const LEVELS_LIMIT = 8;

export function addLevel(levelHash: string, audioHash: string, levelName: string): void {
  const message = new PostedLevel(levelHash, audioHash, levelName);
  levels.push(message);
}

export function getLevels(): PostedLevel[] {
  const numMessages = min(LEVELS_LIMIT, levels.length);
  const startIndex = levels.length - numMessages;
  const result = new Array<PostedLevel>(numMessages);
  for (let i = 0; i < numMessages; i++) {
    result[i] = levels[i + startIndex];
  }
  return result;
}