import {Activity, EmbedBuilder, GuildBan, GuildMember, Message, TextChannel, User, VoiceState} from "discord.js";
import Properties from "./Properties";

export default class EmbedBuilds {
    public static getOnVoiceChannelJoinEmbed(newState: VoiceState): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(0x2ecc71)
            .setAuthor({
                name: `${newState.member?.user.tag} (${newState.member?.nickname})`,
                iconURL: newState.member?.displayAvatarURL(),
                url: newState.member?.displayAvatarURL()
            })
            .setDescription(`Member joined \`#${newState.channel?.name}\` (${newState.channel})`)
            .setFooter({text: `ID: ${newState.member?.id}`})
            .setTimestamp();
    }

    public static getOnVoiceChannelChangeEmbed(oldState: VoiceState, newState: VoiceState): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(0x7289da)
            .setAuthor({
                name: `${newState.member?.user.tag} (${newState.member?.nickname})`,
                iconURL: newState.member?.displayAvatarURL(),
                url: newState.member?.displayAvatarURL()
            })
            .setDescription("Member changed voice channel")
            .addFields(
                {
                    name: `Old Channel`,
                    value: `\`#${oldState.channel?.name}\` (${oldState.channel})`
                },
                {
                    name: `New Channel`,
                    value: `\`#${newState.channel?.name}\` (${newState.channel})`
                }
            )
            .setFooter({text: `ID: ${newState.member?.id}`})
            .setTimestamp();
    }

    public static getOnVoiceChannelLeaveEmbed(oldState: VoiceState): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(0xe74c3c)
            .setAuthor({
                name: `${oldState.member?.user.tag} (${oldState.member?.nickname})`,
                iconURL: oldState.member?.displayAvatarURL(),
                url: oldState.member?.displayAvatarURL()
            })
            .setDescription(`Member left \`#${oldState.channel?.name}\` (${oldState.channel})`)
            .setFooter({text: `ID: ${oldState.member?.id}`})
            .setTimestamp();
    }

    public static getUserInfoEmbed(user: User, member: GuildMember | null, isBanned: GuildBan | null): EmbedBuilder {
        const embed = new EmbedBuilder()

        const avatar = member ? member.displayAvatarURL() : user.displayAvatarURL();
        embed.setAuthor({
            name: (user.username + "#" + user.discriminator),
            iconURL: avatar,
            url: avatar
        })

        if (member) {
            if (member.nickname) {
                embed.setDescription(`This user is verified as \`${member.nickname}\``)
            } else {
                embed.setDescription(`This user is not verified!`)
                embed.setColor(0xFFFFFF)
            }

            let roles = "";

            member.roles.cache.sort((a, b) => b.position - a.position).forEach(element => {
                if (element.name != "@everyone") {
                    roles += `<@&${element.id}> `;
                }
            });

            if (roles.length === 0) {
                roles = "**None**"
            }

            embed.addFields([{
                name: "**Roles**",
                value: roles,
                inline: true
            }]);

            if (member.joinedTimestamp) {
                embed.addFields([{
                    name: "**Joined at**",
                    value: `<t:${Math.trunc(member.joinedTimestamp / 1000)}:F>\n (<t:${Math.trunc(member.joinedTimestamp / 1000)}:R>)`,
                    inline: true
                }]);
            }
        } else {
            if (isBanned !== null) {
                embed.setDescription(`This user has been banned from this Guild: \n ${isBanned.reason}`);
                embed.setColor(0xFF0000)
            } else {
                embed.setDescription("This user is not in this Guild!")
                embed.setColor(0xFF0000)
            }
        }

        embed.addFields([{
            name: "**Created at**",
            value: `<t:${Math.trunc(user.createdTimestamp / 1000)}:F>\n (<t:${Math.trunc(user.createdTimestamp / 1000)}:R>)`,
            inline: true
        }]);

        embed.setFooter({text: `ID: ${user.id}`});

        return embed;

    }

    public static getPendingAlertsEmbed(modAlertsChannel: TextChannel, intervalText: string): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(0x748bd8)
            .setTitle("Moderation Alerts")
            .setDescription(
                `There are pending moderation alerts in ${modAlertsChannel.toString()}`
                + `\n\nPlease remember to monitor moderation alerts frequently in order to avoid`
                + ` an accumulation of messages (and untreated reports) in the channel`
            )
            .setFooter({
                text: `This message appears whenever there are alerts that are over ${intervalText}`
            })
    }

    public static getBanNoReactionEmbed(message: Message<boolean>): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(0x748bd8)
            .setTitle("Ban Requests")
            .setFields([{name: 'Oldest Request', value: message.url}])
            .setDescription(
                `There are pending ban requests`
                + `\n\nPlease remember to monitor ban requests frequently in order to avoid`
                + ` an accumulation of requests in the channel`
                + `\n\n Bans without reaction:`
            )
            .setFooter({
                text: `This message appears whenever there are ban-requests that are over 6 hours`
            });
    }

    public static getSpotifyPartyInviteDeletedEmbed(activity: Activity, member: GuildMember) {
        let embed = new EmbedBuilder();

        embed.setTitle("Spotify Party invite deleted")
        if (activity.assets !== null && activity.assets.largeImage !== null) {
            let imageUrl = activity.assets.largeImage.replace('spotify:', '');
            embed.setThumbnail(`https://i.scdn.co/image/${imageUrl}`)
        }

        if (activity.state) embed.addFields([{
            name: '**Artist**',
            value: activity.state,
            inline: false
        }]);

        if (activity.details) embed.addFields([{
            name: '**Title**',
            value: activity.details,
            inline: false
        }]);

        embed.setFooter({text: `Spotify Party Invite by: ${member.id}`})

        return embed;
    }

    public static tipOfTheDayArray = [
        `When issuing a ban or requesting one, it's important to use the \`!whowas <roblox_username/discord_user_id>\` command (or search <#${Properties.channels.verifyLogs}>) to check for any possible alternate accounts that may need to be banned as well.\n\n> Fun fact! The upcoming verification bot will be able to automatically ban any Discord accounts linked to the Roblox account of the banned user.`,
        `Avoid using images stored in an external Discord server as evidence. Images are \"child entities\" of messages, so if the message or channel is deleted, the image will no longer be accessible, invalidating your evidence. Make sure to upload your images to <#${Properties.channels.commands}> so the bot can store them in <#${Properties.channels.mediaLogs}>.`,
        "As a moderator, it's important to protect your account from potential hackers. To ensure your safety, avoid clicking on any suspicious links or downloading files from other users. Be wary of any messages or requests that seem unusual or out of character. By taking these precautions, you can help keep your information and account secure.",
        "Are you a windows user? Did you know, you can copy and paste multiple texts at once just by pressing \`Windows Key + V\`? It's a nifty little trick that can save you time, especially when you're collecting multiple pieces of evidence. Give it a try!",
        "Remember, not everyone is familiar with Discord or how your server operates. If you encounter a user who seems to have multiple questions, don't assume that they're a troll right away. It's possible that they're simply new to the platform and need a little guidance. Take the time to explain how Discord and your server work, and try to do so in a friendly and inviting tone.\n\nNew users to a community may not be familiar with common terms or abbreviations that are everyday words for experienced members. For example, LFG (looking for groups) in gaming communities, GFX (graphic effects) in art servers, and so on. When communicating with an inexperienced or intimidated user, it's important to be patient and avoid using confusing terminology. Instead, guide them around the server without assuming they know the lingo. Remember, we all started somewhere!",
        "Maintaining a respectful and communicative relationship with your moderation team is essential for easy community moderation. Remember, teamwork makes the dream work!",
        "When it comes to moderation issues, don't hesitate to seek help from your fellow staff members. Getting a second opinion can provide a fresh perspective and reinforce your judgment. Taking everyone's perspective into account can help you solve even the most challenging problems and relieve some of the weight on your shoulders.\n\nRemember, you're part of a team and you don't have to handle everything alone. Working together can make a big difference in finding effective solutions and maintaining a healthy and supportive community. So don't be afraid to ask for help when you need it!",
        `If you have spare time, review the documents in <#${Properties.channels.info}> — you may have missed something initially!`,
        "Remember! It’s always important to check infractions when handling a user in the server.",
        "Welcome server members warmly! It's crucial to maintain professionalism throughout the server, no matter the issues that may arise. While you're not required to respond to DM inquiries, if you choose to do so, please ensure you provide accurate resources and assistance to the best of your ability.",
        "In the event a Roblox outage occurs, please **DO NOT** try and escalate this situation by acting upon it, but rather, consult with the management team in order for them to perform the appropriate server duties.",
        `If you're punishing a user based solely on image evidence (such as in DMs), it's important to include their user information (\`-i <user_id>\` or </user-info:1028062907478573106> in <#${Properties.channels.commands}>). This helps confirm the link between the evidence and the user being punished.`,
        "If you come across NSFW evidence, such as explicit language, it's okay to include it as evidence. However, any NSFW (or NSFL) imagery, including ASCII, should not be used as evidence.\n\nSharing inappropriate images or visual content can be against Discord's community guidelines, so it's important to handle this type of evidence carefully. Instead, focus on using text-based evidence to support your case.",
        "It's important to note that evidence from DMs of other users should not be used for moderation purposes. This is because messages from other users can be easily manipulated or even faked, which can lead to incorrect moderation decisions.\n\nTo ensure that you have accurate and reliable evidence, it's best to only use evidence from your own DMs. Remember, moderation decisions should always be based on facts, so it's crucial to have reliable evidence to support your actions.",
        "If you delete a message related to a moderation alert and can't handle it, tell your fellow moderators. Otherwise, they may assume you're dealing with it and take no further action. Communication is key to effective moderation.",
        "Avoid running moderation commands in public channels unless necessary (e.g. `;clean user <user_id>` has to be used in public), make sure moderation is kept within internal channels."
    ]

    public static getRandomTipOfTheDay() {
        let embed = new EmbedBuilder()
            .setColor(0x748bd8)
            .setTitle("Tip of the Day!")
            .setDescription(this.tipOfTheDayArray[Math.floor(Math.random() * this.tipOfTheDayArray.length)])
        return embed
    }
}