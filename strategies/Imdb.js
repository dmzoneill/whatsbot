const MessageStrategy = require('../MessageStrategy.js')

// ####################################
// imdb
// ####################################

class Imdb extends MessageStrategy {
  static dummy = MessageStrategy.derived.add(this.name)
  static self = null

  constructor () {
    super('Imdb', {
      enabled: true
    })
  }

  provides () {
    Imdb.self = this

    return {
      help: 'Provide information and links to IMDB titles',
      provides: {
        'imdb x': {
          test: function (message) {
            return message.body.toLowerCase().startsWith('imdb')
          },
          access: function (message, strategy, action) {
            return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name + action.name)
          },
          help: function () {
            return 'Gets a link to the IMDB page for a given title'
          },
          action: Imdb.self.Imdb,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state.Imdb.enabled
          }
        }
      },
      access: function (message, strategy) {
        return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name)
      },
      enabled: function () {
        return MessageStrategy.state.Imdb.enabled
      }
    }
  }

  async Imdb (message) {
    try {
      const searchTerm = message.body.substring(5)
      // eslint-disable-next-line no-undef
      nameToImdb(searchTerm, async function (err, res, inf) {
        if (err) return

        try {
          const ogData = await Imdb.self.get_page_og_data(Imdb.self, 'https://www.imdb.com/title/' + res + '/', 1500)

          MessageStrategy.typing(message)
          console.log('https://www.imdb.com/title/' + res + '/')
          console.log(ogData)
          // MessageStrategy.client.sendLinkWithAutoPreview(message.from, 'https://www.imdb.com/title/' + res + '/', ogData[0], ogData[1])
          await MessageStrategy.client.sendImage(message.from, ogData[1], 'imdb.jpg', ogData[0] + '\n\n' + 'https://www.imdb.com/title/' + res + '/')
        } catch (err) {
          MessageStrategy.client.sendText(message.from, err)
        }
      })
    } catch (err) {
      MessageStrategy.client.sendText(message.from, err)
    }
  }
}

module.exports = {
  MessageStrategy: Imdb
}
