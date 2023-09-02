import {PuggApi} from "../services/pugg.api";
import {Team} from "./team";
import {Player} from "./player";

export class Game {
    id: string;
    teamOneName: string;
    teamTwoName: string;
    teamOnePoints: number;
    teamTwoPoints: number;

    constructor(id: string, teamOneName: string, teamTwoName: string, teamOnePoints: number, teamTwoPoints: number) {
        this.id = id;
        this.teamOneName = teamOneName;
        this.teamTwoName = teamTwoName;
        this.teamOnePoints = teamOnePoints;
        this.teamTwoPoints = teamTwoPoints;
    }

    public static async record(teamOneName: string, teamTwoName: string, teamOneScore: number, teamTwoScore: number) {
        const teamOne = await Team.fetch(teamOneName) as Team;
        const teamTwo = await Team.fetch(teamTwoName) as Team;
        const teamOnePlayers = await teamOne.getPlayers() as Player[];
        const teamTwoPlayers = await teamTwo.getPlayers() as Player[];

        teamOne.stats.points += teamOneScore;
        teamTwo.stats.points += teamTwoScore;

        if (teamOneScore > teamTwoScore) {
            teamOne.stats.wins += 1;
            teamTwo.stats.losses += 1;
            for (const player of teamOnePlayers) {
                player.stats.points += teamOneScore;
                player.stats.wins += 1;
            }
        }
        else if (teamTwoScore > teamOneScore) {
            teamOne.stats.losses += 1;
            teamTwo.stats.wins += 1;

        } else {
            throw new Error("Invalid Score - No Draws");
        }

        await teamOne.save();
        await teamTwo.save();
        const games = await Game.fetchAll();
        return await new Game(String(games.length + 1), teamOneName, teamTwoName, teamOneScore, teamTwoScore).save();
    }

    public static async fetchAll() {
        return await PuggApi.fetchAllGames();
    }

    public static async fetch(id: string) {
        return await PuggApi.fetchGame(id);
    }

    public async save() {
        await PuggApi.upsertGame(this);
        return this;
    }
}