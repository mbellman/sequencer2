import View from "core/program/View";
import Canvas from "core/dom/canvas/Canvas";
import Sequence from "classes/Sequence";
import Channel from "classes/Channel";
import ChannelTemplate from "templates/ChannelTemplate";

import { bindAll } from "core/system/Utilities";
import { Query } from "core/dom/DOM";

/**
 * The user interface for individual sequencer channels.
 */
export default class ChannelView extends View {
    /* The index of the ChannelView within the list of ChannelViews, starting with 1. */
    public index: number;

    /**
     * @override
     */
    protected template: string = ChannelTemplate;

    /* The Sequence passed in from the parent SequenceView. */
    private sequence: Sequence;

    /* The Channel managed by this ChannelView. */
    private channel: Channel;

    /* A Canvas instance visualizing the Channel notes. */
    private channelCanvas: Canvas;

    /**
     * @constructor
     */
    constructor (sequence: Sequence) {
        super('channel hidden');

        bindAll(this, 'setupChannelCanvasOnAttach');

        this.index = sequence.getTotalChannels() + 1;
        this.sequence = sequence;
        this.channel = new Channel();

        this.sequence.addChannel(this.channel);
    }

    /**
     * @override
     */
    public onRender (): void {
        var channelName: string = this.channel.getName();

        this.$element.attr('id', channelName)
            .find('.channel-label').html(channelName);
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
     * Instantiates and configures the channelCanvas.
     */
    private setupChannelCanvasOnAttach (): void {
        var $canvas: Query = this.$('canvas.channel-sequence');
        this.channelCanvas = new Canvas($canvas.element(0));

        this.channelCanvas.setSize($canvas.width(), $canvas.height())
            .setBackground('#FFF');
    }
}