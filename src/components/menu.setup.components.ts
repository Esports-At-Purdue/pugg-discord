import {Menu} from "../menu";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export class MenuSetupComponents {
    public static load(menu: Menu) {
        const components = [  ];
        for (let i = 0; i < 5; i++) {
            const actionRow = new ActionRowBuilder<ButtonBuilder>();
            let buttons = 0;
            for (let j = 0; j < 5; j++) {
                const button = menu.buttons[i][j];
                if (button) {
                    const builder = new ButtonBuilder()
                        .setCustomId(button.id)
                        .setStyle(button.style);
                    if (button.label) builder.setLabel(button.label);
                    if (button.emoji) builder.setLabel(button.emoji);
                    actionRow.addComponents(builder);
                    buttons++;
                }
            }
            if (buttons > 0) components.push(actionRow);
        }
        return components;
    }
}