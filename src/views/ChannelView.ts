import View from "core/program/View";

import { ChannelTemplate } from "templates/ChannelTemplate";

/**
 * @ public class ChannelView
 * 
 * The user interface for individual sequencer channels.
 */
export default class ChannelView extends View {
    /* @ The ChannelView template. @override */
    protected template: string = ChannelTemplate;

    constructor () {
        super('channel');
    }
}