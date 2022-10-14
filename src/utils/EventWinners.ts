import Bot from "../Bot";
import RoleUtils from "./RoleUtils";

import {Collection, GuildMember, Message, TextChannel} from "discord.js";
import Properties from "./Properties";

export default class EventWinners {
    client: Bot;
    list: Collection<string, { timeout: NodeJS.Timeout, messageId: string, roleId: string }>

    constructor(client: Bot) {
        this.client = client;
        this.list = new Collection();
    }

    public add(member: GuildMember, message: Message, roleId: string, duration = Properties.winnerRoleDuration) {
        this.list.set(member.id, {
            timeout: setTimeout(() => {
                member.roles.remove(roleId).catch(console.error);
                this.list.delete(member.id);
            }, duration * 1000),
            messageId: message.id,
            roleId
        });

        setTimeout(() => {
            message.delete().catch(e => e);
        }, duration * 1000);
    }

    public async check() {
        const guild = await this.client.guilds.fetch(Properties.guildId);
        const winnerQueue = await this.client.channels.fetch(Properties.channels.winnerQueue) as TextChannel;

        winnerQueue.messages.fetch({ limit: 100 })
            .then(async messages => {
                const remainingTimes: { [key: string]: number } = {};

                for (const message of messages.values()) {
                    if (!message.author.bot) continue;
                    if (message.embeds.length === 0) continue;
                    if (!message.content) continue;

                    const roleId = message.content.replace(/\D/g, "");
                    if (roleId !== RoleUtils.roles.gameChampion) continue;

                    const currentTime = Math.trunc(Date.now() / 1000);
                    const remainingTime = message.embeds[0].fields[0].name?.match(/\d{10,}/g)?.map(Number)[0] as number - currentTime;

                    const winnerList = message.embeds[0].fields[0].value;
                    const winnerIds = winnerList.match(/(?<=`)\d{17,19}(?=`)/g) as string[];

                    setTimeout(() => {
                        message.delete().catch(console.error);
                    }, remainingTime * 1000);

                    for await (const winnerId of winnerIds) {
                        if (!remainingTimes[winnerId] || remainingTimes[winnerId] < remainingTime) {
                            remainingTimes[winnerId] = remainingTime;
                        }
                    }

                    for (const [winnerId, remainingTime] of Object.entries(remainingTimes)) {
                        const winner = await guild.members.fetch(winnerId).catch(console.error);
                        if (!winner) continue;

                        if (remainingTime <= 0) {
                            winner.roles.remove(roleId).catch(console.error);
                            continue;
                        }

                        winner.roles.add(roleId)
                            .then(() => { this.add(winner, message, roleId, remainingTime * 1000) })
                            .catch(console.error);
                    }
                }
            })
            .catch(console.error);
    }

}