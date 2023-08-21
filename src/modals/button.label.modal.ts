import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export class ButtonLabelModal extends ModalBuilder {
    constructor(customId: string) {
        super();
        this.setCustomId(`${customId}-buttonLabel`)
            .setTitle("Button Label Modal")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder().setCustomId("label")
                        .setLabel("Please input the label for the button")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                )
            )
    }
}