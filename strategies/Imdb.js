const MessageStrategy = require("../MessageStrategy.js")

// ####################################
// imdb
// ####################################

class Imdb extends MessageStrategy {
  static dummy = MessageStrategy.derived.add(this.name);
  static self = null;

  constructor() {
    super('Imdb', {
      'enabled': true
    });
  }

  provides() {
    Imdb.self = this;

    return {
      help: 'Provides the levenshtein distance between 2 strings',
      provides: {
        'imdb': {
          test: function (message) {
            return message.body.toLowerCase().startsWith('imdb');
          },
          access: function (message, strategy, action) {
            MessageStrategy.register(strategy.constructor.name + action.name);
            return true;
          },
          help: function () {
            return 'To do';
          },
          action: Imdb.self.Imdb,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state['Imdb']['enabled'];
          }
        }
      },
      access: function (message, strategy) {
        MessageStrategy.register(strategy.constructor.name);
        return true;
      },
      enabled: function () {
        return MessageStrategy.state['Imdb']['enabled'];
      }
    }
  }

  Imdb(message) {
    try {
      let search_term = message.body.substring(5);
      nameToImdb(search_term, function (err, res, inf) {
        MessageStrategy.typing(message);
        MessageStrategy.client.sendLinkWithAutoPreview(message.from, "https://www.imdb.com/title/" + res + "/");
      });
    } catch (err) {
      MessageStrategy.client.sendText(message.from, err);
    }
  }
}


module.exports = {
  MessageStrategy: Imdb
}