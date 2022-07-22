import Bot from "../../../Bot";

export default class Button {
      client: Bot;
      name: string;

      constructor(client: Bot, data: any) {
            this.client = client;
            this.name = data.name;

            try {
                  this.client.buttons.register(this);
            } catch (err) {
                  console.error(err);
                  return;
            }
      }
}