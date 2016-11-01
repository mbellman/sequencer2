import Canvas from "core/dom/canvas/Canvas";
import Sequence from "classes/Sequence";
import Channel from "classes/Channel";
import ChannelTemplate from "templates/ChannelTemplate";

import { Query } from "core/dom/query/Query";
import { View } from "core/program/View";

/**
 * The user interface for individual sequencer channels.
 */
export default class ChannelView extends View {
    /* The ChannelView template. @override */
    protected template: string = ChannelTemplate;

    /* The Sequence passed in from the parent SequenceView. */
    private sequence: Sequence;

    /* The Channel managed by this ChannelView. */
    private channel: Channel;

    /* A Canvas instance visualizing the Channel notes. */
    private channelCanvas: Canvas;

    constructor (sequence: Sequence) {
        super('channel hidden');

        this.sequence = sequence;
        this.channel = new Channel();

        this.sequence.addChannel(this.channel);
    }

    /**
     * ChannelView render event handler.
     * @override
     */
    public onRender (): void {
        var channelName: string = this.channel.getName();

        this.$element.attr('id', channelName)
            .find('.channel-label').html(channelName);
    }

    /**
     * ChannelView attach event handler.
     * @override
     */
    public onAttach (): void {
        setTimeout(() => {
            this.setupChannelCanvas();
        }, 600);
    }

    /**
     * ChannelView detach event handler.
     * @override
     */
    public onDetach (): void {
        this.sequence.removeChannel(this.channel);
    }

    /**
     * Instantiates and configures the channelCanvas.
     */
    private setupChannelCanvas (): void {
        var $canvas: Query = this.$('canvas.channel-sequence');
        this.channelCanvas = new Canvas($canvas.element(0));

        this.channelCanvas.setSize($canvas.width(), $canvas.height())
            .setBackground('#FFF');
    }
}