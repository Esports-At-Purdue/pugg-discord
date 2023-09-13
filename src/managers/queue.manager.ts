import {Player} from "../models/player";

export class QueueManager {
    public static queue: Queue;

    public static async load() {
        this.queue = new Queue();
    }
}

export class Queue extends Map<string, Player> {
    public getPlayers() {
        return Array.from(this.values());
    }
}