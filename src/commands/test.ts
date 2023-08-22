import {Command, ServerName} from "../command";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Guild, RoleSelectMenuBuilder,
    SlashCommandBuilder
} from "discord.js";
import {NotFoundError} from "../error";
import {PuggApi} from "../services/pugg.api";

const builder = new SlashCommandBuilder()
    .setName("test")
    .setDescription("test");

async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild as Guild;
    const server = await PuggApi.fetchServer(guild.id);
    if (!server) throw new NotFoundError(`Server Not Found\nServerId: ${guild.id}`);
    const actionRowA = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId("test").setLabel("Test").setStyle(ButtonStyle.Secondary));
    const actionRowB = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(new RoleSelectMenuBuilder().setCustomId("test2").setPlaceholder("3"))
    const actionRowC = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId("test3").setLabel("Test3").setStyle(ButtonStyle.Secondary));
    await interaction.reply({ components: [ actionRowA, actionRowB, actionRowC ], ephemeral: true });
}

export const TestCommand = new Command("test", ServerName.Global, true, builder, execute);