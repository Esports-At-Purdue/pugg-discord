import {PuggApi} from "../services/pugg.api";

export class Player {
    public id: string;
    public firstName: string;
    public lastName: string;
    public username: string;
    public stats: PlayerStats;

    constructor(id: string, firstName: string, lastName: string, username: string, stats: PlayerStats) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.stats = stats;
    }

    public static newInstance(id: string, firstName: string, lastName: string, username: string) {
        const stats = new PlayerStats(350, 0, 0, 0, 0);
        return new Player(id, firstName, lastName, username, stats);
    }

    public static async fetch(id: string) {
        return await PuggApi.fetchPlayer(id);
    }

    public async save() {
        await PuggApi.upsertPlayer(this);
        return this;
    }
}

class PlayerStats {
    public elo: number;
    public rank: number;
    public wins: number;
    public losses: number;
    public points: number;

    constructor(elo: number, rank: number, wins: number, losses: number, points: number) {
        this.elo = elo;
        this.rank = rank;
        this.wins = wins;
        this.losses = losses;
        this.points = points;
    }
}