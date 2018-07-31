const { Disposable } = require('atom')
const Sha3 = require('js-sha3')

const atom = global.atom

module.exports =
class EncodingStatusView {
  constructor (statusBar) {
    this.statusBar = statusBar
    this.element = document.createElement('sha3-status')
    this.element.classList.add('sha3-status', 'inline-block')
    this.sha3Link = document.createElement('a')
    this.sha3Link.classList.add('inline-block')
    this.element.appendChild(this.sha3Link)

    this.activeItemSubscription = atom.workspace.observeActiveTextEditor(this.subscribeToActiveTextEditor.bind(this))
    const clickHandler = (event) => {
      event.preventDefault()
      const editor = atom.workspace.getActiveTextEditor()
      const text = editor.getText()
      const sha3 = Sha3.keccak256.update(text).hex()
      atom.clipboard.write(sha3)
      // atom.commands.dispatch(atom.workspace.getActiveTextEditor().element, 'sha3:show')
    }
    this.element.addEventListener('click', clickHandler)
    this.clickSubscription = new Disposable(() => this.element.removeEventListener('click', clickHandler))
  }

  destroy () {
    if (this.activeItemSubscription) {
      this.activeItemSubscription.dispose()
    }

    if (this.sha3Subscription) {
      this.sha3Subscription.dispose()
    }

    if (this.clickSubscription) {
      this.clickSubscription.dispose()
    }

    if (this.tile) {
      this.tile.destroy()
    }

    if (this.tooltip) {
      this.tooltip.dispose()
    }
  }

  attach () {
    this.tile = this.statusBar.addRightTile({priority: 11, item: this.element})
  }

  subscribeToActiveTextEditor () {
    if (this.sha3Subscription) {
      this.sha3Subscription.dispose()
    }

    const editor = atom.workspace.getActiveTextEditor()
    if (editor) {
      this.sha3Subscription = editor.onDidStopChanging(this.updateSha3Text.bind(this))
    }
    this.updateSha3Text()
  }

  updateSha3Text () {
    atom.views.updateDocument(() => {
      console.time('sha3')
      const editor = atom.workspace.getActiveTextEditor()
      if (editor) {
        const text = editor.getText()
        const sha3 = Sha3.keccak256.update(text).hex()
        this.sha3Link.textContent = 'sha3: ' + sha3.slice(0, 5)
        this.element.style.display = ''

        if (this.tooltip) {
          this.tooltip.dispose()
        }
        this.tooltip = atom.tooltips.add(this.sha3Link, {title: `${sha3}`})
      } else {
        this.element.style.display = 'none'
      }
      console.timeEnd('sha3')
    })
  }
}
