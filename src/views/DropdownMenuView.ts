import Viewport from "core/dom/Viewport";

import { each } from "core/system/Utilities";
import { Hash } from "core/system/structures/Types";
import { $, Query, DOMEventHandler } from "core/dom/DOM";
import { View } from "core/program/View";

/**
 * Represents a union of the DOMEventHandler type and a DropdownMenuView instance,
 * used as a handler operation bound to each DropdownMenuView option. Options
 * bound with another DropdownMenuView will open a sub-dropdown on mouseover.
 */
type DropdownHandler = DOMEventHandler | DropdownMenuView;

/**
 * A Hash of options for a DropdownMenuView, where each key represents text for
 * the dropdown option, and each value represents the DropdownHandler for that option.
 */
type DropdownMenuBuildConfiguration = Hash<DropdownHandler>;

/**
 * A reusable dropdown menu interface.
 */
export default class DropdownMenuView extends View {
    /**
     * @constructor
     */
    constructor () {
        super('dropdown-menu hidden');
    }

    /**
     * DropdownMenuView attach event handler.
     * @override
     */
    public onAttach (): void {
        this.$target.addClass('dropdown-menu-target')
            .on('click', (e: Event) => {
                this.toggleShowHideMenu();
                e.stopPropagation();
            })
            .on('dropdown:hide', () => {
                this.hideMenu();
            })
            .on('dropdown:show', () => {
                this.showMenu();
            });

        $('body').on('click', (e: Event) => {
            if (this.isExpanded() && !this.element.contains(<Node>e.target)) {
                this.hideMenu();
            }
        });
    }

    /**
     * Sets up the text/handler for each dropdown menu option.
     */
    public build (options: DropdownMenuBuildConfiguration): DropdownMenuView {
        super.render('ul');

        each(options, (handler: DropdownHandler, text: string) => {
            let option: Element = this.makeMenuOptionElement(text, handler);

            this.$element.append(option);
        });

        return this;
    }

    /**
     * Configures the dropdown menu to behave as a sub-dropdown of another dropdown menu.
     */
    public setAsSubMenu (): void {
        this.$element.addClass('sub-dropdown');

        this.$target.removeClass('dropdown-menu-target')
            .off('click dropdown:hide dropdown:show')
            .on('mouseenter', () => {
                this.alignSubMenuBeforeShow();
                setTimeout(() => {
                    this.showMenu();
                }, 50);
            })
            .on('mouseleave', () => {
                this.hideMenu();
            });
    }

    /**
     * Determines whether or not the dropdown menu is expanded.
     */
    private isExpanded (): boolean {
        return this.$target.hasClass('expanded');
    }

    /**
     * Creates and returns an Element for a dropdown menu option.
     */
    private makeMenuOptionElement (text: string, handler: DropdownHandler): Element {
        var option: Element = document.createElement('li');

        if (!handler) {
            return $(option).addClass('divider')
                .element(0);
        }

        $(option).html(text)
            .addClass('dropdown-option');

        if (handler instanceof DropdownMenuView) {
            handler.attachTo(option);
            handler.setAsSubMenu();
        } else {
            $(option).on('click', handler);
        }

        return option;
    }

    /**
     * Aligns a sub-dropdown menu to its parent dropdown menu option.
     */
    private alignSubMenuBeforeShow (): void {
        this.$element.addClass('align')
            .removeClass('sub-dropdown-left');

        var bounds: any = this.$element.bounds();

        if (bounds.right > Viewport.width) {
            this.$element.addClass('sub-dropdown-left');
        }

        this.$element.removeClass('align');
    }

    /**
     * Alternately shows and hides the dropdown menu.
     */
    private toggleShowHideMenu (): void {
        if (this.isExpanded()) {
            this.hideMenu();
        } else {
            this.showMenu();
        }
    }

    /**
     * Shows the dropdown menu.
     */
    private showMenu (): void {
        this.$element.removeClass('hidden');
        this.$target.addClass('expanded');
    }

    /**
     * Hides the dropdown menu.
     */
    private hideMenu (): void {
        this.$element.addClass('hidden');
        this.$target.removeClass('expanded');
    }
}