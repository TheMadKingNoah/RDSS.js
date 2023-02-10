import Bot from "src/Bot";
import Properties from "./Properties";
import RoleUtils from "./RoleUtils";
import EmbedBuilds from "./EmbedBuilds";
import ModAlert from "./ModAlert";
import { TextChannel } from "discord.js";

interface AlertNotice {
    name: string;
    minTimeToPostNotice: number;
    updateInterval: number;
    intervalText: string;
    alertContent: string;
    alertChannelId: string;
}

export default class AlertMaintainer {
    static updateInterval = 3600e3; // (ms) Time difference between alert checks
    static minTimeToDelete = 86400e3; // (ms) Minimum time needed for untreated reports to be deleted

    client: Bot;

    constructor(client: Bot) {
        this.client = client;
    };

    public async initiate() {
        // Moderator alerts
        this.register({
            name: "ModeratorAlert",
            minTimeToPostNotice: 7200e3,
            updateInterval: 3600e3,
            intervalText: "2 hours old",
            alertContent: "@here Pending moderation alerts",
            alertChannelId: Properties.channels.moderators
        });

        // Trial moderator alerts
//        this.register({
//            name: "TrialModeratorAlert",
//            minTimeToPostNotice: 3600e3,
//            updateInterval: 1800e3,
//            intervalText: "an hour old",
//            alertContent: `<@&${RoleUtils.roles.trialModerator}> Pending moderation alerts`,
//            alertChannelId: Properties.channels.trialModerators
//        });

        this.checkModAlerts();
        setInterval(this.checkModAlerts.bind(this), AlertMaintainer.updateInterval);
        this.checkBanRequests();
        setInterval(this.checkBanRequests.bind(this), AlertMaintainer.updateInterval);
        this.sendTipOfTheDay();
        setInterval(this.sendTipOfTheDay.bind(this), 86400e3);
    };

    public async register(notice: AlertNotice) {
        this.checkAlertsForNotice(notice);
        setInterval(this.checkAlertsForNotice.bind(this), notice.updateInterval, notice);
    };

    public async checkModAlerts() {
        console.log(`<AlertMaintainer> Checking alerts at ${new Date().toTimeString()}`);
        const modAlertsChannel = this.client.channels.cache.get(Properties.channels.alerts) as TextChannel;
        if (!modAlertsChannel) return;

        this.fetchMessages(modAlertsChannel).then(messages => {
            const alertsToDelete = messages.filter(
                (alertMessage) => Date.now() - alertMessage.createdTimestamp >= AlertMaintainer.minTimeToDelete
            );

            // Remove cached alerts from map (if any)
            alertsToDelete.forEach(alertMessage => {
                ModAlert.deleteModAlert(alertMessage.id, null, null)
            });

            // Delete very old reports
            modAlertsChannel.bulkDelete(alertsToDelete, true);
        }).catch(console.error);
    };

    public async checkAlertsForNotice(notice: AlertNotice) {
        console.log(`<AlertMaintainer> Checking for ${notice.name} at ${new Date().toTimeString()}`);
        const hasUntreatedReports = await this.hasUntreatedReports(notice.minTimeToPostNotice);
        if (!hasUntreatedReports) return;

        const targetChannel = this.client.channels.cache.get(notice.alertChannelId) as TextChannel;
        const alertChannel = this.client.channels.cache.get(Properties.channels.alerts) as TextChannel;
        if (!targetChannel) return;

        const embed = EmbedBuilds.getPendingAlertsEmbed(alertChannel, notice.intervalText);
        targetChannel.send({
            content: notice.alertContent,
            embeds: [embed]
        });
    };

    public async hasUntreatedReports(minTimeToPostNotice: number) {
        const messages = await this.fetchMessages(null);
        return messages.some(
            (alertMessage) => {
                const timeExisted = (Date.now() - alertMessage.createdTimestamp);
                return (
                    timeExisted >= minTimeToPostNotice
                    && timeExisted < AlertMaintainer.minTimeToDelete
                );
            }
        );
    };

    public async checkBanRequests() {
        console.log(`<AlertMaintainer> Checking ban-requests at ${new Date().toTimeString()}`);
        const banRequestChannel = this.client.channels.cache.get(Properties.channels.banRequestsQueue) as TextChannel;
        if (!banRequestChannel) return;

        this.fetchMessages(banRequestChannel).then(messages => {
            const banRequestsOlderThan2Hours = messages.filter(
                (alertMessage) => Date.now() - alertMessage.createdTimestamp >= 21600e3
            );

            let bansWitouthReaction = banRequestsOlderThan2Hours.filter(message => message.reactions.cache.size == 0)

            const seniorChannel = this.client.channels.cache.get(Properties.channels.seniorModerators) as TextChannel;
            if (!seniorChannel) return;

            if(bansWitouthReaction.size > 0) {
                const embed = EmbedBuilds.getBansNoReactionEmbed(bansWitouthReaction);
                seniorChannel.send({
                    content: '@here Pending ban requests',
                    embeds: [embed]
                });
            }

        }).catch(console.error);
    };

    public async sendTipOfTheDay() {
        const modChannel = this.client.channels.cache.get(Properties.channels.moderators) as TextChannel;
        if (!modChannel) return;

        const embed = EmbedBuilds.getRandomTipOfTheDay();

        modChannel.send({
            content: '@everyone',
            embeds: [embed]
        });
    }

    public async fetchMessages(channel: TextChannel | null) {
        channel = (channel != null) ? channel : this.client.channels.cache.get(Properties.channels.alerts) as TextChannel;
        if (!channel) return Promise.reject(`<AlertMaintainer.fetchMessages> Could not get "alerts" channel`);
        return channel.messages.fetch({ limit: 100 });
    };
};
