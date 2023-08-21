import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export class MenuModal extends ModalBuilder {
    constructor(name: string) {
        super();
        const label = "Please input the target menu name.";
        const textInput = new TextInputBuilder().setCustomId("name").setLabel(label).setStyle(TextInputStyle.Short);
        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
        this.addComponents(actionRow).setCustomId(`menu-${name}`).setTitle("Create Menu");
    }
}