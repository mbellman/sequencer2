import $ from "core/dom/Query";
import Viewport from "core/dom/Viewport";
import ScrollArea from "core/dom/ScrollArea";
import View from "core/program/View";
import Tween from "core/tween/Tween";
import SequencerApplication from "applications/SequencerApplication";
import ChannelView from "views/ChannelView";
import Sequence from "classes/Sequence";

import { bindAll } from "core/system/Utilities";
import { clamp } from "core/system/Math";
import { Query } from "core/dom/Query";
import { Ease } from "core/tween/Ease";
import { SequenceViewTemplate } from "templates/SequenceViewTemplate";

/**
 * @ private const SCROLL_HEIGHT_BUFFER
 * 
 * The amount of extra scrolling distance to pad the ScrollArea with.
 */
const SCROLL_HEIGHT_BUFFER: number = 300;

/**
 * @ private const CHANNEL_LIST_TOP_MARGIN
 * 
 * The top margin for the ChannelView pile.
 */
const CHANNEL_LIST_TOP_MARGIN: number = 75;

/**
 * @ private const CHANNEL_HEIGHT
 * 
 * The height of each ChannelView.
 */
const CHANNEL_HEIGHT: number = 300;

/**
 * @ private const CHANNEL_MARGIN
 * 
 * The bottom margin for each ChannelView.
 */
const CHANNEL_MARGIN: number = 50;

/**
 * @ private const CHANNEL_TOTAL_HEIGHT
 * 
 * The combined height of a ChannelView and the ChannelView bottom margin.
 */
const CHANNEL_TOTAL_HEIGHT: number = CHANNEL_HEIGHT + CHANNEL_MARGIN;

/**
 * @ private const ADD_BUTTON_BOTTOM_MARGIN
 * 
 * The bottom margin for the add channel button when pushed toward the bottom of the page.
 */
const ADD_BUTTON_BOTTOM_MARGIN: number = 150;

/**
 * @ public class SequenceView
 * 
 * The primary sequencer interface.
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
    /* @ A Query reference to the ChannelView group container. */
    private $channelContainer: Query;
    /* @ A Query reference to the last-added ChannelView element. */
    private $lastChannelView: Query;
    /* @ A ScrollArea virtualizing scroll actions on the SequenceView. */
    private scrollArea: ScrollArea;

    constructor (application: SequencerApplication) {
        super('sequence-view');
        bindAll(this, 'onScroll', 'onPageResize');

        this.application = application;

        Viewport.onResize(this.onPageResize);
    }

    /**
     * SequenceView render event handler.
     * @override
     */
    public onRender (): void {
        this.$addChannelButton = this.$('.add-channel-button');
        this.$channelContainer = this.$('#channels');

        this.$addChannelButton.on('click', () => {
            this.addChannelView();
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
    public addChannelView (): void {
        var channelView: ChannelView = new ChannelView(this.sequence);

        channelView.attachTo(this.$channelContainer);
        this.positionChannelView(channelView);
        this.animateInChannelView(channelView);
        this.slideAddChannelButton();
        this.updateScrollRange();

        this.$lastChannelView = channelView.$element;
    }

    /**
     * A handler function to run as the ScrollArea is scrolled.
     */
    private onScroll (): void {
        if (!this.$lastChannelView) {
            return;
        }

        this.keepAddChannelButtonSnapped();
    }

    /**
     * A handler function to run as the page resizes.
     */
    private onPageResize (): void {
        this.updateScrollRange();
        this.keepAddChannelButtonSnapped();
    }

    /**
     * Keeps the add channel button snapped below the last ChannelView if the
     * ScrollArea scrollTop is close enough to the bottom of its range.
     */
    private keepAddChannelButtonSnapped (): void {
        if (this.scrollArea.scrollHeight < Viewport.height) {
            return;
        }

        var $addPanel: Query = this.$addChannelButton.parent();
        var lastChannelTop: number = this.$lastChannelView.bounds().top;
        var maxAddPanelTop: number = lastChannelTop + CHANNEL_TOTAL_HEIGHT - 25;
        var newTop: number = Math.min(maxAddPanelTop, Viewport.height - ADD_BUTTON_BOTTOM_MARGIN);

        $addPanel.css('top', newTop + 'px');
    }

    /**
     * Turns the SequenceView into a virtual ScrollArea.
     */
    private createScrollArea (): void {
        var width: number = this.$element.bounds().width;
        var height: number = 0;

        this.scrollArea = new ScrollArea(this.$element, this.$channelContainer, width, height);
    
        this.scrollArea.onScroll(this.onScroll);
    }

    /**
     * Updates the ScrollArea scroll range based on the total number of ChannelViews.
     */
    private updateScrollRange (): void {
        var totalChannels: number = this.sequence.getTotalChannels();
        var scrollHeight: number = SCROLL_HEIGHT_BUFFER + totalChannels * CHANNEL_TOTAL_HEIGHT;

        this.scrollArea.setScrollRange(Viewport.width, scrollHeight);
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
        var totalChannels: number = this.sequence.getTotalChannels();
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