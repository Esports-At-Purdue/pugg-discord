import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {Menu} from "../menu";

export class MenuEditComponents {
    private constructor() {  }

    public static instance(menu: Menu) {
        const components = [  ];
        const actionRowA = new ActionRowBuilder<ButtonBuilder>();
        const actionRowB = new ActionRowBuilder<ButtonBuilder>();
        const actionRowC = new ActionRowBuilder<ButtonBuilder>();

        if (menu.content.length < 1) {
            actionRowA.addComponents(
                new ButtonBuilder()
                    .setCustomId("menu-edit-content")
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Add Content")
            );
        }
        else {
            actionRowA.addComponents(
                new ButtonBuilder()
                    .setCustomId("menu-edit-content")
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("Add Content"),
                new ButtonBuilder()
                    .setCustomId("menu-delete-content")
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("Delete Content")
            );
        }

        if (menu.embeds.length < 1) {
            actionRowB.addComponents(
                new ButtonBuilder()
                    .setCustomId("menu-add-embed")
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Add Embed")
            )
        }
        else if (menu.embeds.length > 5) {
            actionRowB.addComponents(
                new ButtonBuilder()
                    .setCustomId("menu-add-embed")
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Add Embed"),
                new ButtonBuilder()
                    .setCustomId("menu-edit-embed")
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("Edit Embed"),
                new ButtonBuilder()
                    .setCustomId("menu-delete-embed")
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("Delete Embed")
            )
        }
        else {
            actionRowB.addComponents(
                new ButtonBuilder()
                    .setCustomId("menu-edit-embed")
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("Edit Embed"),
                new ButtonBuilder()
                    .setCustomId("menu-delete-embed")
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("Delete Embed")
            )
        }

        if (menu.components.length < 1) {
            actionRowC.addComponents(
                new ButtonBuilder()
                    .setCustomId("menu-add-row")
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Add Row")
            )
        }
        else if (menu.components.length > 5) {
            actionRowC.addComponents(
                new ButtonBuilder()
                    .setCustomId("menu-add-row")
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Add Row"),
                new ButtonBuilder()
                    .setCustomId("menu-edit-row")
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("Edit Row"),
                new ButtonBuilder()
                    .setCustomId("menu-delete-row")
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("Delete Row")
            )
        }
        else {
            actionRowC.addComponents(
                new ButtonBuilder()
                    .setCustomId("menu-edit-row")
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("Edit Row"),
                new ButtonBuilder()
                    .setCustomId("menu-delete-row")
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("Delete Row")
            )
        }

        components.push(actionRowA, actionRowB, actionRowC);
        return components;
    }
}