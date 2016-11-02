/**
 * BSD license
 * 
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 * 
 * https://github.com/facebook/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
 */

/**
 * MIT license
 * 
 * Copyright (c) 2016 Malcolm Bellman
 */

/* Normalization constant. */
const PIXEL_STEP: number = 10;

/* Normalization constant. */
const LINE_HEIGHT: number = 40;

/* Normalization constant. */
const PAGE_HEIGHT: number = 800;

/**
 * An interface which combines properties of multiple mouse wheel event interfaces,
 * without enforcing any particular property requirements. While useless for type
 * checking, it provides context for the design of the normalizeWheel function
 * and permits compilation without unnecessary instance/type checking.
 */
interface GenericWheelEvent {
    readonly detail?: number;
    readonly wheelDelta?: number;
    readonly wheelDeltaX?: number;
    readonly wheelDeltaY?: number;
    readonly axis?: number;
    readonly HORIZONTAL_AXIS?: number;
    readonly VERTICAL_AXIS?: number;
    readonly deltaX?: number;
    readonly deltaY?: number;
    readonly deltaMode?: number;
}

/**
 * An object containing normalized values from a GenericWheelEvent.
 */
export interface NormalizedWheel {
    /* A normalized deltaX value. */
    spinX: number;
    
    /* A normalized deltaY value. */
    spinY: number;

    /* The wheel event's horizontal pixel displacement. */
    pixelX: number;

    /* The wheel event's vertical pixel displacement. */
    pixelY: number;
}

/**
 * Receives a mouse wheel event of unknown implementation and attempts to
 * yield normalized values for the spin delta and pixel displacement.
 */
export function normalizeWheel (event: GenericWheelEvent): NormalizedWheel {
    var sX = 0, sY = 0,   // spinX, spinY
        pX = 0, pY = 0;   // pixelX, pixelY

    // Legacy
    if ('detail' in event) { sY = event.detail; }
    if ('wheelDelta' in event) { sY = -event.wheelDelta / 120; }
    if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
    if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

    // side scrolling on FF with DOMMouseScroll
    if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
        sX = sY;
        sY = 0;
    }

    pX = sX * PIXEL_STEP;
    pY = sY * PIXEL_STEP;

    if ('deltaY' in event) { pY = event.deltaY; }
    if ('deltaX' in event) { pX = event.deltaX; }

    if ((pX || pY) && event.deltaMode) {
        if (event.deltaMode === 1) {         // delta in LINE units
            pX *= LINE_HEIGHT;
            pY *= LINE_HEIGHT;
        } else {                             // delta in PAGE units
            pX *= PAGE_HEIGHT;
            pY *= PAGE_HEIGHT;
        }
    }

    // Fall-back if spin cannot be determined
    if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
    if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

    return {
        spinX : sX,
        spinY : sY,
        pixelX : pX,
        pixelY : pY
    };
}