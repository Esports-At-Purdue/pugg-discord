import {Colors, EmbedBuilder} from "discord.js";
import {Game} from "../saveables/game";
import {sprintf} from "sprintf-js";
import {Player} from "../saveables/player";

export class GameEmbed extends EmbedBuilder {

    constructor(game: Game) {
        super();
        if (game.teamOnePoints > game.teamTwoPoints) {
            this.setTitle(`The ${game.teamOne.properName} beat the ${game.teamTwo.properName} ${game.teamOnePoints} - ${game.teamTwoPoints}`);
        } else {
            this.setTitle(`The ${game.teamTwo.properName} beat the ${game.teamOne.properName} ${game.teamTwoPoints} - ${game.teamOnePoints}`);
        }
        this.setDescription("\`\`\`" +
            game.eloChanges
                .map((eloChange, index) => {
                    const player = game.teamOne.players.find(player => player.id == eloChange.playerId) ?? game.teamTwo.players.find(player => player.id == eloChange.playerId) as Player;
                    const symbol = eloChange.change > 0 ? '+' : '-';
                    return sprintf("%-24s %s%-4d -> %4d", player.username + ":", symbol, Math.abs(eloChange.change), player.stats.elo);
                })
                .join("\n")
            + "\`\`\`"
        );
        this.setColor(Colors.Yellow);
    }
}