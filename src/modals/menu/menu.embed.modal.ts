import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {Menu} from "../../saveables/menu";

export class MenuEmbedModal extends ModalBuilder {
    constructor(menu: Menu, index: number = 5) {
        super();
        const titleText = new TextInputBuilder()
            .setCustomId("title")
            .setStyle(TextInputStyle.Short)
            .setLabel("Please enter a title (optional)")
            .setPlaceholder("Ex: Reaction Roles")
            .setRequired(false);
        const descriptionText = new TextInputBuilder()
            .setCustomId("description")
            .setStyle(TextInputStyle.Paragraph)
            .setLabel("Please enter a description (optional)")
            .setPlaceholder("Ex: - Purdue: React if you are a student")
            .setRequired(false);
        const colorText = new TextInputBuilder()
            .setCustomId("color")
            .setStyle(TextInputStyle.Short)
            .setLabel("Please enter a hex color (optional)")
            .setPlaceholder("Ex: #010101")
            .setRequired(false);

        if (index < 5) {
            titleText.setValue(menu.embeds[index].title ?? "");
            descriptionText.setValue(menu.embeds[index].description ?? "");
            colorText.setValue(integerColorToHex(menu.embeds[index].color) ?? "");
        }

        const actionRowA = new ActionRowBuilder<TextInputBuilder>().addComponents(titleText);
        const actionRowB = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionText);
        const actionRowC = new ActionRowBuilder<TextInputBuilder>().addComponents(colorText);
        this.setCustomId(`menu-add-embed-${menu.name}-${index}`).addComponents(actionRowA, actionRowB, actionRowC).setTitle("Menu Embed");
    }
}

const integerColorToHex = (integer?: number) => {
    if (!integer) return;
    const red = (integer >> 16) & 0xFF;
    const green = (integer >> 8) & 0xFF;
    const blue = integer & 0xFF;
    return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
}