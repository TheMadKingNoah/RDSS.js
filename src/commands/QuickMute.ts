import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
        .setName("quickmute")
        .setDescription("QuickMutes the person"),
    async excecute(interaction: { reply: (arg0: string) => void; }){
        interaction.reply("quick")
    }
}