import {
  applyStyle, htmlToElement,
  translateRect, Rect, Point,
  findElements,
  computeInnerRect
} from '@fullcalendar/core'
import ScrollListener from './ScrollListener'
import { getScrollCanvasOrigin, getScrollFromLeftEdge } from './scroll-left-norm'


interface ElementGeom {
  parentBound: Rect // relative to the canvas origin
  naturalBound: Rect | null // of the el itself
  elWidth: number
  elHeight: number
  textAlign: string
}

const STICKY_PROP_VAL = computeStickyPropVal() // if null, means not supported at all
const IS_MS_EDGE = /Edge/.test(navigator.userAgent) // TODO: what about Chromeum-based Edge?
const STICKY_SELECTOR = '.fc-sticky'


/*
useful beyond the native position:sticky for these reasons:
- support in IE11
- nice centering support
*/
export default class StickyScroller {

  listener?: ScrollListener
  usingRelative: boolean | null = null


  constructor(
    private scrollEl: HTMLElement,
    private isRtl: boolean
  ) {
    this.usingRelative =
      !STICKY_PROP_VAL || // IE11
      (IS_MS_EDGE && isRtl) // https://stackoverflow.com/questions/56835658/in-microsoft-edge-sticky-positioning-doesnt-work-when-combined-with-dir-rtl

    if (this.usingRelative) {
      this.listener = new ScrollListener(scrollEl)
      this.listener.emitter.on('scrollEnd', this.updateSize)
    }
  }


  destroy() {
    if (this.listener) {
      this.listener.destroy()
    }
  }


  updateSize = () => {
    let { scrollEl } = this
    let els = findElements(scrollEl, STICKY_SELECTOR)
    let elGeoms = this.queryElGeoms(els)
    let viewportWidth = scrollEl.clientWidth

    if (this.usingRelative) {
      let elDestinations = this.computeElDestinations(elGeoms, viewportWidth) // read before prepPositioning

      assignRelativePositions(els, elGeoms, elDestinations)
    } else {
      assignStickyPositions(els, elGeoms, viewportWidth)
    }
  }


  queryElGeoms(els: HTMLElement[]): ElementGeom[] {
    let { scrollEl, isRtl } = this
    let canvasOrigin = getScrollCanvasOrigin(scrollEl)
    let elGeoms: ElementGeom[] = []

    for (let el of els) {

      let parentBound = translateRect(
        computeInnerRect(el.parentNode as HTMLElement, true, true), // weird way to call this!!!
        -canvasOrigin.left,
        -canvasOrigin.top
      )

      let elRect = el.getBoundingClientRect()
      let computedStyles = window.getComputedStyle(el)
      let textAlign = window.getComputedStyle(el.parentNode as HTMLElement).textAlign // ask the parent
      let naturalBound = null

      if (textAlign === 'start') {
        textAlign = isRtl ? 'right' : 'left'
      } else if (textAlign === 'end') {
        textAlign = isRtl ? 'left' : 'right'
      }

      if (computedStyles.position !== 'sticky') {
        naturalBound = translateRect(
          elRect,
          -canvasOrigin.left - (parseFloat(computedStyles.left) || 0), // could be 'auto'
          -canvasOrigin.top - (parseFloat(computedStyles.top) || 0)
        )
      }

      elGeoms.push({
        parentBound,
        naturalBound,
        elWidth: elRect.width,
        elHeight: elRect.height,
        textAlign
      })
    }

    return elGeoms
  }


  computeElDestinations(elGeoms: ElementGeom[], viewportWidth: number): Point[] {
    let { scrollEl } = this
    let viewportTop = scrollEl.scrollTop
    let viewportLeft = getScrollFromLeftEdge(scrollEl)
    let viewportRight = viewportLeft + viewportWidth

    return elGeoms.map(function(elGeom) {
      let { elWidth, elHeight, parentBound, naturalBound } = elGeom
      let destLeft // relative to canvas topleft
      let destTop // "

      switch (elGeom.textAlign) {
        case 'left':
          destLeft = viewportLeft
          break
        case 'right':
          destLeft = viewportRight - elWidth
          break
        case 'center':
          destLeft = (viewportLeft + viewportRight) / 2 - elWidth / 2 /// noooo, use half-width insteadddddddd
          break
      }

      destLeft = Math.min(destLeft, parentBound.right - elWidth)
      destLeft = Math.max(destLeft, parentBound.left)

      destTop = viewportTop
      destTop = Math.min(destTop, parentBound.bottom - elHeight)
      destTop = Math.max(destTop, naturalBound.top) // better to use natural top for upper bound

      return { left: destLeft, top: destTop }
    })
  }

}


function assignRelativePositions(els: HTMLElement[], elGeoms: ElementGeom[], elDestinations: Point[]) {
  els.forEach(function(el, i) {
    let { naturalBound } = elGeoms[i]
    let left = elDestinations[i].left - naturalBound.left
    let top = elDestinations[i].top - naturalBound.top

    applyStyle(el, {
      position: 'relative',
      left: left,
      right: -left, // for rtl
      top: top
    })
  })
}


function assignStickyPositions(els: HTMLElement[], elGeoms: ElementGeom[], viewportWidth: number) {
  els.forEach(function(el, i) {
    let stickyLeft = 0

    if (elGeoms[i].textAlign === 'center') {
      stickyLeft = (viewportWidth - elGeoms[i].elWidth) / 2
    }

    applyStyle(el, {
      position: STICKY_PROP_VAL,
      left: stickyLeft,
      right: stickyLeft, // for when centered
      top: 0
    })
  })
}


function computeStickyPropVal() {
  let el = htmlToElement('<div style="position:-webkit-sticky;position:sticky"></div>')
  let val = el.style.position

  if (val.indexOf('sticky') !== -1) {
    return val
  } else {
    return null
  }
}
