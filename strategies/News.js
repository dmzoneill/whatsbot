// const { filter } = require('cheerio/lib/api/traversing.js');
const MessageStrategy = require('../MessageStrategy.js')

// ####################################
// News
// ####################################

class News extends MessageStrategy {
  static dummy = MessageStrategy.derived.add(this.name)
  static self = null

  constructor () {
    super('News', {
      enabled: true
    })
  }

  provides (message) {
    News.self = this

    return {
      help: 'Gets rss random news',
      provides: {
        'news subscriptions': {
          test: function (message) {
            return message.body.toLowerCase() === 'news subscriptions'
          },
          access: function (message, strategy, action) {
            return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name + action.name)
          },
          help: function () {
            return 'Show list of chat subscriptions'
          },
          action: News.self.list,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state.News.enabled
          }
        },
        'news subscribe *': {
          test: function (message) {
            return message.body.toLowerCase().startsWith('news subscribe')
          },
          access: function (message, strategy, action) {
            return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name + action.name)
          },
          help: function () {
            return 'Subscribe to a site news'
          },
          action: News.self.subscribe,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state.News.enabled
          }
        },
        'news unsubscribe *': {
          test: function (message) {
            return message.body.toLowerCase().startsWith('news unsubscribe')
          },
          access: function (message, strategy, action) {
            return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name + action.name)
          },
          help: function () {
            return 'Unsubscribe from site news'
          },
          action: News.self.unSubscribe,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state.News.enabled
          }
        },
        'news state': {
          test: function (message) {
            return message.body.toLowerCase() === 'news state'
          },
          access: function (message, strategy, action) {
            return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name + action.name)
          },
          help: function () {
            return 'show the state'
          },
          action: News.self.state,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state.News.enabled
          }
        },
        'news clear': {
          test: function (message) {
            return message.body.toLowerCase() === 'news clear'
          },
          access: function (message, strategy, action) {
            return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name + action.name)
          },
          help: function () {
            return 'clear all subscriptions'
          },
          action: News.self.clear,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state.News.enabled
          }
        },
        'news pop': {
          test: function (message) {
            return message.body.toLowerCase() === 'news pop'
          },
          access: function (message, strategy, action) {
            return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name + action.name)
          },
          help: function () {
            return 'Pop the last off and reset notified'
          },
          action: News.self.pop,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state.News.enabled
          }
        },
        'news filter': {
          test: function (message) {
            return message.body.toLowerCase().startsWith('news filter')
          },
          access: function (message, strategy, action) {
            return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name + action.name)
          },
          help: function () {
            return 'Filter specific news, +overides a -negation, everything else is assumed a match'
          },
          action: News.self.filters,
          interactive: true,
          enabled: function () {
            return MessageStrategy.state.News.enabled
          }
        },
        '*': {
          test: function (message) {
            return true
          },
          access: function (message, strategy, action) {
            return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name + action.name)
          },
          help: function () {
            return 'Post a latest article from subscribed list'
          },
          action: function (message) {
            News.self.post(message)
            return false
          },
          interactive: false,
          enabled: function () {
            return MessageStrategy.state.News.enabled
          }
        }
      },
      access: function (message, strategy) {
        return MessageStrategy.hasAccess(message.sender.id, strategy.constructor.name)
      },
      enabled: function () {
        return MessageStrategy.state.News.enabled
      }
    }
  }

  async validURL (str) {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
    return !!pattern.test(str)
  }

  async clear (message) {
    try {
      MessageStrategy.state.News = {}
      MessageStrategy.state.News.enabled = true
      console.log(MessageStrategy.state.News)
    } catch (err) {
    }
  }

  async state (message) {
    try {
      console.log(MessageStrategy.state.News)
    } catch (err) {
    }
  }

  async pop (message) {
    try {
      const chatkeys = Object.keys(MessageStrategy.state.News.Notified)
      for (let y = 0; y < chatkeys.length; y++) {
        const subkeys = Object.keys(MessageStrategy.state.News.Notified[chatkeys[y]])
        for (let h = 0; h < subkeys.length; h++) {
          MessageStrategy.state.News.LastNotified[message.from][chatkeys[y]][subkeys[h]] = 0
          console.log('Popped: ' + MessageStrategy.state.News.Notified[chatkeys[y]][subkeys[h]].pop().toString())
        }
      }
    } catch (err) {
    }
  }

  async filters (message) {
    try {
      const parts = message.body.trim().split(' ')
      parts.shift()
      parts.shift()
      const newsFilters = []

      if (Object.keys(MessageStrategy.state.News).indexOf('Filter') === -1) {
        MessageStrategy.state.News.Filter = {}
      }

      if (Object.keys(MessageStrategy.state.News.Filter).indexOf(message.from) === -1) {
        MessageStrategy.state.News.Filter[message.from] = []
      }

      for (let j = 0; j < parts.length; j++) {
        if (parts[j].trim() === '') continue
        newsFilters.push(parts[j].trim())
      }

      if (newsFilters.length === 0) {
        const currentFilters = MessageStrategy.state.News.Filter[message.from]
        if (currentFilters.length === 0) {
          MessageStrategy.client.sendText(message.from, 'No filters defined')
          return
        }
        MessageStrategy.client.sendText(message.from, currentFilters.join(' '))
        return
      }

      MessageStrategy.state.News.Filter[message.from] = newsFilters.sort().reverse()

      MessageStrategy.client.sendText(message.from, 'Updated')
    } catch (err) {
      console.log(err)
    }
  }

  async list (message) {
    try {
      let msg = ''
      const subkeys = Object.keys(MessageStrategy.state.News.Subscribed[message.from])

      if (subkeys.length === 0) {
        MessageStrategy.client.sendText(message.from, 'This chat has 0 subscriptions')
        return
      }

      for (let h = 0; h < subkeys.length; h++) {
        msg += h.toString() + ' ' + MessageStrategy.state.News.Subscribed[message.from][subkeys[h]] + '\n'
      }
      MessageStrategy.client.sendText(message.from, msg)
    } catch (err) {
    }
  }

  async unSubscribe (message) {
    try {
      const parts = message.body.split(' ')
      const isno = parseInt(parts[2])
      let toTeRemoved = parts[2]

      if (Number.isNaN(isno) === false) {
        const subkeys = MessageStrategy.state.News.Subscribed[message.from]
        for (let h = 0; h < subkeys.length; h++) {
          if (h === isno) {
            toTeRemoved = subkeys[h]
            break
          }
        }
      }

      const index = MessageStrategy.state.News.Subscribed[message.from].indexOf(toTeRemoved)
      if (index !== -1) {
        MessageStrategy.state.News.Subscribed[message.from].splice(index, 1)
      }

      delete MessageStrategy.state.News.Notified[message.from][toTeRemoved]
      delete MessageStrategy.state.News.LastNotified[message.from][toTeRemoved]

      MessageStrategy.client.sendText(message.from, 'Un-subscribed')
    } catch (err) {
      MessageStrategy.client.sendText(message.from, 'No such subscription')
    }
  }

  async getSiteMaps (message, urlstr) {
    const url = new URL(urlstr)
    const robotstxt = await MessageStrategy.axiosHttpRequest(message, 'GET', url.protocol + '//' + url.hostname + '/robots.txt', false, 200, false)
    const regex1 = /Sitemap: .*/g
    let array1
    const resshort = []
    const resfull = []

    while ((array1 = regex1.exec(robotstxt)) !== null) {
      const entry = array1[0].substring(9)
      const index = entry.indexOf('/', 9)
      resshort.push(entry.substring(index))
      resfull.push(entry)
    }

    return [resshort, resfull]
  }
  
  async getLocsFromXML(message, sitemapUrl) {
    const locs = []
  
    try {
      // Fetch the XML data from the sitemap URL
      const xmlData = await MessageStrategy.axiosHttpRequest(message, 'GET', sitemapUrl, false, 200, false)
  
      // Parse XML data using xml2js
      const parser = new xml2js.Parser({ explicitArray: false })
      const parsedData = await parser.parseStringPromise(xmlData)
  
      // Check for subsitemaps in <sitemap> tags
      if (parsedData.sitemapindex && parsedData.sitemapindex.sitemap) {
        const sitemaps = parsedData.sitemapindex.sitemap
        // Loop through subsitemaps and recursively fetch locs
        for (const sitemap of Array.isArray(sitemaps) ? sitemaps : [sitemaps]) {
          const subsitemapLoc = sitemap.loc
          const subsitemapLocs = await this.getLocsFromXML(message, subsitemapLoc)
          locs.push(...subsitemapLocs)
        }
      }
  
      // Get URLs from <url> tags in the current sitemap
      if (parsedData.urlset && parsedData.urlset.url) {
        const urls = parsedData.urlset.url
        for (const url of Array.isArray(urls) ? urls : [urls]) {
          locs.push(url.loc)
        }
      }
    } catch (error) {
      console.error(`Error processing XML from ${sitemapUrl}:`, error)
      // Optionally: Re-throw the error or return a default value
      // throw error
    }
  
    return locs
  }
  
  async subscribe (message) {
    try {
      const parts = message.body.trim().split(' ')

      if (await News.self.validURL(parts[2]) === false) {
        MessageStrategy.client.sendText(message.from, 'Not a valid subscription url')
        return
      }

      const sitemaps = await News.self.getSiteMaps(message, parts[2])

      if (sitemaps[0].length === 0) {
        MessageStrategy.client.sendText(message.from, 'No sitemaps or robots.txt found.')
        return
      }

      if (sitemaps[0].length > 1 && parts.length === 3) {
        MessageStrategy.client.sendText(message.from, 'More than 1 sitemap found, please specify which one, e.g:\n\nNews subscribe http://x.com/ 1\n\n')
        let msg = ''
        for (let h = 0; h < sitemaps[0].length; h++) {
          msg += h + ' ' + sitemaps[0][h] + '\n'
        }
        MessageStrategy.client.sendText(message.from, msg)
        return
      }

      const index = (parts.length === 3) ? 0 : parseInt(parts[3])

      const urls = await News.self.getLocsFromXML(message, sitemaps[1][index])

      if (urls.length === 0) {
        MessageStrategy.client.sendText(message.from, 'Not a valid subscription url')
        return
      }

      if (Object.keys(MessageStrategy.state).indexOf('News') === -1) {
        MessageStrategy.state.News = {}
      }

      if (Object.keys(MessageStrategy.state.News).indexOf('enabled') === -1) {
        MessageStrategy.state.News.enabled = true
      }

      if (Object.keys(MessageStrategy.state.News).indexOf('Subscribed') === -1) {
        MessageStrategy.state.News.Subscribed = {}
      }

      if (Object.keys(MessageStrategy.state.News).indexOf('Notified') === -1) {
        MessageStrategy.state.News.Notified = {}
      }

      if (Object.keys(MessageStrategy.state.News).indexOf('LastNotified') === -1) {
        MessageStrategy.state.News.LastNotified = {}
      }

      if (Object.keys(MessageStrategy.state.News).indexOf('Filter') === -1) {
        MessageStrategy.state.News.Filter = {}
      }

      if (Object.keys(MessageStrategy.state.News.Filter).indexOf(message.from) === -1) {
        MessageStrategy.state.News.Filter[message.from] = []
      }

      if (Object.keys(MessageStrategy.state.News.Subscribed).indexOf(message.from) === -1) {
        MessageStrategy.state.News.Subscribed[message.from] = []
      }

      if (MessageStrategy.state.News.Subscribed[message.from].indexOf(sitemaps[1][index]) === -1) {
        MessageStrategy.state.News.Subscribed[message.from].push(sitemaps[1][index])
      } else {
        MessageStrategy.client.sendText(message.from, 'Already subscribed')
        return
      }

      if (Object.keys(MessageStrategy.state.News.Notified).indexOf(message.from) === -1) {
        MessageStrategy.state.News.Notified[message.from] = {}
      }

      if (Object.keys(MessageStrategy.state.News.Notified[message.from]).indexOf(sitemaps[1][index]) === -1) {
        MessageStrategy.state.News.Notified[message.from][sitemaps[1][index]] = []
      }

      if (Object.keys(MessageStrategy.state.News.LastNotified).indexOf(message.from) === -1) {
        MessageStrategy.state.News.LastNotified[message.from] = {}
      }

      if (Object.keys(MessageStrategy.state.News.LastNotified[message.from]).indexOf(sitemaps[1][index]) === -1) {
        MessageStrategy.state.News.LastNotified[message.from][sitemaps[1][index]] = 0
      }

      MessageStrategy.state.News.Queue = {}

      for (let i = 0; i < urls.length; i++) {
        MessageStrategy.state.News.Notified[message.from][sitemaps[1][index]].push(urls[i])
      }

      MessageStrategy.client.sendText(message.from, 'Subscribed')
      News.self.post(message)
    } catch (err) {
      console.log(err)
    }
  }

  async post (message) {
    if (Object.keys(MessageStrategy.state).indexOf('News') === -1) {
      return
    }

    if (Object.keys(MessageStrategy.state.News).indexOf('Subscribed') === -1) {
      return
    }

    await News.self.processChats(message)
    await News.self.processQueue()
  }

  async processChats (message) {
    const chats = Object.keys(MessageStrategy.state.News.Subscribed)

    for (let c = 0; c < chats.length; c++) {
      const subscriptions = MessageStrategy.state.News.Subscribed[chats[c]]
      for (let s = 0; s < subscriptions.length; s++) {
        if (MessageStrategy.state.News.LastNotified[chats[c]][subscriptions[s]] > Math.floor(Date.now() / 1000)) {
          continue
        }

        await News.self.handleSubscription(message, chats[c], subscriptions[s])
      }
    }
  }

  async handleSubscription (message, chat, subscription) {
    const urls = await News.self.getLocsFromXML(message, subscription)

    for (let i = 0; i < urls.length; i++) {
      await News.self.queuePost(chat, subscription, urls[i])
    }
  }

  async queuePost (chat, subscription, url) {
    if (MessageStrategy.state.News.Notified[chat][subscription].indexOf(url) === -1) {
      if (Object.keys(MessageStrategy.state.News).indexOf('Queue') === -1) {
        MessageStrategy.state.News.Queue = {}
      }
      MessageStrategy.state.News.Notified[chat][subscription].push(url)
      MessageStrategy.state.News.Queue[chat] = url
      MessageStrategy.state.News.LastNotified[chat][subscription] = (Math.floor(Date.now() / 1000)) + await News.self.randomIntFromInterval()
    }
  }

  async processQueue () {
    if (Object.keys(MessageStrategy.state.News.Queue).length > 0) {
      const msgs = Object.keys(MessageStrategy.state.News.Queue)
      for (let c = 0; c < msgs.length; c++) {
        News.self.postPreview(msgs[c], MessageStrategy.state.News.Queue[msgs[c]])
      }
      MessageStrategy.state.News.Queue = {}
    }
  }

  async postPreview (chat, url) {
    const data = await News.self.get_page_og_data(News.self, url, 500)
    if (data[1] === null) return

    let allowed = true

    if (Object.keys(MessageStrategy.state.News).indexOf('Filter') !== -1) {
      if (Object.keys(MessageStrategy.state.News.Filter).indexOf(chat) !== -1) {
        const filters = MessageStrategy.state.News.Filter[chat]
        for (let l = 0; l < filters.length; l++) {
          const type = filters[l].substring(0, 1)
          const filter = filters[l].substring(1)
          if (type === '-' && data[0].toLowerCase().indexOf(filter.toLowerCase()) > -1) {
            allowed = false
          }
          if (type === '+' && data[0].toLowerCase().indexOf(filter.toLowerCase()) > -1) {
            allowed = true
          }
        }
      }
    }

    if (allowed) {
      // MessageStrategy.client.sendLinkWithAutoPreview(chat, url, data[0], data[1])
      MessageStrategy.client.sendMessageWithThumb(data[1], url, data[2], data[0], '', chat)
    }
  }
}

module.exports = {
  MessageStrategy: News
}
