import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {Team} from "../models/team";

export class GameRecordModal extends ModalBuilder {
    constructor(teamOne: Team, teamTwo: Team) {
        super();
        this.setCustomId(`wallyball-record-${teamOne.name}-${teamTwo.name}`).setTitle("Game Record Scores")
        const actionRowA = new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder().setCustomId("teamOneScore").setLabel(`The ${teamOne.properName}'s score:`).setStyle(TextInputStyle.Short)
        )
        const actionRowB = new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder().setCustomId("teamTwoScore").setLabel(`The ${teamTwo.properName}'s score:`).setStyle(TextInputStyle.Short)
        )
        this.addComponents(actionRowA, actionRowB);
    }
}