import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";
import {Menu} from "../../saveables/menu";

export class MenuSelectComponents extends ActionRowBuilder<StringSelectMenuBuilder> {
    constructor(menus: Menu[]) {
        super();
        const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("setup")
                .setPlaceholder("Select a menu")
                .setMaxValues(1);

        for (const menu of menus) {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setValue(menu.name)
                    .setLabel(menu.name)
            )
        }

        this.addComponents(selectMenu)
    }
}