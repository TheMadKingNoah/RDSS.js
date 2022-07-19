import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
        .setName("quickmute")
        .setDescription("QuickMutes the user"),
    async excecute(interaction: { reply: (arg0: string) => void; }){
    
    }
}