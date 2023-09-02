import {Command} from "../managers/command";
import {
    ActionRowBuilder,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    Guild,
    GuildMember,
    SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
    UserSelectMenuBuilder
} from "discord.js";
import {NotFoundError} from "../error";
import {PuggApi} from "../services/pugg.api";
import {Player} from "../saveables/player";
import {ServerName} from "../saveables/server";
import {QueueManager} from "../managers/queue";
import {QueueEmbed} from "../embeds/queue.embed";
import {Team} from "../saveables/team";

enum Subcommand {
    Nick = "nick",
    QueueAdd = "add",
    QueueRemove = "remove",
    QueueClear = "clear",
    QueueView = "view",
    TeamGenerate = "generate",
    GameRecord = "record"
}

const builder = new SlashCommandBuilder()
    .setName("wb")
    .setDescription("general purpose wallyball command")
    .addSubcommand((subcommand) => subcommand
        .setName(Subcommand.Nick)
        .setDescription("set your wallyball nickname")
        .addStringOption((string) => string
            .setName("name")
            .setDescription("your wallyball nickname")
            .setRequired(true)
        )
    )
    .addSubcommandGroup((group) => group
        .setName("queue")
        .setDescription("wallyball queue command")
        .addSubcommand((subcommand) => subcommand
            .setName(Subcommand.QueueAdd)
            .setDescription("add players to the queue")
        )
        .addSubcommand((subcommand) => subcommand
            .setName(Subcommand.QueueRemove)
            .setDescription("remove players from the queue")
        )
        .addSubcommand((subcommand) => subcommand
            .setName(Subcommand.QueueClear)
            .setDescription("clear the entire queue")
        )
        .addSubcommand((subcommand) => subcommand
            .setName(Subcommand.QueueView)
            .setDescription("view the queue")
        )
    )
    .addSubcommandGroup((group) => group
        .setName("team")
        .setDescription("wallyball team command")
        .addSubcommand((subcommand) => subcommand
            .setName(Subcommand.TeamGenerate)
            .setDescription("generate teams from the queue")
        )
    )
    .addSubcommandGroup((group) => group
        .setName("game")
        .setDescription("wallyball game command")
        .addSubcommand((subcommand) => subcommand
            .setName(Subcommand.GameRecord)
            .setDescription("generate teams from the queue")
        )
    )

async function execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild as Guild;
    const server = await PuggApi.fetchServer(guild.id);
    const player = await Player.fetch(interaction.user.id);
    const member = interaction.member as GuildMember;

    if (!server) throw new NotFoundError(`Server Not Found\nServerId: ${guild.id}`);
    if (!player) {
        await interaction.reply({ content: "Sorry, you must be registered to do this.", ephemeral: true });
        return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand == Subcommand.Nick) {
        player.firstName = interaction.options.getString("name", true);
        await player.save();
        await interaction.reply({ content: `Your new nickname is \`${player.firstName}\``, ephemeral: true });
        return;
    }

    if (subcommand == Subcommand.QueueAdd) {
        const adminRoles = server.settings.roles.admins;
        if (member.roles.cache.some(role => adminRoles.some(adminRole => role.id == adminRole))) {
            const actionRow = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId("wallyball-add")
                    .setPlaceholder("Select all the players you want to add.")
                    .setMaxValues(20)
            );
            await interaction.reply({ components: [ actionRow ], ephemeral: true });
        } else {
            await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }
        return;
    }

    if (subcommand == Subcommand.QueueRemove) {
        const adminRoles = server.settings.roles.admins;
        if (member.roles.cache.some(role => adminRoles.some(adminRole => role.id == adminRole))) {
            const selectMenu = new StringSelectMenuBuilder().setCustomId("wallyball-remove").setPlaceholder("Select all the players you want to remove.");
            const players = QueueManager.queue.getPlayers();
            for (const player of players) {
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setValue(player.id)
                        .setLabel(`${player.firstName} ${player.lastName.charAt(0)}`)
                        .setDescription(player.username)
                )
            }
            const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                selectMenu
            );
            await interaction.reply({ components: [ actionRow ], ephemeral: true });
        } else {
            await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }
        return;
    }

    if (subcommand == Subcommand.QueueClear) {
        const adminRoles = server.settings.roles.admins;
        if (member.roles.cache.some(role => adminRoles.some(adminRole => role.id == adminRole))) {
            QueueManager.queue.clear();
            await interaction.reply({ content: "The queue has been cleared.", ephemeral: true });
        } else {
            await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }
        return;
    }

    if (subcommand == Subcommand.QueueView) {
        const message = "Current Queue";
        const embed = new QueueEmbed(message, Colors.Yellow, QueueManager.queue);
        await interaction.reply({ embeds: [ embed ], ephemeral: true });
        return;
    }

    if (subcommand == Subcommand.TeamGenerate) {
        const adminRoles = server.settings.roles.admins;
        if (member.roles.cache.some(role => adminRoles.some(adminRole => role.id == adminRole))) {
            const queueSize = QueueManager.queue.size;

            if (queueSize < 2) {
                await interaction.reply({ content: "Sorry, you need at least 2 players to generate teams", ephemeral: true});
                return;
            }

            const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
            const selectMenu = new StringSelectMenuBuilder().setCustomId("wallyball-generate").setMaxValues(1)
            for (let i = 2; i <= queueSize; i++) {
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`${String(i)} Teams`)
                        .setValue(String(i))
                )
            }
            actionRow.addComponents(selectMenu);
            await interaction.reply({ components: [ actionRow ], ephemeral: true });
        } else {
            await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }
        return;
    }

    if (subcommand == Subcommand.GameRecord) {
        const teams = await Team.fetchAll();
        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("wallyball-record-1")
            .setPlaceholder("Pick the first team")
            .setMaxValues(1);
        for (let i = 0; i < teams.length && i < 5; i++) {
            const team = teams[i];
            const players = await team.getPlayers() as Player[];
            const playerNames = players.map(player => player.username);
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setValue(team.name)
                    .setLabel(`Team ${team.name}`)
                    .setDescription(playerNames.join(", "))
            );
        }
        actionRow.addComponents(selectMenu);
        await interaction.reply({ components: [ actionRow ] });
    }
}

export const WallyballCommand = new Command("wb", ServerName.Valorant, true, builder, execute);