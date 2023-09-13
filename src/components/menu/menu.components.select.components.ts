import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";
import {Menu} from "../../models/menu";

export class MenuComponentsSelectComponents extends ActionRowBuilder<StringSelectMenuBuilder> {
    constructor(menu: Menu) {
        super();
        const select = new StringSelectMenuBuilder().setCustomId(`menu-edit-component-${menu.name}`).setMaxValues(1).setPlaceholder("Select a Row Component");
        const components = menu.components;
        for (let i = 0; i < components.length; i++) {
            select.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setValue(`${i}`)
                    .setEmoji(`${indexToEmoji(i)}`)
                    .setLabel(`Row Component ${i + 1}`)
            )
        }
        this.addComponents(select);
    }
}

const indexToEmoji = (index: number) => {
    switch (index) {
        case 0: return "1️⃣";
        case 1: return "2️⃣";
        case 2: return "3️⃣";
        case 3: return "4️⃣";
        case 4: return "5️⃣";
    }
}