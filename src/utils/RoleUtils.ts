import { GuildMember } from "discord.js";

export default class RoleUtils {
    public static roles = {
        bot: "722582966261383188",
        trialModerator: "926583545856675860",
        moderator: "921934689550368773",
        seniorModerator: "921934871314718810",
        manager: "926583726719250483"
    }

    public static hasRole(member: GuildMember, roleId: string): boolean {
        if (!member) return false;
        return member.roles.cache.has(roleId);
    }

    public static hasAnyRole(member: GuildMember, roles: string[]): boolean {
        if (!member) return false;
        return roles.some(roleId => this.hasRole(member, roleId));
    }
}
