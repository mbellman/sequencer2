import Viewport from "core/dom/Viewport";
import Tween from "core/system/math/tween/Tween";
import ScrollRegion from "core/dom/ui/ScrollRegion";
import SequencerApplication from "applications/SequencerApplication";
import ChannelView from "views/ChannelView";
import Sequence from "classes/Sequence";
import SequenceViewTemplate from "templates/SequenceViewTemplate";

import { bindAll } from "core/system/Utilities";
import { clamp } from "core/system/math/Utilities";
import { Ease } from "core/system/math/tween/Ease";
import { $, Query } from "core/dom/DOM";
import { View, Resizable, Scrollable } from "core/program/View";

/* The amount of extra scrolling distance to pad the ScrollRegion with. */
const SCROLL_HEIGHT_BUFFER: number = 300;

/* The top margin for the ChannelView pile. */
const CHANNEL_LIST_TOP_MARGIN: number = 75;

/* The height of each ChannelView. */
const CHANNEL_HEIGHT: number = 300;

/* The bottom margin for each ChannelView. */
const CHANNEL_MARGIN: number = 50;

/* The combined height of a ChannelView and the ChannelView bottom margin. */
const CHANNEL_TOTAL_HEIGHT: number = CHANNEL_HEIGHT + CHANNEL_MARGIN;

/* The bottom margin for the add channel button when pushed toward the bottom of the page. */
const ADD_BUTTON_BOTTOM_MARGIN: number = 150;

/**
 * The primary sequencer interface.
 */
export default class SequenceView extends View implements Scrollable, Resizable {
    /* The Sequence instance coupled to the SequenceView. */
    public sequence: Sequence = new Sequence();

    /* A ScrollRegion instance virtualizing scroll actions on the SequenceView. */
    public scrollRegion: ScrollRegion;

    /* @override */
    protected template: string = SequenceViewTemplate;

    /* The SequencerApplication instance the SequenceView is added to. */
    private application: SequencerApplication;

    /* The add channel button $(element). */
    private $addChannelButton: Query;

    /* The ChannelView list container $(element). */
    private $channelViews: Query;

    /**
     * The last-added ChannelView $(element), saved as a reference for add channel button
     * snapping calculations.
     */
    private $lastChannelView: Query;

    /**
     * @constructor
     */
    constructor (application: SequencerApplication) {
        super('sequence-view');
        bindAll(this, 'onScroll', 'onResize');

        this.application = application;

        Viewport.on('resize', this.onResize);
    }

    /**
     * @override
     */
    public onRender (): void {
        this.$addChannelButton = this.$('.add-channel-button');
        this.$channelViews = this.$('#channel-views');

        this.$addChannelButton.on('click', () => {
            this.addChannelView();
        });
    }

    /**
     * @override
     */
    public onAttach (): void {
        this.createScrollRegion();
    }

    /**
     * A handler function to run as the ScrollArea is scrolled.
     * @implements (Scrollable)
     */
    public onScroll (): void {
        if (!this.$lastChannelView) {
            return;
        }

        this.keepAddChannelButtonSnapped();
    }

    /**
     * A handler function to run as the page resizes.
     * @implements (Resizable)
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

        channelView.attachTo(this.$channelViews);

        this.positionChannelView(channelView);
        this.animateInChannelView(channelView);
        this.slideAddChannelButton();
        this.updateScrollRegionArea();

        this.$lastChannelView = channelView.$element;
    }

    /**
     * Keeps the add channel button snapped below the last ChannelView if the
     * ScrollArea scrollTop is close enough to the bottom of its range.
     */
    private keepAddChannelButtonSnapped (): void {
        if (this.scrollRegion.scrollHeight < Viewport.height) {
            return;
        }

        var $addPanel: Query = this.$addChannelButton.parent();
        var lastChannelTop: number = this.$lastChannelView.bounds().top;
        var maximumAddPanelTop: number = lastChannelTop + CHANNEL_TOTAL_HEIGHT - 25;
        var newTop: number = Math.min(maximumAddPanelTop, Viewport.height - ADD_BUTTON_BOTTOM_MARGIN);

        $addPanel.css('top', newTop + 'px');
    }

    /**
     * Turns the SequenceView into a virtual ScrollRegion.
     */
    private createScrollRegion (): void {
        var width: number = this.$element.bounds().width;
        var height: number = 0;

        this.scrollRegion = new ScrollRegion(this.$element, this.$channelViews, width, height);
    
        this.scrollRegion.configure({
            speed: 0.92
        });

        this.scrollRegion.on('scroll', this.onScroll);
    }

    /**
     * Updates the ScrollArea scroll range based on the total number of ChannelViews.
     */
    private updateScrollRegionArea (): void {
        var totalChannels: number = this.sequence.getTotalChannels();
        var scrollHeight: number = SCROLL_HEIGHT_BUFFER + totalChannels * CHANNEL_TOTAL_HEIGHT;

        this.scrollRegion.setScrollArea(Viewport.width, scrollHeight);
    }

    /**
     * Sets the top position of a newly added ChannelView.
     */
    private positionChannelView (channelView: ChannelView): void {
        var totalChannels: number = this.sequence.getTotalChannels();
        var newTop: number = CHANNEL_LIST_TOP_MARGIN + (totalChannels - 1) * CHANNEL_TOTAL_HEIGHT;

        channelView.$element.css('top', newTop + 'px');
    }

    /**
     * Animates a newly added ChannelView into view by removing
     * its "hidden" class on a delay to avoid CSS transition +
     * DOM element insertion race conditions.
     */
    private animateInChannelView (channelView: ChannelView): void {
        setTimeout(() => {
            channelView.$element.removeClass('hidden');
        }, 50);
    }

    /**
     * Slides the add channel button (via its parent panel container) to its new
     * position, out of the way of the added ChannelView(s).
     */
    private slideAddChannelButton (): void {
        var $addPanel = this.$addChannelButton.parent();
        var addPanelTop: number = $addPanel.bounds().top;
        var newTop: number = clamp(addPanelTop + CHANNEL_HEIGHT, 0, Viewport.height - ADD_BUTTON_BOTTOM_MARGIN);

        Tween.run({
            start: addPanelTop,
            end: newTop,
            duration: 0.55,
            ease: Ease.inOutCubic,
            onUpdate: (v: number) => {
                $addPanel.css('top', v + 'px');
            }
        });
    }
}