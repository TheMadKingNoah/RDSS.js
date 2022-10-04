import Bot from "../../../Bot";

export default class Button {
      client: Bot;
      name: string;

      constructor(client: Bot, data: any) {
            this.client = client;
            this.name = data.name;

            this.client.buttons.register(this).catch(console.error);
      }
}