import View from "core/program/View";
import Canvas from "core/dom/canvas/Canvas";
import Sequence from "classes/Sequence";
import Channel from "classes/Channel";
import ControlKnobView from "views/ControlKnobView";
import ChannelTemplate from "templates/ChannelTemplate";

import { bindAll } from "core/system/Utilities";
import { Query } from "core/dom/DOM";
import { Tween } from "core/system/math/tween/Tween";
import { Ease } from "core/system/math/tween/Ease";
import { ResizableView } from "plugins/ui/views/Interfaces";

/* The pixel margin for the ChannelView's Channel canvas. */
const CHANNEL_CANVAS_MARGIN: number = 25;

/* The normal width of each ChannelView Channel canvas as a ratio of total content width. */
const CHANNEL_CANVAS_WIDTH_RATIO: number = 0.7;

/**
 * When a ChannelView's content width falls below this threshold, its {channelCanvas} width will
 * be resized to a static pixel value below this threshold, rather than a ratio of the content width.
 */
const CHANNEL_CONTENT_WIDTH_THRESHOLD: number = 1000;

/**
 * The value to subtract from {CHANNEL_CANVAS_RESIZE_THRESHOLD} to obtain the new {channelCanvas}
 * width when the content width falls below the threshold. I.e., the width of the remaining content.
 */
const REMAINING_CONTENT_WIDTH: number = CHANNEL_CONTENT_WIDTH_THRESHOLD * (1 - CHANNEL_CANVAS_WIDTH_RATIO);

/**
 * The user interface for individual sequencer channels.
 */
export default class ChannelView extends View implements ResizableView {
    /* The index of the ChannelView within the list of ChannelViews, starting with 1. */
    public index: number;

    /**
     * @override
     */
    protected template: string = ChannelTemplate;

    /* The Sequence instance passed in from the parent SequenceView. */
    private sequence: Sequence;

    /* The Channel instance managed by this ChannelView. */
    private channel: Channel;

    /* The ChannelView content area below the top bar. */
    private $content: Query;

    /* The ChannelView controls container, to the right of the channel canvas. */
    private $controls: Query;

    /* A Canvas instance visualizing the Channel notes. */
    private channelCanvas: Canvas;

    /**
     * @constructor
     */
    constructor (sequence: Sequence) {
        super('channel-view');

        this.index = sequence.getTotalChannels();
        this.sequence = sequence;
        this.channel = new Channel();

        this.sequence.addChannel(this.channel);
    }

    /**
     * @override
     */
    public onRender (): void {
        this.$content = this.$('.channel-content');
        this.$controls = this.$('.channel-controls');

        this.createChannelNameLabelOnRender();
        this.setupChannelCanvasOnRender();
        this.setupChannelControlsOnRender();
    }

    /**
     * @override
     */
    public onAttach (): void {
        this.resizeChannelCanvas();
        this.revealChannelViewOnAttach();
    }

    /**
     * @override
     */
    public onDetach (): void {
        this.sequence.removeChannel(this.channel);
    }

    /**
     * @implements (ResizableView)
     */
    public onResize (): void {
        this.resizeChannelCanvas();
    }

    /**
     * Sets up the ChannelView name label in the top bar area.
     */
    private createChannelNameLabelOnRender (): void {
        var channelName: string = this.channel.getName();

        this.$element.attr('id', channelName);
        this.$('.channel-label').html(channelName);
    }

    /**
     * Instantiates and configures the channelCanvas.
     */
    private setupChannelCanvasOnRender (): void {
        var $canvas: Query = this.$('canvas.channel-sequence');

        this.channelCanvas = new Canvas($canvas.element(0));
    }

    /**
     * Sets up the ChannelView controls area.
     */
    private setupChannelControlsOnRender (): void {
        var volume: ControlKnobView = new ControlKnobView('VOL', 90);
        var modulation: ControlKnobView = new ControlKnobView('MOD', -45);
        var pan: ControlKnobView = new ControlKnobView('PAN', 90);

        volume.attachTo(this.$controls);
        modulation.attachTo(this.$controls);
        pan.attachTo(this.$controls);
    }

    /**
     * Animates the ChannelView from 0 to full scale.
     */
    private revealChannelViewOnAttach (): void {
        this.$element.transform('scale(0)');

        Tween.run({
            start: 0,
            end: 1,
            duration: 0.5,
            ease: Ease.inOutCubic,
            onUpdate: (scale: number) => {
                this.$element.transform('scale(' + scale + ')');
            }
        });
    }

    /**
     * Updates the channel canvas pixel dimensions.
     */
    private resizeChannelCanvas (): void {
        var contentWidth: number = this.$content.width();
        var canvasWidth: number;

        if (contentWidth < CHANNEL_CONTENT_WIDTH_THRESHOLD) {
            // At small resolutions, preserve some width for the remaining
            // content area to the right of the canvas.
            canvasWidth = contentWidth - REMAINING_CONTENT_WIDTH;
        } else {
            canvasWidth = CHANNEL_CANVAS_WIDTH_RATIO * contentWidth;
        }

        this.channelCanvas.setSize(canvasWidth, this.$content.height() - 2 * CHANNEL_CANVAS_MARGIN);
    }
}