'use strict';

const { ConfigProvider, ConfigParam } = require(`../config/index`);

/**
 * @property {string} PERMISSION_ANY Any user can perform such actions
 * @property {string} PERMISSION_MODERATOR Only moderators and admins can perform such actions
 * @property {string} PERMISSION_ADMIN Only administrators can perform such actions
 */
class SecurityHelper {

    /**
     * @param {string} userId
     * @param {string} requiredPermission
     */
    static hasAccess(userId, requiredPermission) {
        if (requiredPermission === SecurityHelper.PERMISSION_ANY) {
            return true;
        }
        const adminId = ConfigProvider.get(ConfigParam.ADMIN_ID);

        return userId === adminId;
    }

}

SecurityHelper.PERMISSION_ANY = `*`;
SecurityHelper.PERMISSION_MODERATOR = `moderator`;
SecurityHelper.PERMISSION_ADMIN = `admin`;

module.exports = SecurityHelper;
