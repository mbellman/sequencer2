import Widget from "core/program/Widget";

import { bindAll } from "core/system/Utilities";
import { Query } from "core/dom/DOM";
import { ActionType } from "core/dom/action/Action";
import { DragAction } from "core/dom/action/MouseActions";

/* The KnobWidget inner HTML content. */
const KnobWidgetTemplate: string =
`<div class="knob">
    <div class="knob-dial"></div>
    <div class="knob-center"></div>
</div>`;

/**
 * A UI knob which can be rotated.
 */
export default class KnobWidget extends Widget {
    /**
     * @override
     * @implements (Widget)
     */
    protected template: string = KnobWidgetTemplate;

    /* The rotatable knob element. */
    private $knob: Query;

    /* The knob rotation angle. */
    private angle: number = 0;

    /**
     * @constructor
     */
    constructor () {
        super('knob-widget');

        bindAll(this, 'rotateKnobOnDrag');
    }

    /**
     * @setter {angle}
     */
    public set rotation (angle: number) {
        this.angle = angle;

        this.rotate(angle);
    }

    /**
     * @override
     */
    protected onRender (): void {
        this.$knob = this.$('.knob');

        this.$widget.react(ActionType.DRAG, this.rotateKnobOnDrag);
    }

    /**
     * An action handler for dragging the knob.
     */
    private rotateKnobOnDrag (a: DragAction): void {
        var newAngle: number = this.angle - a.deltaY;

        this.rotate(newAngle);

        if (a.ended) {
            this.angle = newAngle;
        }
    }

    /**
     * Rotates the knob to a specific angle.
     */
    private rotate (angle: number): void {
        this.$knob.transform('rotate(' + angle + 'deg)');
        this.events.trigger('rotate', angle);
    }
}