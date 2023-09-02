import {Colors, EmbedBuilder} from "discord.js";
import {Team} from "../saveables/team";
import {Player} from "../saveables/player";

export class TeamEmbed extends EmbedBuilder {

    constructor(team: Team, players: Player[]) {
        super();
        this.setTitle(`Team ${team.name}`);
        const description = players.map(player => player.username).join('\n');
        this.setDescription(description);
        this.setColor(Colors.DarkBlue);
    }

    public static async load(team: Team) {
        const players = await team.getPlayers();
        return new TeamEmbed(team, players as Player[]);
    }
}