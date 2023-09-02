import {PuggApi} from "../services/pugg.api";
import {Player} from "./player";

export class Team {
    public name: string;
    public playerIds: string[];
    public stats: TeamStats;

    constructor(name: string, playerIds: string[], stats: TeamStats) {
        this.name = name;
        this.playerIds = playerIds;
        this.stats = stats;
    }

    public async getPlayers() {
        return await Promise.all(this.playerIds.map(playerId => Player.fetch(playerId)));
    }

    public static async create() {
        const allTeams = await PuggApi.fetchAllTeams();
        const stats = new TeamStats(0, 0, 0, 0);
        const team = new Team(String(allTeams.length), [  ], stats);
        return await team.save();
    }

    public static async fetchAll() {
        return await PuggApi.fetchAllTeams();
    }

    public static async fetch(id: string) {
        return await PuggApi.fetchTeam(id);
    }

    public async save() {
        await PuggApi.upsertTeam(this);
        return this;
    }
}

class TeamStats {
    public elo: number;
    public wins: number;
    public losses: number;
    public points: number;

    constructor(elo: number, wins: number, losses: number, points: number) {
        this.elo = elo;
        this.wins = wins;
        this.losses = losses;
        this.points = points;
    }
}