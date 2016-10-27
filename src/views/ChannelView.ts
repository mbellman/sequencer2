import View from "core/application/View";

import { ChannelTemplate } from "templates/ChannelTemplate";

/**
 * @ public class ChannelView
 * 
 * The user interface for individual sequencer channels.
 */
export default class ChannelView extends View {
    /* @ The ChannelView template. @override */
    public template: string = ChannelTemplate;

    constructor () {
        super('channel');
    }
}