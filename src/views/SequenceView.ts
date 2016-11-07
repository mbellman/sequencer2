import Viewport from "core/dom/Viewport";
import View from "core/program/View";
import ScrollRegion from "plugins/ui/ScrollRegion";
import Sequence from "classes/Sequence";
import SequencerApplication from "applications/SequencerApplication";
import ChannelView from "views/ChannelView";
import SequenceViewTemplate from "templates/SequenceViewTemplate";

import { each, bindAll } from "core/system/Utilities";
import { clamp } from "core/system/math/Utilities";
import { Direction } from "core/system/math/Geometry";
import { TweenAction, Tween } from "core/system/math/tween/Tween";
import { Ease } from "core/system/math/tween/Ease";
import { $, Query } from "core/dom/DOM";
import { ScrollableView, ResizableView } from "plugins/ui/views/Interfaces";

/* The amount of extra scrolling distance to pad the ScrollRegion with. */
const SCROLL_HEIGHT_PADDING: number = 300;

/* The top margin for the ChannelView pile. */
const CHANNEL_LIST_TOP_MARGIN: number = 75;

/* The bottom margin for each ChannelView. */
const CHANNEL_MARGIN: number = 50;

/**
 * A value used in determining which ChannelViews are visible on-screen. If the pixel height of the
 * visible portion of a ChannelView is less than this limit, it will not be considered as on-screen.
 */
const CHANNEL_CLIPPING_LIMIT: number = 10;

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

    /* The button panel container $(element) housing various UI buttons. */
    private $buttonPanel: Query;

    /* The ChannelView list container $(element). */
    private $channelViewContainer: Query;

    /* An array of ChannelViews added to the ChannelView list. */
    private channelViews: Array<ChannelView> = [];

    /* A ScrollRegion instance virtualizing scroll actions on the SequenceView. */
    private scrollRegion: ScrollRegion;

    /* The current expanded/compressed height for each ChannelView. */
    private channelViewHeight: number = 300;

    /**
     * The TweenAction associated with the "add channel" button. While running, prevents
     * keepButtonPanelSnapped() from overriding the tween position.
     */
    private buttonPanelTween: TweenAction;

    /* The TweenAction associated with ScrollRegion tweens. */
    private scrollTween: TweenAction;

    /**
     * @constructor
     */
    constructor (application: SequencerApplication) {
        super('sequence-view');

        bindAll(this, 'onScroll', 'onResize', 'addChannelView', 'expandChannelViews', 'compressChannelViews', 'scrollUpOneChannelView', 'scrollDownOneChannelView');

        this.application = application;

        Viewport.on('resize', this.onResize);
    }

    /**
     * @override
     */
    public onRender (): void {
        this.$buttonPanel = this.$('.button-panel');
        this.$channelViewContainer = this.$('#channel-views');

        this.hideElementsOnRender();
        this.bindButtonPanelEventsOnRender();
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
        if (this.channelViews.length === 0) {
            return;
        }

        this.keepButtonPanelSnapped();
    }

    /**
     * A handler function to run as the page resizes.
     * @implements (ResizableView)
     */
    public onResize (): void {
        this.resizeScrollRegionArea();
        this.updateChannelViewsOnResize();
        this.keepButtonPanelSnapped();
    }

    /**
     * Adds a new ChannelView to the SequenceView.
     */
    public addChannelView (): void {
        var channelView: ChannelView = new ChannelView(this.sequence);

        channelView.attachTo(this.$channelViewContainer);

        this.channelViews.push(channelView);
        this.onChannelViewAdded(channelView);
    }

    /**
     * Expands the vertical height of each ChannelView.
     */
    public expandChannelViews (): void {
        console.log('expand');
    }

    /**
     * Compresses the vertical height of each ChannelView.
     */
    public compressChannelViews (): void {
        console.log('compress');
    }

    /**
     * Scrolls to the next above ChannelView.
     */
    public scrollUpOneChannelView (): void {
        this.scrollOneChannelView(Direction.UP);
    }

    /**
     * Scrolls to the next below ChannelView.
     */
    public scrollDownOneChannelView (): void {
        this.scrollOneChannelView(Direction.DOWN);
    }

    /**
     * Returns the $(element) for the last ChannelView in the list.
     */
    private getLastChannelViewQuery (): Query {
        return this.channelViews[this.channelViews.length - 1].$element;
    }

    /**
     * Returns a subset of the {channelViews} array comprising only ChannelViews visible
     * within the viewport boundary.
     */
    private getOnScreenChannelViews (): Array<ChannelView> {
        var scrollTop: number = this.scrollRegion.scrollTop;
        var views: Array<ChannelView> = [];

        for (var i = 0 ; i < this.channelViews.length ; i++) {
            let channelView: ChannelView = this.channelViews[i];
            let channelViewTop: number = this.getChannelViewTop(channelView);
            let channelViewBottom: number = channelViewTop + this.channelViewHeight;

            if (
                channelViewBottom - CHANNEL_MARGIN - CHANNEL_CLIPPING_LIMIT > scrollTop &&
                channelViewTop + CHANNEL_CLIPPING_LIMIT < scrollTop + Viewport.height
            ) {
                views.push(channelView);
            }
        }

        return views;
    }

    /**
     * Returns the total padded height of each ChannelView, counting its base height and margin.
     */
    private getChannelViewPaddedHeight (): number {
        return this.channelViewHeight + CHANNEL_MARGIN;
    }

    /**
     * Returns the top offset of a particular ChannelView within the ScrollRegion.
     */
    private getChannelViewTop (channelView: ChannelView): number {
        return CHANNEL_LIST_TOP_MARGIN + channelView.index * this.getChannelViewPaddedHeight();
    }

    /**
     * A handler function for adding a new ChannelView.
     */
    private onChannelViewAdded (channelView: ChannelView): void {
        this.positionLastChannelViewOnAdded();
        this.revealLastChannelViewOnAdded();
        this.slideButtonPanelOnAddButtonClicked();
        this.resizeScrollRegionArea();
        this.showElementsOnChannelViewAdded();

        setTimeout(() => {
            this.scrollToChannelView(channelView);
        }, 350);
    }

    /**
     * Hides specific View elements on the initial rendering, to be revealed later.
     */
    private hideElementsOnRender (): void {
        this.$buttonPanel.find('.button-column').hide();
    }

    /**
     * Sets up click bindings on the button panel buttons.
     */
    private bindButtonPanelEventsOnRender (): void {
        this.$buttonPanel
            .find('.add-channel')
                .on('click', this.addChannelView).pop()
            .find('.button.expand')
                .on('click', this.expandChannelViews).pop()
            .find('.button.compress')
                .on('click', this.compressChannelViews).pop()
            .find('.button.up')
                .on('click', this.scrollUpOneChannelView).pop()
            .find('.button.down')
                .on('click', this.scrollDownOneChannelView);
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
     * Sets the top position of a newly-added ChannelView.
     */
    private positionLastChannelViewOnAdded (): void {
        var channelListHeight: number = (this.channelViews.length - 1) * this.getChannelViewPaddedHeight();
        var newChannelViewTop: number = CHANNEL_LIST_TOP_MARGIN + channelListHeight;

        this.getLastChannelViewQuery().css('top', newChannelViewTop + 'px');
    }

    /**
     * Animates a newly added ChannelView into view by removing its "hidden" class on a delay
     * to avoid CSS transition + DOM element insertion race conditions.
     */
    private revealLastChannelViewOnAdded (): void {
        setTimeout(() => {
            this.getLastChannelViewQuery().removeClass('hidden');
        }, 50);
    }

    /**
     * Shows specific View elements once the necessary total channel thresholds are met.
     */
    private showElementsOnChannelViewAdded (): void {
        var totalChannels: number = this.channelViews.length;

        if (totalChannels === 1) {
            this.$buttonPanel.find('.button-column.resize').fadeIn();
        } else if (totalChannels === 2) {
            this.$buttonPanel.find('.button-column.jump').fadeIn();
        }
    }

    /**
     * Manually triggers the resize handler for each ChannelView whenever the viewport is resized.
     */
    private updateChannelViewsOnResize (): void {
        each(this.channelViews, (channelView: ChannelView) => {
            channelView.onResize();
        });
    }

    /**
     * Slides the button panel toward the bottom of the page after adding a new ChannelView.
     */
    private slideButtonPanelOnAddButtonClicked (): void {
        if (this.isButtonPanelTweening()) {
            this.buttonPanelTween.stop();
        }

        var buttonPanelTop: number = this.$buttonPanel.bounds().top;
        var topReduction: number = this.channelViews.length === 1 ? 40 : 0;
        var newButtonPanelTop: number = Math.min(buttonPanelTop + this.getChannelViewPaddedHeight(), Viewport.height - ADD_BUTTON_BOTTOM_MARGIN);

        this.buttonPanelTween = Tween.run({
            start: buttonPanelTop,
            end: newButtonPanelTop - topReduction,
            duration: 0.55,
            ease: Ease.inOutCubic,
            onUpdate: (top: number) => {
                this.$buttonPanel.css('top', top + 'px');
            }
        });
    }

    /**
     * Smoothly scrolls to a particular ChannelView.
     */
    private scrollToChannelView (channelView: ChannelView): void {
        if (this.isScrollTweening()) {
            this.scrollTween.stop();
        }

        var channelViewTop: number = this.getChannelViewTop(channelView);
        var newScrollTop: number = channelViewTop - 1.5 * CHANNEL_MARGIN;
        var clampedScrollTop: number = clamp(newScrollTop, 0, this.scrollRegion.maximumScrollTop);

        this.scrollTween = Tween.run({
            start: this.scrollRegion.scrollTop,
            end: clampedScrollTop,
            duration: 0.5,
            ease: Ease.inOutQuad,
            onUpdate: (top: number) => {
                this.scrollRegion.scrollTop = top;
            }
        });
    }

    /**
     * Scrolls to the next ChannelView in a particular direction.
     */
    private scrollOneChannelView (direction: Direction): void {
        var onScreenChannelViews: Array<ChannelView> = this.getOnScreenChannelViews();
        var firstOnScreenIndex: number = onScreenChannelViews[0].index;
        var targetIndex: number = firstOnScreenIndex + (direction === Direction.UP ? -1 : 1);

        if (direction === Direction.UP && onScreenChannelViews[0].$element.bounds().top < 0) {
            // If scrolling up, and if the first on-screen ChannelView is partially clipped
            // at the top, scroll to that one instead of the ChannelView above it.
            targetIndex += 1;
        }

        var clampedTargetIndex: number = clamp(targetIndex, 0, this.channelViews.length - 1);

        this.scrollToChannelView(this.channelViews[clampedTargetIndex]);
    }

    /**
     * Keeps the button panel snapped below the last ChannelView if the ScrollRegion scrollTop
     * is close enough to the bottom of its area.
     */
    private keepButtonPanelSnapped (): void {
        if (this.scrollRegion.scrollHeight < Viewport.height || this.isButtonPanelTweening()) {
            return;
        }

        var lastChannelViewTop: number = this.getLastChannelViewQuery().bounds().top;
        var maximumButtonPanelTop: number = lastChannelViewTop + this.getChannelViewPaddedHeight() - 25;
        var newButtonPanelTop: number = Math.min(maximumButtonPanelTop, Viewport.height - ADD_BUTTON_BOTTOM_MARGIN);

        this.$buttonPanel.css('top', newButtonPanelTop + 'px');
    }

    /**
     * Resizes the ScrollRegion scroll area based on the total number of ChannelViews.
     */
    private resizeScrollRegionArea (): void {
        var totalChannels: number = this.channelViews.length;
        var scrollHeight: number = SCROLL_HEIGHT_PADDING + totalChannels * this.getChannelViewPaddedHeight();

        this.scrollRegion.setScrollArea(Viewport.width, scrollHeight);
    }

    /**
     * Determines whether {buttonPanelTween} is currently active.
     */
    private isButtonPanelTweening (): boolean {
        return this.buttonPanelTween && !this.buttonPanelTween.isStopped();
    }

    /**
     * Determines whether {scrollTween} is currently active.
     */
    private isScrollTweening (): boolean {
        return this.scrollTween && !this.scrollTween.isStopped();
    }
}