import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    Colors,
    Guild,
    GuildMember,
    SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
    UserSelectMenuBuilder
} from "discord.js";
import {NotFoundError} from "../error";
import {PuggApi} from "../services/pugg.api";
import {Player} from "../saveables/player";
import {ServerName} from "../saveables/server";
import {QueueManager} from "../managers/queue.manager";
import {QueueEmbed} from "../embeds/queue.embed";
import {Team} from "../saveables/team";
import {LeaderboardImage} from "../images/leaderboard.image";
import {LeaderboardComponent} from "../components/leaderboard.component";
import {ProfileImage} from "../images/profile.image";
import {ConfirmModal} from "../modals/confirm.modal";
import {Command} from "../command";

enum Subcommand {
    Nick = "nick",
    QueueAdd = "add",
    QueueRemove = "remove",
    QueueClear = "clear",
    QueueView = "view",
    TeamGenerate = "generate",
    TeamAdd = "add-player",
    TeamRemove = "remove-player",
    GameRecord = "record",
    Leaderboard = "leaderboard",
    Profile = "profile",
    Reset = "reset"
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
    .addSubcommand((subcommand) => subcommand
        .setName(Subcommand.Leaderboard)
        .setDescription("leaderboard command")
        .addIntegerOption((integer) => integer
            .setName("page")
            .setDescription("page number")
            .setRequired(false)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) => subcommand
        .setName(Subcommand.Reset)
        .setDescription("reset command")
    )
    .addSubcommand((subcommand) => subcommand
        .setName(Subcommand.Profile)
        .setDescription("profile command")
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
        .addSubcommand((subcommand) => subcommand
            .setName(Subcommand.TeamAdd)
            .setDescription("add player to a team")
            .addUserOption((user) => user
                .setName("target")
                .setDescription("the player to add")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName(Subcommand.TeamRemove)
            .setDescription("remove player from a team")
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

    const adminRoles = server.settings.roles.admins;
    const isAdmin = member.roles.cache.some(role => adminRoles.some(adminRole => role.id == adminRole));

    const subcommand = interaction.options.getSubcommand();

    if (subcommand == Subcommand.Nick) {
        player.firstName = interaction.options.getString("name", true);
        await player.save();
        await interaction.reply({ content: `Your new nickname is \`${player.firstName}\``, ephemeral: true });
        return;
    }

    if (subcommand == Subcommand.QueueAdd) {
        if (!isAdmin) {
            await interaction.reply({content: "You don't have permission to use this command.", ephemeral: true});
            return;
        }
        const actionRow = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
            new UserSelectMenuBuilder()
                .setCustomId("wallyball-add")
                .setPlaceholder("Select all the players you want to add.")
                .setMaxValues(20)
        );
        await interaction.reply({ components: [ actionRow ], ephemeral: true });
        return;
    }

    if (subcommand == Subcommand.QueueRemove) {
        if (!isAdmin) {
            await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
            return;
        }
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
        return;
    }

    if (subcommand == Subcommand.QueueClear) {
        if (!isAdmin) {
            await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
            return;
        }
        QueueManager.queue.clear();
        await interaction.reply({ content: "The queue has been cleared.", ephemeral: true });
        return;
    }

    if (subcommand == Subcommand.QueueView) {
        const message = "Current Queue";
        const embed = new QueueEmbed(message, Colors.Yellow, QueueManager.queue);
        await interaction.reply({ embeds: [ embed ] });
        return;
    }

    if (subcommand == Subcommand.TeamGenerate) {
        if (!isAdmin) {
            await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
            return;
        }
        const queueSize = QueueManager.queue.size;

        if (queueSize < 2) {
            await interaction.reply({ content: "Sorry, you need at least 2 players to generate teams", ephemeral: true});
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        const selectMenu = new StringSelectMenuBuilder().setCustomId("wallyball-generate").setMaxValues(1)
        for (let i = Math.max(2, queueSize - 25); i <= queueSize; i++) {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${String(i)} Teams`)
                    .setValue(String(i))
            )
        }
        actionRow.addComponents(selectMenu);
        await interaction.editReply({ components: [ actionRow ] });
        return;
    }

    if (subcommand == Subcommand.TeamAdd) {
        if (!isAdmin) {
            await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
            return;
        }
        const user = interaction.options.getUser("target", true);
        const player = await Player.fetch(user.id);

        if (!player) {
            await interaction.reply({ content: "This user is not a registered player.", ephemeral: true });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        const teams = (await Team.fetchAll()).reverse();

        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`wallyball-team-add-${user.id}`)
            .setPlaceholder("Pick a team to add a player to")
            .setMaxValues(1);

        for (let i = 0; i < teams.length && i < 25; i++) {
            const team = teams[i];
            const playerNames = team.players.map(player => player.username).join(", ");
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setValue(team.name)
                    .setLabel(`${team.properName}`.slice(0, 25))
                    .setDescription(playerNames.length < 1 ? "Unknown" : playerNames.slice(0, 50))
            );
        }

        actionRow.addComponents(selectMenu);
        await interaction.editReply({ components: [ actionRow ] });
    }

    if (subcommand == Subcommand.TeamRemove) {
        if (!isAdmin) {
            await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        const teams = (await Team.fetchAll()).reverse();

        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`wallyball-team-remove`)
            .setPlaceholder("Pick a team to remove a player from")
            .setMaxValues(1);

        for (let i = 0; i < teams.length && i < 25; i++) {
            const team = teams[i];
            const playerNames = team.players.map(player => player.username).join(", ");
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setValue(team.name)
                    .setLabel(`${team.properName}`.slice(0, 25))
                    .setDescription(playerNames.length < 1 ? "Unknown" : playerNames.slice(0, 50))
            );
        }

        actionRow.addComponents(selectMenu);
        await interaction.editReply({ components: [ actionRow ] });
    }

    if (subcommand == Subcommand.GameRecord) {
        if (!isAdmin) {
            await interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        const teams = (await Team.fetchAll()).reverse();

        if (teams.length < 2) {
            await interaction.editReply({ content: "There must be at least two teams to record a game." });
            return;
        }

        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("wallyball-record-1")
            .setPlaceholder("Pick the first team")
            .setMaxValues(1);
        for (let i = 0; i < teams.length && i < 25; i++) {
            const team = teams[i];
            const playerNames = team.players.map(player => player.username).join(", ");
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setValue(team.name)
                    .setLabel(`${team.properName}`.slice(0, 25))
                    .setDescription(playerNames.length < 1 ? "Unknown" : playerNames.slice(0, 50))
            );
        }
        actionRow.addComponents(selectMenu);
        await interaction.editReply({ components: [ actionRow ] });
    }

    if (subcommand == Subcommand.Leaderboard) {
        await interaction.deferReply();
        const players = await PuggApi.fetchAllPlayers();
        const page = interaction.options.getInteger("page") ?? 1;
        const leaderboard = new LeaderboardImage(page);
        const attachment = await leaderboard.draw(guild, players);
        const actionRow = new LeaderboardComponent(page, players, false);
        await interaction.editReply({ components: [ actionRow ], files: [ attachment ] });
    }

    if (subcommand == Subcommand.Profile) {
        await interaction.deferReply();
        const players = await PuggApi.fetchAllPlayers();
        const profile = new ProfileImage(player);
        const attachment = await profile.draw(guild, players);
        await interaction.editReply({ files: [ attachment ] });
    }

    if (subcommand == Subcommand.Reset) {
        if (!isAdmin) {
            await interaction.reply({content: "You don't have permission to use this command.", ephemeral: true});
            return;
        }
        const confirmModal = new ConfirmModal("wallyball-reset");
        await interaction.showModal(confirmModal);
        return;
    }
}

export const WallyballCommand = new Command("wb", ServerName.Valorant, false, builder, execute);