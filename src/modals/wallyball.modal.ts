import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";


export class WallyballModal extends ModalBuilder {
    public constructor() {
        super();
        const firstNamePrompt = "What is your preferred first name?";
        const lastNamePrompt = "What is your last name or last initial?";
        const firstNameInput = new TextInputBuilder().setCustomId("firstName").setLabel(firstNamePrompt).setStyle(TextInputStyle.Short);
        const lastNameInput = new TextInputBuilder().setCustomId("lastName").setLabel(lastNamePrompt).setStyle(TextInputStyle.Short);
        const firstNameRow = new ActionRowBuilder<TextInputBuilder>().addComponents(firstNameInput);
        const lastNameRow = new ActionRowBuilder<TextInputBuilder>().addComponents(lastNameInput);
        this.setCustomId("wallyball-register").setTitle("Wallyball Registration").addComponents(firstNameRow, lastNameRow);
    }
}