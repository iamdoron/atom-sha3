'use babel'

const { it, beforeEach, afterEach } = require('./helpers')
const { describe, expect, atom, jasmine, advanceClock, CustomEvent } = global
// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('Sha3', () => {
  let sha3Status, editor, workspaceElement

  beforeEach(async () => {
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)
    await atom.packages.activatePackage('status-bar')
    await atom.packages.activatePackage('sha3')
    editor = await atom.workspace.open('sample.js')
    sha3Status = document.querySelector('.sha3-status')
    // Wait for status bar service hook to fire
    while (!sha3Status || !sha3Status.textContent) {
      await atom.views.getNextUpdatePromise()
      sha3Status = document.querySelector('.sha3-status')
    }
  })
  afterEach(async () => {
    await atom.packages.deactivatePackage('sha3')
  })

  describe('when presented with a file change', () => {
    it('should calculate sha3', async () => {
      expect(workspaceElement.querySelectorAll('sha3-status').length).toBe(1)
      expect(sha3Status.querySelector('a').textContent).toBe('sha3: c5d24')
      await hover(sha3Status.querySelector('a'), () => {
        expect(document.body.querySelector('.tooltip').innerText).toBe('c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470')
      })
      editor.setText('help\n')
      await advanceClock(2000)
      await atom.views.getNextUpdatePromise()
      expect(sha3Status.querySelector('a').textContent).toBe('sha3: de482')
      await hover(sha3Status.querySelector('a'), () => {
        expect(document.body.querySelector('.tooltip').innerText).toBe('de482bb6c67d76f9350dff113910e96f14fd83916c19ca30140d67be549d0f87')
      })
    })
  })
})

const hover = (element, fn) => {
  // FIXME: Only use hoverDefaults once Atom 1.13 is on stable
  const hoverDelay = (atom.tooltips.defaults.delay && atom.tooltips.defaults.delay.show) || atom.tooltips.hoverDefaults.delay.show || 1000
  element.dispatchEvent(new CustomEvent('mouseenter', {bubbles: false}))
  element.dispatchEvent(new CustomEvent('mouseover', {bubbles: true}))
  advanceClock(hoverDelay)
  fn()
  element.dispatchEvent(new CustomEvent('mouseleave', {bubbles: false}))
  element.dispatchEvent(new CustomEvent('mouseout', {bubbles: true}))
  advanceClock(hoverDelay)
}
