import Viewport from "core/dom/Viewport";
import View from "core/program/View";
import Tween from "core/tween/Tween";
import SequencerApplication from "applications/SequencerApplication";
import ChannelView from "views/ChannelView";
import Sequence from "classes/Sequence";

import { Query } from "core/dom/Query";
import { Ease } from "core/tween/Ease";
import { SequenceViewTemplate } from "templates/SequenceViewTemplate";

/**
 * @ public class SequenceView
 */
export default class SequenceView extends View {
    /* @ The SequenceView template. @override */
    protected template: string = SequenceViewTemplate;

    /* @ The Sequence instance coupled to the SequenceView. */
    public sequence: Sequence = new Sequence();
    /* @ The SequencerApplication instance the SequenceView is added to. */
    private application: SequencerApplication;
    /* @ A Query reference to the SequenceView's add channel button. */
    private $addChannelButton: Query;
    /* @ A Query reference to the ChannelView container. */
    private $channels: Query;

    constructor (application: SequencerApplication) {
        super('channel-list');

        this.application = application;
    }

    /**
     * SequenceView render event handler.
     * @override
     */
    public onRender (): void {
        this.$addChannelButton = this.$('.add-channel-button');
        this.$channels = this.$('#channels');

        this.$addChannelButton.on('click', () => {
            this.addChannel();
        });
    }

    /**
     * Adds a new ChannelView to the SequenceView.
     */
    public addChannel (): void {
        var channelView: ChannelView = new ChannelView(this.sequence);

        channelView.attachTo(this.$channels);
        this.updateAddChannelButton();
    }

    /**
     * Slides the add channel button to a new position, out of the way
     * of the added ChannelView(s).
     */
    private updateAddChannelButton (): void {
        var $panel = this.$addChannelButton.parent();
        var totalChannels: number = this.sequence.getTotalChannels();
        var currentPosition: number = $panel.bounds().top;
        var newPosition: number = currentPosition + 300;

        if (newPosition > Viewport.height - 150) {
            newPosition = Viewport.height - 150;

            /*
            TODO:
            if ( button is locked to bottom ) {
                // scroll to new ChannelView
            }
            */
        }

        Tween.run({
            start: currentPosition,
            end: newPosition,
            duration: 0.6,
            ease: Ease.cubeInOut,
            onUpdate: (v: number) => {
                $panel.css('top', v + 'px');
            },
            onComplete: () => {

            }
        });
    }
}