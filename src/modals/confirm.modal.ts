import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export class ConfirmModal extends ModalBuilder {
    constructor(id: string) {
        super();
        this.setCustomId(`confirm-${id}`);
        this.setTitle("Confirm Action");
        this.setComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
                new TextInputBuilder()
                    .setCustomId("confirm")
                    .setLabel("please type \"confirm\"")
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength("confirm".length)
            )
        )
    }
}