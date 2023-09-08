import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {Queue} from "../managers/queue.manager";

export class QueueComponent extends ActionRowBuilder<ButtonBuilder> {
    constructor(queue: Queue) {
        super();
        this.addComponents(
            new ButtonBuilder()
                .setCustomId("wallyball-add")
                .setLabel("Add Players")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("wallyball-remove")
                .setLabel("Remove Players")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(queue.size < 1),
            new ButtonBuilder()
                .setCustomId("wallyball-clear")
                .setLabel("Clear")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(queue.size < 1),
            new ButtonBuilder()
                .setCustomId("wallyball-generate")
                .setLabel("Generate Teams")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(queue.size < 2)
        )
    }
}