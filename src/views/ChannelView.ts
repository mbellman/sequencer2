import View from "core/program/View";
import Sequence from "classes/Sequence";
import Channel from "classes/Channel";

import { ChannelTemplate } from "templates/ChannelTemplate";

/**
 * @ public class ChannelView
 * 
 * The user interface for individual sequencer channels.
 */
export default class ChannelView extends View {
    /* @ The ChannelView template. @override */
    protected template: string = ChannelTemplate;

    /* @ The Sequence passed in from the parent SequenceView. */
    private sequence: Sequence;
    /* @ The Channel managed by this ChannelView. */
    private channel: Channel;

    constructor (sequence: Sequence) {
        super('channel');

        this.sequence = sequence;
        this.channel = new Channel();

        this.sequence.addChannel(this.channel);
    }

    /**
     * ChannelView render event handler.
     * @override
     */
    public onRender (): void {
        this.$element.attr('id', this.channel.getName());
    }

    /**
     * ChannelView detach event handler.
     * @override
     */
    public onDetach (): void {
        this.sequence.removeChannel(this.channel);
    }
}