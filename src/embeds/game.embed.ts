import {EmbedBuilder} from "discord.js";
import {Game} from "../saveables/game";

export class GameEmbed extends EmbedBuilder {

    constructor(game: Game, message: string) {
        super();
        this.setTitle(message);
    }

    public static async load(game: Game) {
        if (game.teamOnePoints > game.teamTwoPoints) {
            const message = `Team ${game.teamOneName} beat ${game.teamTwoName} ${game.teamOnePoints} - ${game.teamTwoPoints}`;
            return new GameEmbed(game, message);
        } else {
            const message = `Team ${game.teamTwoName} beat ${game.teamOneName} ${game.teamTwoPoints} - ${game.teamOnePoints}`;
            return new GameEmbed(game, message);
        }
    }
}