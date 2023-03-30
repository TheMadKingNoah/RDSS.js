import { GuildMember } from "discord.js";

export default class RoleUtils {
    public static roles = {
        bot: "998008260839874651",
        trialModerator: "998008285372362792",
        moderator: "998008300698341416",
        seniorModerator: "998008318364758147",
        manager: "998008333103534130",
        gameChampion: "1028003452749631588",
        triviaMaster: "1038194520677957652",
        publicSectorPm: "1028067158506356736",
        eventWinner: "1028237313458831430"
    }

    public static temporaryWinnerRoles = [
        {
            id: this.roles.gameChampion,
            duration: 60 * 60 * 24 * 7 // 7 Days
        },
        {
            id: this.roles.triviaMaster,
            duration: 60 * 60 * 24 * 14 // 14 Days
        },
        {
            id: this.roles.eventWinner
        }
    ]

    public static hasRole(member: GuildMember, roleId: string): boolean {
        if (!member) return false;
        return member.roles.cache.has(roleId);
    }

    public static hasAnyRole(member: GuildMember, roles: string[]): boolean {
        if (!member) return false;
        return roles.some(roleId => this.hasRole(member, roleId));
    }
}
