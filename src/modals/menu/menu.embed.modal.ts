import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export class MenuEmbedModal extends ModalBuilder {
    constructor(menuName: string) {
        super();
        const actionRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("title")
                    .setStyle(TextInputStyle.Short)
                    .setLabel("Please enter a title (optional)")
                    .setPlaceholder("Ex: Reaction Roles")
                    .setRequired(false),
                new TextInputBuilder()
                    .setCustomId("description")
                    .setStyle(TextInputStyle.Paragraph)
                    .setLabel("Please enter a description (optional)")
                    .setPlaceholder("Ex: - Purdue: React if you are a student")
                    .setRequired(false)
            )
        this.setCustomId(`menu-add-embed-${menuName}`).addComponents(actionRow).setTitle("Menu Embed");
    }
}