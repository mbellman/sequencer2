import View from "core/program/View";
import Canvas from "core/dom/canvas/Canvas";
import Sequence from "classes/Sequence";
import Channel from "classes/Channel";
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

    /* A Canvas instance visualizing the Channel notes. */
    private channelCanvas: Canvas;

    /**
     * @constructor
     */
    constructor (sequence: Sequence) {
        super('channel hidden');

        bindAll(this, 'setupChannelCanvasOnAttach');

        this.index = sequence.getTotalChannels();
        this.sequence = sequence;
        this.channel = new Channel();

        this.sequence.addChannel(this.channel);
    }

    /**
     * @override
     */
    public onRender (): void {
        var channelName: string = this.channel.getName();

        this.$content = this.$('.channel-content');

        this.$element.attr('id', channelName);
        this.$('.channel-label').html(channelName);
    }

    /**
     * @override
     */
    public onAttach (): void {
        setTimeout(this.setupChannelCanvasOnAttach, 600);
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
     * Instantiates and configures the channelCanvas.
     */
    private setupChannelCanvasOnAttach (): void {
        var $canvas: Query = this.$('canvas.channel-sequence');

        this.channelCanvas = new Canvas($canvas.element(0));

        this.resizeChannelCanvas();
    }

    private resizeChannelCanvas (): void {
        var contentWidth: number = this.$content.width();
        var canvasWidth: number;

        if (contentWidth < CHANNEL_CONTENT_WIDTH_THRESHOLD) {
            canvasWidth = contentWidth - REMAINING_CONTENT_WIDTH;
        } else {
            canvasWidth = CHANNEL_CANVAS_WIDTH_RATIO * contentWidth;
        }

        this.channelCanvas.setSize(canvasWidth, this.$content.height() - 2 * CHANNEL_CANVAS_MARGIN);
    }
}