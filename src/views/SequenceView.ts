import Viewport from "core/dom/Viewport";
import View from "core/program/View";
import ScrollRegion from "plugins/ui/ScrollRegion";
import SequencerApplication from "applications/SequencerApplication";
import ChannelView from "views/ChannelView";
import Sequence from "classes/Sequence";
import SequenceViewTemplate from "templates/SequenceViewTemplate";

import { bindAll } from "core/system/Utilities";
import { clamp } from "core/system/math/Utilities";
import { TweenAction, Tween } from "core/system/math/tween/Tween";
import { Ease } from "core/system/math/tween/Ease";
import { $, Query } from "core/dom/DOM";
import { ScrollableView, ResizableView } from "plugins/ui/views/Interfaces";

/* The amount of extra scrolling distance to pad the ScrollRegion with. */
const SCROLL_HEIGHT_BUFFER: number = 300;

/* The top margin for the ChannelView pile. */
const CHANNEL_LIST_TOP_MARGIN: number = 75;

/* The height of each ChannelView. */
const CHANNEL_HEIGHT: number = 300;

/* The bottom margin for each ChannelView. */
const CHANNEL_MARGIN: number = 50;

/* The combined height of a ChannelView and the ChannelView bottom margin. */
const CHANNEL_PADDED_HEIGHT : number = CHANNEL_HEIGHT + CHANNEL_MARGIN;

/* The bottom margin for the add channel button when pushed toward the bottom of the page. */
const ADD_BUTTON_BOTTOM_MARGIN: number = 125;

/**
 * The primary sequencer interface.
 */
export default class SequenceView extends View implements ScrollableView, ResizableView {
    /* The Sequence instance coupled to the SequenceView. */
    public sequence: Sequence = new Sequence();

    /**
     * @override
     */
    protected template: string = SequenceViewTemplate;

    /* The top-level SequencerApplication controller. */
    private application: SequencerApplication;

    /* A ScrollRegion instance virtualizing scroll actions on the SequenceView. */
    private scrollRegion: ScrollRegion;

    /* The "add channel" button $(element). */
    private $addChannelButton: Query;

    /* The "add channel" button parent container, used for controlling its position. */
    private $addChannelPanel: Query;

    /* The ChannelView container $(element). */
    private $channelViewContainer: Query;

    /**
     * The last-added ChannelView $(element), saved as a reference for "add channel"" button
     * snapping calculations.
     */
    private $lastChannelView: Query;

    /**
     * The TweenAction associated with the "add channel" button. While running, prevents
     * keepAddChannelButtonSnapped() from overriding the tween position.
     */
    private addChannelButtonTween: TweenAction;

    /**
     * @constructor
     */
    constructor (application: SequencerApplication) {
        super('sequence-view');

        bindAll(this, 'onScroll', 'onResize', 'addChannelView');

        this.application = application;

        Viewport.on('resize', this.onResize);
    }

    /**
     * @override
     */
    public onRender (): void {
        this.$addChannelButton = this.$('.add-channel-button');
        this.$addChannelPanel = this.$addChannelButton.parent();
        this.$channelViewContainer = this.$('#channel-views');

        this.$addChannelButton.on('click', this.addChannelView);
    }

    /**
     * @override
     */
    public onAttach (): void {
        this.createScrollRegionOnAttach();
    }

    /**
     * A handler function to run as the ScrollArea is scrolled.
     * @implements (ScrollableView)
     */
    public onScroll (): void {
        if (!this.$lastChannelView) {
            return;
        }

        this.keepAddChannelButtonSnapped();
    }

    /**
     * A handler function to run as the page resizes.
     * @implements (ResizableView)
     */
    public onResize (): void {
        this.updateScrollRegionArea();
        this.keepAddChannelButtonSnapped();
    }

    /**
     * Adds a new ChannelView to the SequenceView.
     */
    public addChannelView (): void {
        var channelView: ChannelView = new ChannelView(this.sequence);

        channelView.attachTo(this.$channelViewContainer);
        this.onChannelViewAdded(channelView);
    }

    /**
     * Turns the SequenceView into a virtual ScrollRegion.
     */
    private createScrollRegionOnAttach (): void {
        this.scrollRegion = new ScrollRegion(this.$element, this.$channelViewContainer);
    
        this.scrollRegion.configure({
            speed: 0.92
        });

        this.scrollRegion.on('scroll', this.onScroll);
    }

    /**
     * A handler function for newly-added ChannelViews.
     */
    private onChannelViewAdded (channelView: ChannelView): void {
        this.$lastChannelView = channelView.$element;

        this.positionLastChannelViewOnAdded();
        this.revealLastChannelViewOnAdded();
        this.slideAddChannelButtonOnClicked();
        this.updateScrollRegionArea();

        setTimeout(() => {
            this.scrollToChannelView(channelView);
        }, 350);
    }

    /**
     * Sets the top position of a newly-added ChannelView.
     */
    private positionLastChannelViewOnAdded (): void {
        var totalChannels: number = this.sequence.getTotalChannels();
        var channelListHeight: number = (totalChannels - 1) * CHANNEL_PADDED_HEIGHT;
        var newChannelViewTop: number = CHANNEL_LIST_TOP_MARGIN + channelListHeight;

        this.$lastChannelView.css('top', newChannelViewTop + 'px');
    }

    /**
     * Animates a newly added ChannelView into view by removing
     * its "hidden" class on a delay to avoid CSS transition +
     * DOM element insertion race conditions.
     */
    private revealLastChannelViewOnAdded (): void {
        setTimeout(() => {
            this.$lastChannelView.removeClass('hidden');
        }, 50);
    }

    /**
     * Slides the add channel button (via its parent panel container) ttoward the
     * botom of the page after adding a new ChannelView.
     */
    private slideAddChannelButtonOnClicked (): void {
        var addPanelTop: number = this.$addChannelPanel.bounds().top;
        var newAddPanelTop: number = clamp(addPanelTop + CHANNEL_HEIGHT, 0, Viewport.height - ADD_BUTTON_BOTTOM_MARGIN);

        this.addChannelButtonTween = Tween.run({
            start: addPanelTop,
            end: newAddPanelTop,
            duration: 0.55,
            ease: Ease.inOutCubic,
            onUpdate: (top: number) => {
                this.$addChannelPanel.css('top', top + 'px');
            }
        });
    }

    /**
     * Smoothly scrolls to a particular ChannelView.
     */
    private scrollToChannelView (channelView: ChannelView): void {
        var channelViewBottom: number = CHANNEL_LIST_TOP_MARGIN + (channelView.index * CHANNEL_PADDED_HEIGHT);
        var scrollRegionBottom: number = this.scrollRegion.scrollTop + Viewport.height;

        if (channelViewBottom > scrollRegionBottom) {
            var newScrollTop: number = Math.min(channelViewBottom - 1.5 * CHANNEL_PADDED_HEIGHT, this.scrollRegion.maximumScrollTop);

            Tween.run({
                start: this.scrollRegion.scrollTop,
                end: newScrollTop,
                duration: 0.5,
                ease: Ease.inOutQuad,
                onUpdate: (top: number) => {
                    this.scrollRegion.scrollTop = top;
                }
            });
        }
    }

    /**
     * Keeps the add channel button snapped below the last ChannelView if the
     * ScrollRegion scrollTop is close enough to the bottom of its area.
     */
    private keepAddChannelButtonSnapped (): void {
        if (this.scrollRegion.scrollHeight < Viewport.height || this.isAddChannelButtonTweening()) {
            return;
        }

        var lastChannelViewTop: number = this.$lastChannelView.bounds().top;
        var maximumAddPanelTop: number = lastChannelViewTop + CHANNEL_PADDED_HEIGHT - 25;
        var newAddPanelTop: number = Math.min(maximumAddPanelTop, Viewport.height - ADD_BUTTON_BOTTOM_MARGIN);

        this.$addChannelPanel.css('top', newAddPanelTop + 'px');
    }

    /**
     * Updates the ScrollRegion scroll area based on the total number of ChannelViews.
     */
    private updateScrollRegionArea (): void {
        var totalChannels: number = this.sequence.getTotalChannels();
        var scrollHeight: number = SCROLL_HEIGHT_BUFFER + totalChannels * CHANNEL_PADDED_HEIGHT;

        this.scrollRegion.setScrollArea(Viewport.width, scrollHeight);
    }

    /**
     * Determines whether the "add channel" button is in the middle of an animation tween.
     */
    private isAddChannelButtonTweening (): boolean {
        return this.addChannelButtonTween && !this.addChannelButtonTween.isStopped();
    }
}