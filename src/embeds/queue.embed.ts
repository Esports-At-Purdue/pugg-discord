import {ColorResolvable, EmbedBuilder} from "discord.js";
import {Queue} from "../managers/queue.manager";

export class QueueEmbed extends EmbedBuilder {
    constructor(message: string, color: ColorResolvable, queue: Queue) {
        super();
        const players = queue.getPlayers();
        const description = players.map((player, index) => `**${index + 1}.** ${player.username}`).join('\n');
        if (players.length > 0) this.setDescription(description);
        this.setTitle(message);
        this.setColor(color);
    }
}