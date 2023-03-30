import Bot from "../Bot";
import RoleUtils from "./RoleUtils";

import { Collection, GuildMember, TextChannel, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";
import Properties from "./Properties";

export default class EventWinners {
    client: Bot;
    list: Collection<string, { timeout: NodeJS.Timeout, messageId: string, roleId: string }>

    constructor(client: Bot) {
        this.client = client;
        this.list = new Collection();
    }

    public add(member: GuildMember, messageId: string, roleId: string, duration?: number) {
        if (!duration) {
            const temporaryRoleData = RoleUtils.temporaryWinnerRoles.find(role => role.id === roleId)
            duration = temporaryRoleData?.duration || 604804; // Default: 7 days
        }

        this.list.set(`${member.id}_${roleId}`, {
            timeout: setTimeout(() => {
                member.roles.remove(roleId).catch(console.error);
                this.list.delete(member.id);
            }, duration * 1000),
            messageId,
            roleId
        });
    }

    public async check() {
        const guild = await this.client.guilds.fetch(Properties.guildId);
        const winnerQueue = await this.client.channels.fetch(Properties.channels.winnerQueue) as TextChannel;

        winnerQueue.messages.fetch({limit: 100})
            .then(async messages => {
                const remainingTimesList = new Map();

                for (const message of messages.values()) {
                    if (!message.author.bot) continue;
                    if (message.embeds.length === 0) continue;
                    if (!message.content) continue;

                    const roleId = message.content.replace(/\D/g, "");
                    if (roleId !== RoleUtils.roles.gameChampion && roleId !== RoleUtils.roles.triviaMaster) continue;

                    const currentTime = Math.trunc(Date.now() / 1000);
                    const remainingTime = message.embeds[0].fields[0].name?.match(/\d{10,}/g)?.map(Number)[0] as number - currentTime;

                    const winnerList = message.embeds[0].fields[0].value;
                    const winnerIds = winnerList.match(/(?<=`)\d{17,19}(?=`)/g) as string[];

                    setTimeout(() => {
                        const removedRoles = new ButtonBuilder()
                            .setLabel("Automatically Removed Roles")
                            .setStyle(ButtonStyle.Link)
                            .setURL("https://discord.com/")
                            .setDisabled(true)

                        const deleteMessage = new ButtonBuilder()
                            .setCustomId("deleteMessage")
                            .setLabel("Delete")
                            .setStyle(ButtonStyle.Danger)

                        const actionRow = new ActionRowBuilder().setComponents(removedRoles, deleteMessage);

                        message.edit({
                            embeds: message.embeds,
                            components: [actionRow as ActionRowBuilder<ButtonBuilder>]
                        })
                    }, remainingTime * 1000);

                    for await (const winnerId of winnerIds) {
                        const roleTimer = remainingTimesList.get(`${winnerId}_${roleId}`);
                        if (!roleTimer || roleTimer < remainingTime) remainingTimesList.set(`${winnerId}_${roleId}`, remainingTime);
                    }

                    for (let [winnerId, timeUntilRoleRemoval] of remainingTimesList) {
                        winnerId = winnerId.split("_")[0];

                        const winner = await guild.members.fetch(winnerId).catch(console.error);
                        if (!winner) continue;

                        if (timeUntilRoleRemoval <= 0) winner.roles.remove(roleId).catch(console.error);
                        else this.add(winner, message.id, roleId, timeUntilRoleRemoval);
                    }
                }
            })
            .catch(console.error);
    }

}
