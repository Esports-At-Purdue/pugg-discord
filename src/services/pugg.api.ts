import axios from "axios";
import {backendUrl} from "../index";
import {Menu} from "../saveables/menu";
import {Student} from "../saveables/student";
import {Ticket} from "../saveables/ticket";
import {Server} from "../saveables/server";
import {LftPlayer} from "../saveables/lft.player";
import {LfpTeam} from "../saveables/lfp.team";
import {Player} from "../saveables/player";
import {Team} from "../saveables/team";
import {Game} from "../saveables/game";
import {NotFoundError} from "../error";

export class PuggApi {

    public static async fetchStudent(studentId: string) {
        try {
            const request = await axios.get(`${backendUrl}/students/${studentId}`);
            const { id, username, email, verified } = request.data;
            return new Student(id, username, email, verified);
        } catch {  }
    }

    public static async fetchPlayer(playerId: string) {
        try {
            const request = await axios.get(`${backendUrl}/players/${playerId}`);
            const { id, firstName, lastName, username, stats } = request.data;
            return new Player(id, firstName, lastName, username, stats);
        } catch {  }
    }

    public static async fetchTeam(teamName: string) {
        try {
            const request = await axios.get(`${backendUrl}/teams/${teamName}`);
            const { name, playerIds, stats } = request.data;
            const players = await Promise.all(playerIds.map((playerId: string) => PuggApi.fetchPlayer(playerId))) as Player[];
            return new Team(name, players, stats);
        } catch {  }
    }

    public static async fetchGame(gameId: string) {
        try {
            const request = await axios.get(`${backendUrl}/games/${gameId}`);
            const { id, teamOneName, teamTwoName, teamOneScore, teamTwoScore, eloChanges } = request.data;
            const teamOne = await PuggApi.fetchTeam(teamOneName);
            const teamTwo = await PuggApi.fetchTeam(teamTwoName);
            if (!teamOne) throw new NotFoundError(`Team Not Found\nName: ${teamOneName}`);
            if (!teamTwo) throw new NotFoundError(`Team Not Found\nName: ${teamTwoName}`);
            return new Game(id, teamOne, teamTwo, teamOneScore, teamTwoScore, eloChanges);
        } catch {  }
    }

    public static async fetchTicket(channelId: string) {
        try {
            const request = await axios.get(`${backendUrl}/tickets/channel/${channelId}`);
            const { ownerId, reason, content, status } = request.data;
            return new Ticket(channelId, ownerId, reason, content, status);
        } catch {  }
    }

    public static async fetchMenu(name: string, guildId: string) {
        try {
            const request = await axios.get(`${backendUrl}/menus/${guildId}/${name}`);
            const { content, embeds, components } = request.data;
            return new Menu(name, guildId, content, embeds, components);
        } catch {  }
    }

    public static async fetchServer(serverId: string) {
        try {
            const request = await axios.get(`${backendUrl}/servers/${serverId}/`);
            const { id, name, settings } = request.data;
            return new Server(id, name, settings);
        } catch {  }
    }

    public static async fetchLftPlayer(playerId: string) {
        try {
            const request = await axios.get(`${backendUrl}/sheets/players/${playerId}/`);
            const { row, index } = request.data;
            return new LftPlayer(row[0], index, row[1], row[2], row[3], row[4], row[5], row[6]);
        } catch {  }
    }

    public static async fetchLfpTeam(teamName: string) {
        try {
            const request = await axios.get(`${backendUrl}/sheets/teams/${teamName}/`);
            const { row, index } = request.data;
            return new LfpTeam(row[0], index, row[1], row[2], row[3], row[4], row[5], row[6]);
        } catch {  }
    }

    public static async fetchAllServers() {
        const request = await axios.get(`${backendUrl}/servers`);
        const data = request.data as any[];
        return data.map(server => {
            const { id, name, settings} = server;
            return new Server(id, name, settings);
        });
    }

    public static async fetchAllPlayers() {
        const request = await axios.get(`${backendUrl}/players`);
        const data = request.data as any[];
        return data.map(player => {
            const { id, firstName, lastName, username, stats } = player;
            return new Player(id, firstName, lastName, username, stats);
        });
    }

    public static async fetchAllTeams() {
        const request = await axios.get(`${backendUrl}/teams`);
        const data = request.data as any[];
        return await Promise.all(data.map(async (team) => {
            const {name, playerIds, stats} = team;
            const players = await Promise.all(playerIds.map((playerId: string) => PuggApi.fetchPlayer(playerId))) as Player[];
            return new Team(name, players, stats);
        }));
    }

    public static async fetchAllGames() {
        const request = await axios.get(`${backendUrl}/games`);
        const data = request.data as any[];
        return await Promise.all(data.map(async (game) => {
            const {id, teamOneName, teamTwoName, teamOneScore, teamTwoScore, eloChanges} = game;
            const teamOne = await PuggApi.fetchTeam(teamOneName);
            const teamTwo = await PuggApi.fetchTeam(teamTwoName);
            if (!teamOne) throw new NotFoundError(`Team Not Found\nName: ${teamOneName}`);
            if (!teamTwo) throw new NotFoundError(`Team Not Found\nName: ${teamTwoName}`);
            return new Game(id, teamOne, teamTwo, teamOneScore, teamTwoScore, eloChanges);
        }));
    }

    public static async fetchStudentTickets(studentId: string) {
        const request = await axios.get(`${backendUrl}/tickets/owner/${studentId}`);
        const data = request.data as any[];
        return data.map(ticket => {
            const { ownerId, channelId, reason, content, status } = ticket;
            return new Ticket(channelId, ownerId, reason, content, status);
        });
    }

    public static async fetchServerMenus(guildId: string) {
        const request = await axios.get(`${backendUrl}/menus/${guildId}`);
        const data = request.data as any[];
        return data.map(menu => {
            const { name, buttons } = menu;
            return new Menu(name, guildId, buttons);
        });
    }

    public static async createLftPlayer(player: LftPlayer) {
        await axios.post(`${backendUrl}/sheets/players`, player);
    }

    public static async createLfpTeam(team: LfpTeam) {
        await axios.post(`${backendUrl}/sheets/teams`, team);
    }

    public static async updateLftPlayer(player: LftPlayer) {
        await axios.put(`${backendUrl}/sheets/players`, player);
    }

    public static async updateLfpTeam(team: LfpTeam) {
        await axios.put(`${backendUrl}/sheets/teams`, team);
    }

    public static async upsertStudent(student: Student) {
        await axios.post(`${backendUrl}/students`, student);
    }

    public static async upsertPlayer(player: Player) {
        await axios.post(`${backendUrl}/players`, player);
    }

    public static async upsertTeam(team: Team) {
        await axios.post(`${backendUrl}/teams`, team.toJSON());
    }

    public static async upsertGame(game: Game) {
        await axios.post(`${backendUrl}/games`, game.toJSON());
    }

    public static async upsertTicket(ticket: Ticket) {
        await axios.post(`${backendUrl}/tickets`, ticket);
    }

    public static async upsertMenu(menu: Menu) {
        await axios.post(`${backendUrl}/menus`, menu);
    }

    public static async sendEmail(address: string, link: string) {
        await axios.post(`${backendUrl}/email`, { address: address, link: link });
    }

    public static async deleteMenu(menu: Menu) {
        await axios.delete(`${backendUrl}/menus/${menu.guildId}/${menu.name}`);
    }
}