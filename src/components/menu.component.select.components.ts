import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";

export class MenuComponentSelectComponents extends ActionRowBuilder<StringSelectMenuBuilder> {
    constructor(menuName: string) {
        super();
        this.addComponents(
            new StringSelectMenuBuilder()
                .setOptions(
                    new StringSelectMenuOptionBuilder()
                        .setValue("button")
                        .setEmoji("✅")
                        .setLabel("Button Row Component"),
                    new StringSelectMenuOptionBuilder()
                        .setValue("select")
                        .setEmoji("☑")
                        .setLabel("Drop Down Component"),
                )
                .setCustomId(`menu-add-component-${menuName}`).setMaxValues(1).setPlaceholder("Select an option")
        )
    }
}