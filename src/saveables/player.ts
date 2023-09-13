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

    public get winRate() {
        return this.stats.wins / (this.stats.wins + this.stats.losses);
    }

    public getEloChange(roundsWon: number, totalRounds: number, teamElo: number, enemyElo: number) {
        const k = 5;
        const winDelta = roundsWon / totalRounds;
        const playerElo = this.stats.elo + teamElo / 2;
        const actualOutcome = roundsWon > (totalRounds / 2) ? 1 : 0;
        const baseChange = 1 / (1 + Math.pow(10, (enemyElo - playerElo) / 300));
        const biasedChange = k * (actualOutcome - baseChange);
        return winDelta > 0.5 ? biasedChange + 28 : biasedChange - 20;
    }

    public static newInstance(id: string, firstName: string, lastName: string, username: string) {
        const stats = new PlayerStats(350, 0, 0, 0);
        return new Player(id, firstName, lastName, username, stats);
    }

    public static getRankFile(rank: number, elo: number) {
        if (elo < 30)   return "1-iron.png";
        if (elo < 60)   return "2-iron.png";
        if (elo < 100)  return "3-iron.png";
        if (elo < 130)  return "1-bronze.png";
        if (elo < 160)  return "2-bronze.png";
        if (elo < 200)  return "3-bronze.png";
        if (elo < 230)  return "1-silver.png";
        if (elo < 260)  return "2-silver.png";
        if (elo < 300)  return "3-silver.png";
        if (elo < 330)  return "1-gold.png";
        if (elo < 360)  return "2-gold.png";
        if (elo < 400)  return "3-gold.png";
        if (elo < 430)  return "1-plat.png";
        if (elo < 460)  return "2-plat.png";
        if (elo < 500)  return "3-plat.png";
        if (elo < 530)  return "1-diamond.png";
        if (elo < 560)  return "2-diamond.png";
        if (elo < 600)  return "3-diamond.png";
        if (elo < 630)  return "1-ascendant.png";
        if (elo < 660)  return "2-ascendant.png";
        if (elo < 700)  return "3-ascendant.png";
        if (elo < 730)  return "1-immortal.png";
        if (elo < 760)  return "2-immortal.png";
        if (elo < 800)  return "3-immortal.png";
        if (rank > 2)   return "3-immortal.png";
        return "radiant.png"
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

/*
    public getEloChange(roundsWon: number, totalRounds: number, teamElo: number, enemyElo: number) {
        const k = 48;
        const l = 10;
        const c = 400;
        const trueElo = this.stats.elo + teamElo / 2;

        const qA = Math.pow(10, trueElo / c);
        const qB = Math.pow(10, enemyElo / c);
        console.log(qA);
        console.log(qB);

        const trueOutcome = roundsWon > totalRounds / 2 ? 1 : 0;
        const expectedOutcome = qA / (qA + qB);
        const rawChange = k * (trueOutcome - expectedOutcome) + l * (roundsWon / totalRounds);
        return Math.round(rawChange);
    }

 */