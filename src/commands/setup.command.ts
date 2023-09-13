import {ChatInputCommandInteraction, Guild, SlashCommandBuilder} from "discord.js";
import {NotFoundError} from "../error";
import {PuggApi} from "../services/pugg.api";
import {MenuSelectComponents} from "../components/menu/menu.select.components";
import {ServerName} from "../models/server";
import {Command} from "../command";

const builder = new SlashCommandBuilder()
    .setName("setup")
    .setDescription("setup a menu");

async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild as Guild;
    const server = await PuggApi.fetchServer(guild.id);
    if (!server) throw new NotFoundError(`Server Not Found\nServerId: ${guild.id}`);
    const menus = await PuggApi.fetchServerMenus(server.id);
    if (menus.length < 1) {
        await interaction.reply({ content: "You do not have any menus to setup yet.", ephemeral: true });
        return;
    }
    await interaction.reply({ components: [ new MenuSelectComponents(menus) ], ephemeral: true });
}

export const SetupCommand = new Command("setup", ServerName.Global, true, builder, execute);