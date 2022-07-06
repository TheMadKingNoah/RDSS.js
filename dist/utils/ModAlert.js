"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const Properties_1 = tslib_1.__importDefault(require("./Properties"));
const RoleUtils_1 = tslib_1.__importDefault(require("./RoleUtils"));
class ModAlert {
    static existingModAlerts = new Map();
    static lastModAlert = new Date();
    static createModAlert(message, user) {
        if (((new Date().getTime() - this.lastModAlert.getTime()) / 1000) > Properties_1.default.ALERT_MODS_COOLDOWN) {
            this.lastModAlert = new Date();
            let messageContent = message.content;
            if (message.content.length > 200) {
                messageContent = message.content.substring(0, 201) + "...";
            }
            let hasContent = "";
            let hasFile = "";
            let potentialWallPost = "";
            let contentTypes = [];
            if (message.attachments.size > 0) {
                message.attachments.forEach((element) => {
                    if (!contentTypes.includes(element.contentType)) {
                        contentTypes.push(element.contentType);
                    }
                });
                hasFile = "\n:warning: **Warning:** This message contains attachments! :warning: (`" + contentTypes + "`)";
            }
            if ((messageContent.match(/\n/g) || '').length > 10) {
                potentialWallPost = "\n:warning: **Warning:** Potential wall-post! :warning: (`" + (messageContent.match(/\n/g) || '').length + " lines detected!`)";
            }
            const row = new discord_js_1.MessageActionRow()
                .addComponents(new discord_js_1.MessageButton()
                .setCustomId('OK')
                .setLabel('OK')
                .setStyle('SUCCESS'));
            if (messageContent.length > 0) {
                row.addComponents(new discord_js_1.MessageButton()
                    .setCustomId("qm30")
                    .setLabel("30m")
                    .setStyle("PRIMARY"), new discord_js_1.MessageButton()
                    .setCustomId("qm60")
                    .setLabel("60m")
                    .setStyle("DANGER"));
                const content = messageContent.replace(/\r?\n|\r/g, " ");
                hasContent = `\n**Preview**:` + `\n> ${content}`;
            }
            row.addComponents(new discord_js_1.MessageButton()
                .setCustomId("Infractions")
                .setLabel("Infractions")
                .setStyle("SECONDARY"));
            const channel = message.client.channels.cache.get(Properties_1.default.ALERT_CHANNEL_ID);
            if (channel != null) {
                const alertEmoji = channel.client.emojis.cache.get(Properties_1.default.ALERT_EMOJI_ID);
                const newAlert = channel.send({
                    content: `${alertEmoji} <@&${RoleUtils_1.default.ROLE_MODERATOR_ID}> <@&${RoleUtils_1.default.ROLE_TRIAL_MODERATOR_ID}>`
                        + `\n**Reported by:** <@${user.id}> (ID: \`${user.id}\`)`
                        + `\n**Against:** <@${message.author.id}> (ID: \`${message.author.id}\`)`
                        + `\n <${message.url}>/`
                        + hasContent
                        + potentialWallPost
                        + hasFile
                        + `\n(Access the jump URL to take action. Once finished, react to this message with one of the buttons)`,
                    components: [row]
                });
                this.existingModAlerts.set(message.id, message.content);
            }
        }
    }
    static deleteModAlert(messageId, modAlertMessage) {
        if (this.existingModAlerts.has(messageId)) {
            this.existingModAlerts.delete(messageId);
        }
        modAlertMessage.delete().catch(e => { });
    }
    static approveBanRequest(message, commandChannel, moderator) {
        try {
            let banRequestMessageContent = message.content.replaceAll("(?i)(?!_(\\w|\\d|-)+\\.(png|jpe?g|gifv?|webm|wav|mp[34]|ogg|mov|txt)+)[\\*\\|\\~\\`\\_\\>]", "").replaceAll("\\s+", " ").split(" ");
            let banRequestString = `(approved by ${moderator.user.tag} (${moderator.id})) `;
            for (let i = 2; i < banRequestMessageContent.length; i++) {
                banRequestString += banRequestMessageContent[i] + " ";
            }
            const evidence = banRequestString.toString();
            const userToBan = banRequestMessageContent[1];
            if (banRequestMessageContent[0].toLowerCase() === ";ban"
                || banRequestMessageContent[0].toLowerCase() === ";forceban") {
                commandChannel.send(`;ban ${userToBan} ${evidence}`);
            }
            else {
                commandChannel.send(`${moderator.id} the ban you tried to invoke was not correctly formatted. Please run the command manually`);
            }
        }
        catch (e) {
            commandChannel.send(`${moderator.id} the ban you tried to invoke was not correctly formatted. Please run the command manually`);
        }
    }
    static rejectBanRequest(message, commandChannel, moderator) {
        try {
            let banRequestMessageContent = message.content.replaceAll("(?i)(?!_(\\w|\\d|-)+\\.(png|jpe?g|gifv?|webm|wav|mp[34]|ogg|mov|txt)+)[\\*\\|\\~\\`\\_\\>]", "").replaceAll("\\s+", " ").split(" ");
            let reportedUserId = banRequestMessageContent[1];
            let rejectionNoticeString = `<@${message.author.id}> your ban request against <@${reportedUserId}> (${reportedUserId}) has been rejected by <@${moderator.id}> and the user has been unmuted. \n\n Your ban request evidence: `;
            for (let i = 2; i < banRequestMessageContent.length; i++) {
                rejectionNoticeString += banRequestMessageContent[i] + " ";
            }
            commandChannel.send(`;unmute ${reportedUserId}`);
            commandChannel.send(rejectionNoticeString);
        }
        catch (e) {
            commandChannel.send(`${moderator.id} the ban you tried to invoke was not correctly formatted. Please run the command manually`);
        }
    }
}
exports.default = ModAlert;
