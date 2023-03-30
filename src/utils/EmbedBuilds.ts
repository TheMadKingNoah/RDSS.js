import { Activity, Guild, GuildBan, GuildMember, EmbedBuilder, Role, TextChannel, User, VoiceState, Message, Collection  } from "discord.js";
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
            .setFooter({ text:`ID: ${newState.member?.id}` })
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
                    name:`Old Channel`,
                    value:`\`#${oldState.channel?.name}\` (${oldState.channel})`
                },
                {
                    name:`New Channel`,
                    value:`\`#${newState.channel?.name}\` (${newState.channel})`
                }
            )
            .setFooter({ text:`ID: ${newState.member?.id}` })
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
            .setFooter({ text:`ID: ${oldState.member?.id}` })
            .setTimestamp();
    }

    public static getUserInfoEmbed(user: User, member:GuildMember|null, isBanned:GuildBan|null): EmbedBuilder {
        const embed = new EmbedBuilder()

        const avatar = member ? member.displayAvatarURL() : user.displayAvatarURL();
        embed.setAuthor({
            name: (user.username + "#" + user.discriminator),
            iconURL: avatar,
            url: avatar
        })

        if(member){
            if(member.nickname){
                embed.setDescription(`This user is verified as \`${member.nickname}\``)
            } else {
                embed.setDescription(`This user is not verified!`)
                embed.setColor(0xFFFFFF)
            }

            let roles = "";

            member.roles.cache.sort((a,b)=>b.position-a.position).forEach(element => {
                if (element.name != "@everyone"){
                    roles += `<@&${element.id}> `;
                }
            });

            if (roles.length === 0){
                roles = "**None**"
            }

            embed.addFields([{
                name: "**Roles**",
                value: roles,
                inline: true
            }]);

            if(member.joinedTimestamp){
                embed.addFields([{
                    name: "**Joined at**",
                    value: `<t:${Math.trunc(member.joinedTimestamp / 1000)}:F>\n (<t:${Math.trunc(member.joinedTimestamp / 1000)}:R>)`,
                    inline: true
                }]);
            }
        } else {
            if(isBanned !== null){
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

        embed.setFooter({text:`ID: ${user.id}`});

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
            .setFields([{ name: 'Oldest Request', value: message.url }])
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

    public static getSpotifyPartyInviteDeletedEmbed(activity: Activity, member:GuildMember){
        let embed = new EmbedBuilder();

        embed.setTitle("Spotify Party invite deleted")
        if(activity.assets !== null && activity.assets.largeImage !== null) {
            let imageUrl = activity.assets.largeImage.replace('spotify:','');
            embed.setThumbnail(`https://i.scdn.co/image/${imageUrl}`)
        }

        if(activity.state) embed.addFields([{
            name: '**Artist**',
            value: activity.state,
            inline: false
        }]);

        if(activity.details) embed.addFields([{
            name: '**Title**',
            value: activity.details,
            inline: false
        }]);

        embed.setFooter({text:`Spotify Party Invite by: ${member.id}`})

        return embed;
    }

    public static tipOfTheDayArray = [
        "When banning a user or requesting a ban, make sure to run the \`!whowas\` command to see if the user has any alternate accounts!\n\n> Fun fact: The upcoming verification bot will automatically ban all associated Discord accounts!",
        "Do not use images sent in an external discord server as evidence.\n\nImages are a child entity of a message, meaning that if the message no longer exists, the image will no longer be accessible, therefore the infraction evidence can no longer be viewed.",
        "Do not click any suspicious links and/or download files from other users. As a moderator, you are a vulnerable target for hackers, meaning you have to be extra cautious when clicking/downloading anything.",
        "Are you a Windows user? Did you know you can paste multiple items from your clipboard history with the `Windows + V` shortcut?\n\nThis can be useful when gathering multiple pieces of evidence",
        "You should never assume that everyone knows how Discord works or how your server operates. If you come across a case where a user asks seemingly “ridiculous”, questions, don’t immediately assume they are a troll. Instead, explain the functionality of both Discord and the server you're moderating, while keeping a friendly and inviting tone, and avoiding any lingo/abbreviations to reduce any potential confusion.",
        "Teamwork makes the dream work. It is important to maintain a healthy, communicative, and respectful relationship with your moderation team to ensure trouble-free moderation of your community.",
        "When dealing with moderation issues, seeking help from fellow staff members always seems like the optimal assistance. Getting another person’s opinion on a topic may help you to see things from a different angle, or reinforce your judgment. Taking everyone’s perspective into account can help you master even the most difficult problems. Letting someone know about your concerns can take the weight off your shoulders. You are part of a team; you do not have to act alone.",
     ]

    public static getRandomTipOfTheDay(){
        let embed = new EmbedBuilder()
        .setColor(0x748bd8)
        .setTitle("Tip of the Day!")
        .setDescription(this.tipOfTheDayArray[Math.floor(Math.random()*this.tipOfTheDayArray.length)])
        return embed
    }

  

 }
