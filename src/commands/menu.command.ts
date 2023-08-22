import {Command, ServerName} from "../command";
import {ChatInputCommandInteraction, Guild, SlashCommandBuilder} from "discord.js";
import {Menu} from "../menu";
import {MenuEditComponents} from "../components/menu.edit.components";
import {NotFoundError} from "../error";
import {MenuSetupComponents} from "../components/menu.setup.components";

enum Subcommand {
    Create = "create",
    Edit = "edit",
    Delete = "delete",
    List = "list"
}

const builder = new SlashCommandBuilder()
    .setName("menu")
    .setDescription("menu management command")
    .addSubcommand((subcommand) => subcommand
        .setName(Subcommand.Create)
        .setDescription("create a menu")
        .addStringOption((string) => string
            .setName("name")
            .setDescription("the name of the menu")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) => subcommand
        .setName(Subcommand.List)
        .setDescription("list all menus")
    )
    .addSubcommand((subcommand) => subcommand
        .setName(Subcommand.Edit)
        .setDescription("edit a menu")
        .addStringOption((string) => string
            .setName("name")
            .setDescription("the name of the menu")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) => subcommand
        .setName(Subcommand.Delete)
        .setDescription("delete a menu")
        .addStringOption((string) => string
            .setName("name")
            .setDescription("the name of the menu")
            .setRequired(true)
        )
    );

async function execute(interaction: ChatInputCommandInteraction) {
    const subcommandName = interaction.options.getSubcommand();
    const guild = interaction.guild as Guild;

    if (subcommandName == Subcommand.Create) {
        const menuName = interaction.options.getString("name") as string;
        const menu = await Menu.fetch(menuName, guild.id);
        if (menu) {
            await interaction.reply({ content: `Menu with name \`${menuName}\` already exists.`, ephemeral: true });
        } else {
            const menu = await new Menu(menuName, guild.id).save();
            const components = MenuEditComponents.instance(menu);
            await interaction.reply({ components: components });
        }
        return;
    }

    if (subcommandName == Subcommand.Edit) {
        const menuName = interaction.options.getString("name") as string;
        const menu = await Menu.fetch(menuName, guild.id);
        if (!menu) {
            await interaction.reply({ content: `Menu with name \`${menuName}\` does not exist.`, ephemeral: true });
        } else {
            const components = MenuEditComponents.instance(menu);
            await interaction.reply({ components: components });
        }
        return;
    }

    if (subcommandName == Subcommand.Delete) {
        const menuName = interaction.options.getString("name") as string;
        const menu = await Menu.fetch(menuName, guild.id);
        if (!menu) {
            await interaction.reply({ content: `Menu with name \`${menuName}\` does not exist.`,  ephemeral: true });
        } else {
            await menu.delete();
            await interaction.reply({ content: "Success", ephemeral: true });
        }
        return;
    }

    if (subcommandName == Subcommand.List) {
        if (!interaction.inGuild()) throw new Error();
        const menus = await Menu.fetchByGuild(interaction.guildId);
        if (menus.length < 1) {
            await interaction.reply({ content: "There are no menus yet.", ephemeral: true });
            return;
        }
        const content = menus.map(menu => `- ${menu.name}`).join("\n");
        await interaction.reply({ content: content, ephemeral: true });
        return;
    }

}

export const MenuCommand = new Command("menu", ServerName.Global, true, builder, execute);