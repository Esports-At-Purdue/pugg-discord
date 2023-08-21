import {Command, ServerName} from "../command";
import {ChatInputCommandInteraction, Guild, SlashCommandBuilder} from "discord.js";
import {Menu} from "../menu";
import {MenuEditComponents} from "../components/menu.edit.components";
import {NotFoundError} from "../error";

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
        try {
            await Menu.fetch(menuName, guild.id);
            await interaction.reply({ content: `Menu with name \`${menuName}\` already exists.`, ephemeral: true });
            return;
        } catch {
            const menu = await Menu.create(menuName, guild.id).save();
            const content = "When you are finished editing, dismiss this message.";
            const menuComponents = MenuEditComponents.load(menu);
            await interaction.reply({ content: content, components: menuComponents, ephemeral: true });
            return;
        }
    }

    if (subcommandName == Subcommand.Edit) {
        const menuName = interaction.options.getString("name") as string;
        try {
            const menu = await Menu.fetch(menuName, guild.id);
            if (!menu) throw new NotFoundError("Menu Not Found");
            const content = "When you are finished editing, dismiss this message.";
            const menuComponents = MenuEditComponents.load(menu);
            await interaction.reply({ content: content, components: menuComponents, ephemeral: true });
            return;
        } catch {
            await interaction.reply({ content: `Menu with name \`${menuName}\` does not exist.`, ephemeral: true });
            return;
        }
    }

    if (subcommandName == Subcommand.Delete) {
        const menuName = interaction.options.getString("name") as string;
        try {
            const menu = await Menu.fetch(menuName, guild.id);
            if (!menu) throw new NotFoundError("Menu Not Found")
            await menu.delete();
            await interaction.reply({content: "Success", ephemeral: true});
        } catch (error) {
            console.log(error);
            await interaction.reply({
                content: `Menu with name \`${menuName}\` does not exist.`,
                ephemeral: true
            });
            return;
        }
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

export const MenuCommand = new Command("menu", ServerName.Global, builder, execute);