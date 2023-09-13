import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {LftModal} from "../modals/lft.modal";
import {ServerName} from "../saveables/server";
import {Command} from "../command";

const builder = new SlashCommandBuilder()
    .setName('lft')
    .setDescription('looking-for-team command')

async function execute(interaction: ChatInputCommandInteraction) {
    const modal = new LftModal();
    await interaction.showModal(modal);
    return;
}

export const LftCommand = new Command("lft", ServerName.CSGO, false, builder, execute);