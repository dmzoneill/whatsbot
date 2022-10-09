const MessageStrategy = require("../MessageStrategy.js")


// ####################################
// harass 
// ####################################

class Harass extends MessageStrategy {
  static dummy = MessageStrategy.derived.add(this.name);
  static cunts = []
  static sluts = []
  static cronjob = null;
  static self = null;

  constructor() {
    super('Harass', {
      'enabled': true
    });
    this.setup_cron();
  }

  setup_cron() {
    if (Harass.cronjob != null) {
      Harass.cronjob.stop();
    }

    Harass.cronjob = new CronJob(
      '0 */2 * * * *',
      function () {
        for (let v = 0; v < Harass.cunts.length; v++) {
          if (MessageStrategy.client) {
            let slut = Harass.cunts[v];
            if (slut != undefined) {
              let parts = slut.trim().indexOf(" ") ? slut.trim().split(" ") : [slut.trim()];
              MessageStrategy.client.sendText(parts[0], Harass.self.get_joke());
            }
          }
        }
      },
      null,
      true,
      'Europe/Dublin'
    );

    Harass.cronjob.start();
  }

  provides() {
    Harass.self = this;

    return {
      help: 'Harasses individual(s) with your mamma jokes',
      provides: {
        'Harass': {
          test: function (message) {
            return message.body.toLowerCase() === 'harass';
          },
          access: function (message, strategy, action) {
            MessageStrategy.register(strategy.constructor.name + action.name);
            return true;
          },
          help: function () {
            return 'To do';
          },
          action: Harass.self.HarassSluts,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state['Harass']['enabled'];
          }
        },
        'HarassPerson': {
          test: function (message) {
            return message.body.match(/^harass ([0-9]{1,3})$/i);
          },
          access: function (message, strategy, action) {
            MessageStrategy.register(strategy.constructor.name + action.name);
            return true;
          },
          help: function () {
            return 'To do';
          },
          action: Harass.self.Harass,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state['Harass']['enabled'];
          }
        },
        'StopHarass': {
          test: function (message) {
            return message.body.match(/^harass stop ([0-9a-z]+)$/i);
          },
          access: function (message, strategy, action) {
            MessageStrategy.register(strategy.constructor.name + action.name);
            return true;
          },
          help: function () {
            return 'To do';
          },
          action: Harass.self.StopHarass,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state['Harass']['enabled'];
          }
        },
        'ListHarass': {
          test: function (message) {
            return message.body.match(/^harass list$/i);
          },
          access: function (message, strategy, action) {
            MessageStrategy.register(strategy.constructor.name + action.name);
            return true;
          },
          help: function () {
            return 'To do';
          },
          action: Harass.self.ListHarass,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state['Harass']['enabled'];
          }
        }
      },
      access: function (message, strategy) {
        MessageStrategy.register(strategy.constructor.name);
        return true;
      },
      enabled: function () {
        return MessageStrategy.state['Harass']['enabled'];
      }
    }
  }

  get_joke() {
    var joke = request('GET', 'https://api.yomomma.info/', {
      headers: {
        'Accept': 'text/plain'
      }
    });
    let body = joke.getBody().toString();
    return body.split("\"")[3]
  }

  async get_sluts() {
    try {
      Harass.sluts = []
      let all_chats = await MessageStrategy.client.getAllChats();

      for (let h = 0; h < all_chats.length; h++) {
        let name = "name" in all_chats[h].contact ? all_chats[h].contact.name : "";
        let entry = all_chats[h].contact.id + " " + name;

        if (name.indexOf("Richel") > -1) continue;
        if (Harass.sluts.includes(entry.trim())) continue;

        Harass.sluts.push(entry.trim());
      }

      let all_groups = await MessageStrategy.client.getAllGroups();

      for (let h = 0; h < all_groups.length; h++) {
        let members = await MessageStrategy.client.getGroupMembers(all_groups[h].id);
        for (let k = 0; k < members.length; k++) {
          let name = "name" in members[k] ? members[k].name : "";
          let entry = members[k].id + " " + name;

          if (name.indexOf("Richel") > -1) continue;
          if (Harass.sluts.includes(entry.trim())) continue;

          Harass.sluts.push(entry.trim());
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  async get_known_sluts(message) {
    try {
      await Harass.self.get_sluts();
      MessageStrategy.typing(message);
      let msg = "";
      for (let y = 0; y < Harass.sluts.length; y++) {
        msg += (y + 1).toString() + " :" + Harass.sluts[y] + "\n";
      }
      MessageStrategy.client.sendText(message.from, msg);
    } catch (err) {
      console.log(err);
    }
  }

  async harass(message) {
    try {
      let cunt = message.body.split(" ");
      let the_cunt = parseInt(cunt[1].trim()) - 1;
      if (Harass.sluts.includes(the_cunt)) {
        return;
      }
      Harass.cunts.push(Harass.sluts[the_cunt]);
    } catch (err) {
      console.log(err);
    }
  }

  async stopharass(message) {
    try {
      let cunt = message.body.split(" ");
      let the_cunt = cunt[2].trim();
      for (let y = 0; y < Harass.cunts.length; y++) {
        if (!Harass.cunts[y]) continue;

        if (Harass.cunts[y].toLowerCase().indexOf(the_cunt) > -1) {
          delete Harass.cunts[y];
          y = y - 1;
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  async listharass(message) {
    try {
      MessageStrategy.typing(message);
      MessageStrategy.client.sendText(message.from, Harass.cunts.join("\n"));
    } catch (err) {
      console.log(err);
    }
  }

  HarassSluts(message) {
    Harass.self.get_known_sluts(message);
  }

  Harass(message) {
    Harass.self.harass(message);
  }

  StopHarass(message) {
    Harass.self.stopharass(message);
  }

  ListHarass(message) {
    Harass.self.listharass(message);
  }
}


module.exports = {
  MessageStrategy: Harass
}