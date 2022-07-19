import Bot from "../Bot";

module.exports = {
      name: "ready",
      once: true,
      async execute(client: Bot) {
            console.log(`${client.user?.tag} is online!`);
      }
}