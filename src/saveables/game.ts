import {PuggApi} from "../services/pugg.api";
import {Team} from "./team";

export class Game {
    id: string;
    teamOne: Team;
    teamTwo: Team;
    teamOnePoints: number;
    teamTwoPoints: number;
    eloChanges: EloChange[];

    constructor(id: string, teamOne: Team, teamTwo: Team, teamOnePoints: number, teamTwoPoints: number, eloChanges: EloChange[]) {
        this.id = id;
        this.teamOne = teamOne;
        this.teamTwo  = teamTwo;
        this.teamOnePoints = teamOnePoints;
        this.teamTwoPoints = teamTwoPoints;
        this.eloChanges = eloChanges;
    }

    public static async record(teamOne: Team, teamTwo: Team, teamOneScore: number, teamTwoScore: number) {
        const eloChanges = [  ] as EloChange[];
        teamOne.stats.points += teamOneScore;
        teamTwo.stats.points += teamTwoScore;

        if (teamOneScore > teamTwoScore) {
            teamOne.stats.wins += 1;
            teamTwo.stats.losses += 1;
            for (const player of teamOne.players) {
                player.stats.points += teamOneScore;
                player.stats.wins += 1;
                player.stats.elo += 30;
                eloChanges.push(new EloChange(player.id, 30));
            }
            for (const player of teamTwo.players) {
                player.stats.points += teamTwoScore;
                player.stats.losses += 1;
                player.stats.elo -= 30;
                eloChanges.push(new EloChange(player.id, -30));
            }
        }
        else if (teamTwoScore > teamOneScore) {
            teamTwo.stats.wins += 1;
            teamOne.stats.losses += 1;
            for (const player of teamOne.players) {
                player.stats.points += teamOneScore;
                player.stats.losses += 1;
                player.stats.elo -= 30;
                eloChanges.push(new EloChange(player.id, -30));
            }
            for (const player of teamTwo.players) {
                player.stats.points += teamTwoScore;
                player.stats.wins += 1;
                player.stats.elo += 30;
                eloChanges.push(new EloChange(player.id, 30));
            }
        } else {
            throw new Error("Invalid Score - No Draws");
        }

        const games = await Game.fetchAll();
        return await new Game(String(games.length + 1), teamOne, teamTwo, teamOneScore, teamTwoScore, eloChanges).save();
    }

    public static async fetchAll() {
        return await PuggApi.fetchAllGames();
    }

    public static async fetch(id: string) {
        return await PuggApi.fetchGame(id);
    }

    public async save() {
        await PuggApi.upsertGame(this);
        await this.teamOne.save();
        await this.teamTwo.save();
        return this;
    }

    public toJSON() {
        return {
            id: this.id,
            teamOneName: this.teamOne.name,
            teamTwoName: this.teamTwo.name,
            teamOnePoints: this.teamOnePoints,
            teamTwoPoints: this.teamTwoPoints,
            eloChanges: this.eloChanges
        }
    }
}

class EloChange {
    playerId: string;
    change: number;

    constructor(playerId: string, change: number) {
        this.playerId = playerId;
        this.change = change;
    }
}