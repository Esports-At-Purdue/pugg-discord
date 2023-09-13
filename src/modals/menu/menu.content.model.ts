import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {Menu} from "../../saveables/menu";

export class MenuContentModal extends ModalBuilder {
    constructor(menu: Menu) {
        super();
        const actionRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("content")
                    .setStyle(TextInputStyle.Paragraph)
                    .setLabel("Please enter a message")
                    .setPlaceholder("Ex: Use the buttons below to get roles")
                    .setValue(menu.content)
            )
        this.setCustomId(`menu-add-content-${menu.name}`).addComponents(actionRow).setTitle("Menu Content");
    }
}