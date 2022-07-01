import { Client } from "discord.js";

export default (client: Client): void => {
   // make sure it's an async function
client.on('messageReactionAdd', async (reaction_orig, user) => {
    // fetch the message if it's not cached
    const message = !reaction_orig.message.author
      ? await reaction_orig.message.fetch()
      : reaction_orig.message;
  
    if (message.author.id === user.id) {
      // the reaction is coming from the same user who posted the message
      return;
    }
    
    // the reaction is coming from a different user
    manageBoard(reaction_orig);
  });
};