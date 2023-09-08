import {Command} from "../managers/command.manager";
import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {LfpModal} from "../modals/lfp.modal";
import {ServerName} from "../saveables/server";

const builder = new SlashCommandBuilder()
    .setName('lfp')
    .setDescription('looking-for-players command')
    .addStringOption((string) => string
        .setName("name")
        .setDescription("the name of your team")
        .setRequired(true)
    )

async function execute(interaction: ChatInputCommandInteraction) {
    const name = interaction.options.getString("name") as string;
    const modal = new LfpModal(name);
    await interaction.showModal(modal);
    return;
}

export const LfpCommand = new Command("lfp", ServerName.CSGO, false, builder, execute);