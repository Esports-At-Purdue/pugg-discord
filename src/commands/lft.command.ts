import {Command, ServerName} from "../command";
import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {LftModal} from "../modals/lft.modal";

const builder = new SlashCommandBuilder()
    .setName('lft')
    .setDescription('looking-for-team command')

async function execute(interaction: ChatInputCommandInteraction) {
    const modal = new LftModal();
    await interaction.showModal(modal);
    return;
}

export const LftCommand = new Command("lft", ServerName.CSGO, builder, execute);