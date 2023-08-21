import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {Menu} from "../menu";

export class MenuEditComponents {

    public static load(menu: Menu) {
        const components = [  ];
        let lastRowIndex = 6;
        for (let i = 0; i < 5; i++) {
            let lastColumnIndex = 6;
            const actionRow = new ActionRowBuilder<ButtonBuilder>();
            if (!menu.buttons[i][0] && lastRowIndex == 6) lastRowIndex = i;
            for (let j = 0; j < 5; j++) {
                const button = menu.buttons[i][j];
                const builder = new ButtonBuilder().setCustomId(`menu-${menu.name}-${i}-${j}`);
                if (!button) {
                    if (lastColumnIndex == 6) lastColumnIndex = j;
                    builder.setStyle(ButtonStyle.Secondary);
                    if (i > lastRowIndex || j > lastColumnIndex) {
                        builder.setDisabled(true);
                        builder.setEmoji("🚫")
                    } else {
                        builder.setLabel("Set")
                    }
                    actionRow.addComponents(builder);
                } else {
                    builder.setStyle(button.style);
                    if (button.label) builder.setLabel(button.label);
                    if (button.emoji) builder.setEmoji(button.emoji);
                    actionRow.addComponents(builder);
                }
            }
            components.push(actionRow);
        }
        return components;
    }
}