import {Colors, EmbedBuilder} from "discord.js";
import {Team} from "../models/team";
import {Player} from "../models/player";
import {sprintf} from "sprintf-js";

export class TeamEmbed extends EmbedBuilder {

    constructor(team: Team) {
        super();
        this.setTitle(`The ${team.properName}`);
        const description = team.players.map(player => player.username).join('\n');
        this.setDescription(description);
        this.setDescription("\`\`\`" +
            team.players
                .map(player => sprintf("%-24s %-4d", player.username + ":", player.stats.elo))
                .join("\n")
            + "\`\`\`"
        );
        this.setColor(Colors.DarkBlue);
    }
}