import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export class DeleteComponent extends ActionRowBuilder<ButtonBuilder> {
    constructor(id: string) {
        super();
        this.setComponents(
            new ButtonBuilder()
                .setCustomId(`delete-${id}`)
                .setLabel("Delete")
                .setStyle(ButtonStyle.Secondary)
        )
    }
}