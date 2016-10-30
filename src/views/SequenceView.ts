import $ from "core/dom/Query";
import Viewport from "core/dom/Viewport";
import ScrollArea from "core/dom/ScrollArea";
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
    private $channelContainer: Query;
    /* @ A ScrollArea virtualizing scroll actions on the SequenceView. */
    private scrollArea: ScrollArea;

    constructor (application: SequencerApplication) {
        super('sequence-view');

        this.application = application;
    }

    /**
     * SequenceView render event handler.
     * @override
     */
    public onRender (): void {
        this.$addChannelButton = this.$('.add-channel-button');
        this.$channelContainer = this.$('#channels');

        this.$addChannelButton.on('click', () => {
            this.addChannel();
        });
    }

    /**
     * SequenceView attach event handler.
     * @override
     */
    public onAttach (): void {
        this.createScrollArea();
    }

    /**
     * Adds a new ChannelView to the SequenceView.
     */
    public addChannel (): void {
        var channelView: ChannelView = new ChannelView(this.sequence);

        channelView.attachTo(this.$channelContainer);
        this.positionNewChannelView(channelView);
        this.revealNewChannelView(channelView);
        this.slideAddChannelButton();
    }

    private createScrollArea (): void {
        var width: number = this.$element.bounds().width;
        var height: number = 2000;

        this.scrollArea = new ScrollArea(this.$element, this.$channelContainer, width, height);
    }

    /**
     * Sets the top position of a newly added ChannelView.
     */
    private positionNewChannelView (channelView: ChannelView): void {
        var totalChannels: number = this.sequence.getTotalChannels();
        var topPosition: number = 75 + (totalChannels - 1) * 350;

        channelView.$element.css('top', topPosition + 'px');
    }

    /**
     * Animates a newly added ChannelView into view by removing
     * its "hidden" class on a delay to avoid CSS transition +
     * DOM element insertion race conditions.
     */
    private revealNewChannelView (channelView: ChannelView): void {
        setTimeout(() => {
            channelView.$element.removeClass('hidden');
        }, 50);
    }

    /**
     * Slides the add channel button to its new position, out of the way
     * of the added ChannelView(s).
     */
    private slideAddChannelButton (): void {
        var $panel = this.$addChannelButton.parent();
        var totalChannels: number = this.sequence.getTotalChannels();
        var currentTopPosition: number = $panel.bounds().top;
        var newTopPosition: number = currentTopPosition + 300;

        if (newTopPosition > Viewport.height - 150) {
            newTopPosition = Viewport.height - 150;

            /*
            TODO:
            if ( button is locked to bottom ) {
                // scroll to new ChannelView
            }
            */
        }

        Tween.run({
            start: currentTopPosition,
            end: newTopPosition,
            duration: 0.55,
            ease: Ease.inOutCubic,
            onUpdate: (v: number) => {
                $panel.css('top', v + 'px');
            },
            onComplete: () => {

            }
        });
    }
}