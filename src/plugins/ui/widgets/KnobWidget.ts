import Widget from "core/program/Widget";

import { bindAll, defaultTo } from "core/system/Utilities";
import { clamp } from "core/system/math/Utilities";
import { $, Query } from "core/dom/DOM";
import { ActionType } from "core/dom/action/Action";
import { DragAction } from "core/dom/action/MouseActions";

/* The KnobWidget inner HTML content. */
const KnobWidgetTemplate: string =
`<div class="knob">
    <div class="knob-dial"></div>
    <div class="knob-center"></div>
</div>`;

/**
 * Configuration settings for a KnobWidget.
 */
interface KnobSettings {
    /* The width/height of the knob. */
    size?: number;

    /* The knob sensitivity, used as a rotation speed factor. */
    sensitivity?: number;

    /* The minimum knob rotation angle. */
    min?: number;

    /* The maximum knob rotation angle. */
    max?: number;

    /* The default starting angle for the knob. */
    angle?: number;
}

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

    /* The KnobWidget settings. */
    private settings: KnobSettings = {};

    /**
     * @constructor
     */
    constructor (settings: KnobSettings = {}) {
        super('knob-widget');

        bindAll(this, 'rotateKnobOnDrag');

        this.settings.sensitivity = defaultTo(settings.sensitivity, 1);
        this.settings.size = defaultTo(settings.size, 50);
        this.settings.min = defaultTo(settings.min, 0);
        this.settings.max = defaultTo(settings.max, 360);
        this.settings.angle = defaultTo(settings.angle, 0);
    }

    /**
     * @setter {rotation}
     */
    public set rotation (angle: number) {
        this.angle = clamp(angle, this.settings.min, this.settings.max);

        this.rotate(angle);
    }

    /**
     * @override
     */
    protected onRender (): void {
        this.$knob = this.$('.knob');
        
        this.$widget.css('width', this.settings.size + 'px')
            .css('height', this.settings.size + 'px')
            .on('mousedown', () => {
                $('body').addClass('nocursor');
            })
            .react(ActionType.DRAG, this.rotateKnobOnDrag);
        
        this.rotation = this.settings.angle;
    }

    /**
     * An action handler for dragging the knob.
     */
    private rotateKnobOnDrag (a: DragAction): void {
        var newAngle: number = this.angle - (a.deltaY * this.settings.sensitivity);
        var clampedAngle: number = clamp(newAngle, this.settings.min, this.settings.max);

        this.rotate(clampedAngle);

        if (a.ended) {
            this.angle = clampedAngle;

            $('body').removeClass('nocursor');
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