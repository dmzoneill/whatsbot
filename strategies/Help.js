const MessageStrategy = require("../MessageStrategy.js")

// ####################################
// Help
// ####################################

class Help extends MessageStrategy {
  static dummy = MessageStrategy.derived.add(this.name);
  static self = null;

  constructor() {
    super('Help', {
      'enabled': true
    });
  }

  provides() {
    Help.self = this;

    return {
      help: 'Welcome to help!',
      provides: {
        'help': {
          test: function (message) {
            return message.body.toLowerCase() === "help";
          },
          access: function (message, strategy, action) {
            return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name + action.name);
          },
          help: function () {
            return 'Shows you the help menu';
          },
          action: function HelpMenu(message) {
            Help.self.HelpMenu(message);
            return true;
          },
          interactive: true,
          enabled: function () {
            return MessageStrategy.state['Help']['enabled'];
          }
        },
        'help x': {
          test: function (message) {
            return message.body.toLowerCase().startsWith("help");
          },
          access: function (message, strategy, action) {
            return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name + action.name);
          },
          help: function () {
            return 'Shows the help for a given feature';
          },
          action: function HelpFeature(message) {
            Help.self.HelpFeature(message);
            return true;
          },
          interactive: true,
          enabled: function () {
            return MessageStrategy.state['Help']['enabled'];
          }
        }
      },
      access: function (message, strategy) {
        return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name);
      },
      enabled: function () {
        return MessageStrategy.state['Help']['enabled'];
      }
    }
  }

  HelpMenu(message) {
    MessageStrategy.typing(message);
    let help = "";
    let cnt = 0;
    Object.keys(MessageStrategy.strategies).sort().forEach(key => {
      help += "*" + key + "*\n";
      help += "  | - help " + key.toLowerCase() + "\n";

      let actions = MessageStrategy.strategies[key].provides().provides;
      let keys = Object.keys(actions);
      for (let y = 0; y < keys.length; y++) {
        if (actions[keys[y]].interactive) {
          if (actions[keys[y]].access(message, MessageStrategy.strategies[key], actions[keys[y]].action)) {
            help += "  | - " + keys[y] + "\n";
          }
        }
      }

      help += "";
      cnt += 1;
      if (cnt % 6 == 0) {
        MessageStrategy.client.sendText(message.from, help.trim());
        help = "";
      }
    });
    if (help != "") {
      MessageStrategy.client.sendText(message.from, help.trim());
    }
    return true;
  }

  HelpFeature(message) {
    MessageStrategy.typing(message);
    let parts = message.body.split(" ");
    let feature = parts[1].toLowerCase();

    Object.keys(MessageStrategy.strategies).forEach(key => {
      if (key.toLowerCase() == feature) {
        let full_help = MessageStrategy.strategies[key].provides().help + "\n\n";

        let actions = MessageStrategy.strategies[key].provides().provides;
        let keys = Object.keys(actions);
        for (let y = 0; y < keys.length; y++) {
          if (actions[keys[y]].interactive) {
            if (actions[keys[y]].access(message, MessageStrategy.strategies[key], actions[keys[y]].action)) {
              full_help += keys[y] + " - " + actions[keys[y]].help() + "\n";
            }
          }
        }

        MessageStrategy.client.sendText(message.from, full_help);
      }
    });
  }
}


module.exports = {
  MessageStrategy: Help
}