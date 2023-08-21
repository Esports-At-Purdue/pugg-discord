import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";

export class ButtonEditComponent extends ActionRowBuilder<StringSelectMenuBuilder> {
    constructor(customId: string) {
        super();
        const stringSelectMenu = new StringSelectMenuBuilder()
            .setCustomId(`${customId}-button`)
            .setPlaceholder("Choose a property to update")
            .setMaxValues(1)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setValue("id")
                    .setLabel("Role")
                    .setDescription("The role this button assigns")
                    .setEmoji("🆔"),
                new StringSelectMenuOptionBuilder()
                    .setValue("style")
                    .setLabel("Style")
                    .setDescription("The style of this button")
                    .setEmoji("🪞"),
                new StringSelectMenuOptionBuilder()
                    .setValue("label")
                    .setLabel("Label")
                    .setDescription("The label on this button (optional if emoji set)")
                    .setEmoji("✏️"),
                new StringSelectMenuOptionBuilder()
                    .setValue("emoji")
                    .setLabel("Emoji")
                    .setDescription("The emoji on this button (optional if label set)")
                    .setEmoji("😀")
            )
        this.addComponents(stringSelectMenu);
    }
}