import axios from "axios";
import {backendUrl} from "../index";
import {Menu} from "../menu";
import {Student} from "../student";
import {Ticket} from "../ticket";
import {Server} from "../server";
import {Email} from "../email";
import {LftPlayer} from "../lft.player";
import {LfpTeam} from "../lfp.team";

export class PuggApi {
    public static async fetchStudent(studentId: string) {
        try {
            const request = await axios.get(`${backendUrl}/students/${studentId}`);
            const { id, username, email, verified } = request.data;
            return new Student(id, username, email, verified);
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
            const { buttons } = request.data;
            return new Menu(name, guildId, buttons);
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

    public static async upsertTicket(ticket: Ticket) {
        await axios.post(`${backendUrl}/tickets`, ticket);
    }

    public static async upsertMenu(menu: Menu) {
        await axios.post(`${backendUrl}/menus`, menu);
    }

    public static async sendEmail(email: Email) {
        await axios.post(`${backendUrl}/email`, email);
    }

    public static async deleteMenu(menu: Menu) {
        await axios.delete(`${backendUrl}/menus/${menu.guildId}/${menu.name}`);
    }
}