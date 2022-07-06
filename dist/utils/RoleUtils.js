"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoleUtils {
    static ROLE_BOT_ID = "150075195971862528";
    static ROLE_TRIAL_MODERATOR_ID = "218513797659230209";
    static ROLE_MODERATOR_ID = "150093661231775744";
    static ROLE_SENIOR_MODERATOR_ID = "234520161720205312";
    static ROLE_MANAGER_ID = "150074509393788929";
    static hasRole(member, roleId) {
        if (member != null) {
            let role = member.roles.cache.get(roleId);
            if (role != null) {
                return true;
            }
        }
        return false;
    }
    static hasAnyRole(member, roles) {
        let hasRole = false;
        if (member != null) {
            roles.forEach(roleId => {
                if (hasRole != true) {
                    if (this.hasRole(member, roleId) == true) {
                        hasRole = true;
                    }
                }
            });
        }
        return hasRole;
    }
}
exports.default = RoleUtils;
