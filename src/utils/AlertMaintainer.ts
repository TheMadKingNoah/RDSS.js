import Bot from "src/Bot";
import Properties from "./Properties";
import EmbedBuilds from "./EmbedBuilds";
import ModAlert from "./ModAlert";
import { TextChannel } from "discord.js";

export default class AlertMaintainer {
    public static minTimeToPostNotice = 7200e3; // (ms) Minimum time needed for staff to be pinged with an alert regarding untreated reports
    public static updateInterval = 3600e3; // (ms) Time difference between alert checks
    public static minTimeToDelete = 86400e3; // (ms) Minimum time needed for untreated reports to be deleted

    client: Bot;

    constructor(client: Bot) {
        this.client = client;
    }

    public async initiate() {
        this.checkModAlerts();
        setInterval(this.checkModAlerts.bind(this), AlertMaintainer.updateInterval);
    };

    public async checkModAlerts() {
        console.log(`<AlertMaintainer> Checking alerts at ${new Date().toTimeString()}`);

        const modAlertsChannel = this.client.channels.cache.get(Properties.channels.alerts) as TextChannel;
        const moderatorsChannel = this.client.channels.cache.get(Properties.channels.moderators) as TextChannel;

        if (!modAlertsChannel || !moderatorsChannel) return;

        modAlertsChannel.messages.fetch({ limit: 100 }).then(messages => {
            const alertsToDelete = messages.filter(
                (alertMessage) => Date.now() - alertMessage.createdTimestamp >= AlertMaintainer.minTimeToDelete
            )

            const untreatedReportExists = messages.some(
                (alertMessage) => {
                    const timeExisted = (Date.now() - alertMessage.createdTimestamp);
                    return (
                        timeExisted >= AlertMaintainer.minTimeToPostNotice 
                        && timeExisted < AlertMaintainer.minTimeToDelete
                    )
                }
            )

            // Remove cached alerts from map (if any)
            alertsToDelete.forEach(alertMessage => {
                ModAlert.deleteModAlert(alertMessage.id, null, null)
            })

            // Delete very old reports
            modAlertsChannel.bulkDelete(alertsToDelete, true);

            if (untreatedReportExists) {
                // Alert staff in "moderators" channel
                const embed = EmbedBuilds.getPendingAlertsEmbed(modAlertsChannel);
                moderatorsChannel.send({
                    content: "@here Pending moderation alerts",
                    embeds: [embed]
                });
            }
        });
    };
};
