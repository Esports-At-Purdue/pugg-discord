import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {Menu} from "../../saveables/menu";

export class MenuEditComponents {
    private constructor() {  }

    public static instance(menu: Menu) {
        const components = [  ];
        const actionRowA = new ActionRowBuilder<ButtonBuilder>();
        const actionRowB = new ActionRowBuilder<ButtonBuilder>();
        const actionRowC = new ActionRowBuilder<ButtonBuilder>();

        actionRowA.addComponents(
            new ButtonBuilder()
                .setCustomId(`menu-edit-content-${menu.name}`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Set Content"),
            new ButtonBuilder()
                .setCustomId(`menu-delete-content-${menu.name}`)
                .setStyle(ButtonStyle.Danger)
                .setLabel("Delete Content")
        );


        actionRowB.addComponents(
            new ButtonBuilder()
                .setCustomId(`menu-add-embed-${menu.name}`)
                .setStyle(ButtonStyle.Success)
                .setLabel("Add Embed"),
            new ButtonBuilder()
                .setCustomId(`menu-edit-embed-${menu.name}`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Edit Embed"),
            new ButtonBuilder()
                .setCustomId(`menu-delete-embed-${menu.name}`)
                .setStyle(ButtonStyle.Danger)
                .setLabel("Delete Embed")
        )

        actionRowC.addComponents(
            new ButtonBuilder()
                .setCustomId(`menu-add-component-${menu.name}`)
                .setStyle(ButtonStyle.Success)
                .setLabel("Add Row Component"),
            new ButtonBuilder()
                .setCustomId(`menu-edit-component-${menu.name}`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Edit Row Component"),
            new ButtonBuilder()
                .setCustomId(`menu-delete-component-${menu.name}`)
                .setStyle(ButtonStyle.Danger)
                .setLabel("Delete Row Component")
        )


        components.push(actionRowA, actionRowB, actionRowC);

        if (menu.content.length > 0 || menu.embeds.length > 0 || menu.components.length > 0) {
            components.push(
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`menu-render-all-${menu.name}`)
                        .setStyle(ButtonStyle.Primary)
                        .setLabel("Render Menu"),
                )
            )
        }

        return components;
    }
}