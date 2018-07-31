const Sha3StatusView = require('./sha3-status-view')

let sha3StatusView = null
let sha3View = null
let commandSubscription = null

module.exports = {
  activate () {
  },

  deactivate () {
    if (commandSubscription) commandSubscription.dispose()
    commandSubscription = null

    if (sha3StatusView) sha3StatusView.destroy()
    sha3StatusView = null

    if (sha3View) sha3View.destroy()
    sha3View = null
  },

  consumeStatusBar (statusBar) {
    sha3StatusView = new Sha3StatusView(statusBar)
    sha3StatusView.attach()
  }
}
