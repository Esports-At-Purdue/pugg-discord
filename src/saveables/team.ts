import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import {PuggApi} from "../services/pugg.api";
import {Player} from "./player";

export class Team {
    public name: string;
    public players: Player[];
    public stats: TeamStats;

    constructor(name: string, players: Player[], stats: TeamStats) {
        this.name = name;
        this.players = players;
        this.stats = stats;
    }

    public static async create() {
        let name = uniqueNamesGenerator({ dictionaries: [ adjectives, animals ] });
        if (name.endsWith("s")) name += "es";
        else name += "s";
        while (await PuggApi.fetchTeam(name)) {
            name = uniqueNamesGenerator({dictionaries: [adjectives, animals]});
            if (name.endsWith("s")) name += "es";
            else name += "s";
        }
        const stats = new TeamStats(0, 0, 0, 0);
        const team = new Team(String(name), [  ], stats);
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
        for (const player of this.players) await player.save();
        return this;
    }

    public get properName() {
        const words = this.name.split('_');
        const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
        return capitalizedWords.join(' ');
    }

    public toJSON() {
        return {
            name: this.name,
            playerIds: this.players.map(player => player.id),
            stats: this.stats
        }
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