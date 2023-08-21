import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";

export class ButtonStyleComponent extends ActionRowBuilder<StringSelectMenuBuilder> {
    constructor(customId: string) {
        super();
        const stringSelectMenu = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder("Select a Button Style")
            .setMaxValues(1)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setValue("primary")
                    .setLabel("Primary")
                    .setDescription("Blue Button")
                    .setEmoji("🟦"),
                new StringSelectMenuOptionBuilder()
                    .setValue("secondary")
                    .setLabel("Secondary")
                    .setDescription("Gray Button")
                    .setEmoji("⬛"),
                new StringSelectMenuOptionBuilder()
                    .setValue("success")
                    .setLabel("Success")
                    .setDescription("Green Button")
                    .setEmoji("🟩"),
                new StringSelectMenuOptionBuilder()
                    .setValue("danger")
                    .setLabel("Danger")
                    .setDescription("Red Button")
                    .setEmoji("🟥"),
            )
        this.addComponents(stringSelectMenu);
    }
}