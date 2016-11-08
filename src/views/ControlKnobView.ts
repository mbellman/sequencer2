import View from "core/program/View";
import Canvas from "core/dom/canvas/Canvas";
import KnobWidget from "plugins/ui/widgets/KnobWidget";
import ControlKnobTemplate from "templates/ControlKnobTemplate";

/**
 * A customizable audio parameter for each sequence Channel, controlled via a KnobWidget.
 */
export default class ControlKnobView extends View {
    /**
     * @override
     */
    protected template: string = ControlKnobTemplate;

    /* The label text to display below the KnobWidget to indicate its function. */
    private label: string;

    /* The parameter control knob. */
    private knob: KnobWidget;

    /**
     * @constructor
     */
    constructor (label: string, angle: number) {
        super('control-knob-view');

        this.label = label;

        this.knob = new KnobWidget({
            size: 40,
            sensitivity: 3,
            min: -45,
            max: 225,
            angle: angle
        });
    }

    /**
     * @override
     */
    public onRender (): void {
        this.knob.embed(this.$('.control-knob'));
        this.$('label').html(this.label);
    }
}