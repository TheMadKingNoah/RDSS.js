import { GuildMember } from "discord.js";

export default class RoleUtils {
    public static roles = {
        bot: "150075195971862528",
        trialModerator: "218513797659230209",
        moderator: "150093661231775744",
        seniorModerator: "234520161720205312",
        manager: "150074509393788929",
        gameChampion: "933135286022590505",
        triviaMaster: "919245464455495690",
        publicSectorPm: "922614306720317470",
        eventWinner: "945294961987973121"
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