import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

const prompt = "What is your Purdue email address?";

export class PurdueModal extends ModalBuilder {
    constructor() {
        super();
        const emailInput = new TextInputBuilder().setCustomId("email").setLabel(prompt).setStyle(TextInputStyle.Short);
        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput);
        this.addComponents(actionRow).setCustomId("purdue").setTitle("Email Verification");
    }
}