import View from "core/application/View";

import { ChannelTemplate } from "templates/ChannelTemplate";

/**
 * @ public class ChannelView
 * 
 * A user interface for individual sequencer channels.
 */
export default class ChannelView extends View {
    public template: string = ChannelTemplate;
}