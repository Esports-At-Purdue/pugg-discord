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
        const totalRounds = teamOneScore + teamTwoScore;
        const teamOneElo = teamOne.players.map(player => player.stats.elo).reduce((a, b) => a + b) / teamOne.players.length;
        const teamTwoElo = teamTwo.players.map(player => player.stats.elo).reduce((a, b) => a + b) / teamTwo.players.length;
        teamOne.stats.points += teamOneScore;
        teamTwo.stats.points += teamTwoScore;

        if (teamOneScore > teamTwoScore) {
            teamOne.stats.wins += 1;
            teamTwo.stats.losses += 1;
            for (const player of teamOne.players) {
                const eloChange = player.getEloChange(teamOneScore, totalRounds, teamOneElo, teamTwoElo);
                player.stats.points += teamOneScore;
                player.stats.wins += 1;
                player.stats.elo += eloChange;
                eloChanges.push(new EloChange(player.id, eloChange));
            }
            for (const player of teamTwo.players) {
                const eloChange = player.getEloChange(teamTwoScore, totalRounds, teamTwoElo, teamOneElo);
                player.stats.points += teamTwoScore;
                player.stats.losses += 1;
                player.stats.elo += eloChange;
                eloChanges.push(new EloChange(player.id, eloChange));
            }
        }
        else if (teamTwoScore > teamOneScore) {
            teamTwo.stats.wins += 1;
            teamOne.stats.losses += 1;
            for (const player of teamOne.players) {
                const eloChange = player.getEloChange(teamOneScore, totalRounds, teamOneElo, teamTwoElo);
                player.stats.points += teamOneScore;
                player.stats.losses += 1;
                player.stats.elo += eloChange;
                eloChanges.push(new EloChange(player.id, eloChange));
            }
            for (const player of teamTwo.players) {
                const eloChange = player.getEloChange(teamTwoScore, totalRounds, teamOneElo, teamTwoElo);
                player.stats.points += teamTwoScore;
                player.stats.wins += 1;
                player.stats.elo += eloChange;
                eloChanges.push(new EloChange(player.id, eloChange));
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