import {EmbedBuilder} from "discord.js";
import {Game} from "../saveables/game";

export class GameEmbed extends EmbedBuilder {

    constructor() {
        super();
    }

    public static async load(game: Game) {
        return new GameEmbed();
    }
}