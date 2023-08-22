import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export class MenuContentModal extends ModalBuilder {
    constructor(menuName: string) {
        super();
        const actionRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("content")
                    .setStyle(TextInputStyle.Paragraph)
                    .setLabel("Please enter a message")
                    .setPlaceholder("Ex: Use the buttons below to get roles")
            )
        this.setCustomId(`menu-add-content-${menuName}`).addComponents(actionRow).setTitle("Menu Content");
    }
}