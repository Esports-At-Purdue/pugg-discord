import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

const experience = "What competitive experience do you have?";
const hoursAvailable = "How many hours can you practice per week?";
const roles = "What roles would you prefer to play?";
const academicYear = "What academic year are you?";
const otherInfo = "Is there any other info you'd like to add?";

export class LftModal extends ModalBuilder {
    public constructor() {
        super();
        const inputA = new TextInputBuilder().setCustomId("experience").setLabel(experience).setStyle(TextInputStyle.Paragraph);
        const inputB = new TextInputBuilder().setCustomId("hoursAvailable").setLabel(hoursAvailable).setStyle(TextInputStyle.Short);
        const inputC = new TextInputBuilder().setCustomId("roles").setLabel(roles).setStyle(TextInputStyle.Short);
        const inputD = new TextInputBuilder().setCustomId("academicYear").setLabel(academicYear).setStyle(TextInputStyle.Short);
        const inputE = new TextInputBuilder().setCustomId("otherInfo").setLabel(otherInfo).setStyle(TextInputStyle.Paragraph);
        const actionRowA = new ActionRowBuilder<TextInputBuilder>().addComponents(inputA);
        const actionRowB = new ActionRowBuilder<TextInputBuilder>().addComponents(inputB);
        const actionRowC = new ActionRowBuilder<TextInputBuilder>().addComponents(inputC);
        const actionRowD = new ActionRowBuilder<TextInputBuilder>().addComponents(inputD);
        const actionRowE = new ActionRowBuilder<TextInputBuilder>().addComponents(inputE);
        this.addComponents(actionRowA, actionRowB, actionRowC, actionRowD, actionRowE).setCustomId("lft").setTitle("LFT Form");
    }
}