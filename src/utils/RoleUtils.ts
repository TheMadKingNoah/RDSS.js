import { Collection, GuildMember, Role } from "discord.js";

export default class RoleUtils {

    public static ROLE_BOT_ID: string = "150075195971862528";

    public static ROLE_TRIAL_MODERATOR_ID: string = "218513797659230209";

    public static ROLE_MODERATOR_ID: string = "150093661231775744";

    public static ROLE_SENIOR_MODERATOR_ID: string = "234520161720205312";

    public static ROLE_MANAGER_ID: string = "150074509393788929";

    public static hasRole(member: GuildMember, roleId: string): boolean {

        if (member != null) {

            let role = member.roles.cache.get(roleId);

            if (role != null) {

                return true;

            }
        }

        return false;

    }

    public static hasAnyRole(member: GuildMember | null, roles: string[]): boolean {
        let hasRole = false;

        if (member != null) {


            roles.forEach(roleId => {
                if (hasRole != true) {


                    if (this.hasRole(member, roleId) == true) {
                 
                        hasRole = true;

                    }
                }
            })
        }

        return hasRole;
    }
}