import {ActionRowBuilder, ModalBuilder, TextInputBuilder} from "discord.js";

export class GameRecordModal extends ModalBuilder {
    constructor(teamOneName: string, teamTwoName: string) {
        super();
        this.setCustomId(`wallyball-record-${teamOneName}-${teamTwoName}`).setTitle("Game Record Scores")
        const actionRowA = new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder().setCustomId("teamOneScore").setLabel(`Team ${teamOneName} score:`)
        )
        const actionRowB = new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder().setCustomId("teamTwoScore").setLabel(`Team ${teamTwoName} score:`)
        )
        this.addComponents(actionRowA, actionRowB);
    }
}