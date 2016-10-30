import $ from "core/dom/Query";
import View from "core/program/View";
import SequencerApplication from "applications/SequencerApplication";
import DropdownMenuView from "views/DropdownMenuView";

/**
 * @ public class SequencerMenuView
 * 
 * The user interface for the sequencer's top menu bar.
 */
export default class SequencerMenuView extends View {
    /* @ The SequencerApplication instance the SequencerMenuView is added to. */
    private application: SequencerApplication;

    constructor (application: SequencerApplication) {
        super('sequence-menu-view');

        this.application = application;
    }

    /**
     * SequencerMenuView render event handler.
     * @override
     */
    public onRender (): void {
        this.addOption('File', this.makeFileDropdownMenu());
        this.addOption('Options', this.makeOptionsDropdownMenu());
        this.addOption('Theme', this.makeThemeDropdownMenu());

        this.$element.on('mouseover -> .menu-option', (e: MouseEvent) => {
            if (this.anyDropdownExpanded()) {
                this.hideAllDropdowns();
                $(<Element>e.target).trigger('dropdown:show');
            }
        });
    }

    /**
     * Determines whether any dropdown menus are expanded within the SequencerMenuView.
     */
    private anyDropdownExpanded (): boolean {
        return this.$('.dropdown-menu-target').hasClass('expanded');
    }

    /**
     * Hides all dropdown menus within the SequencerMenuView.
     */
    private hideAllDropdowns (): void {
        this.$('.dropdown-menu-target').trigger('dropdown:hide');
    }

    /**
     * Adds a new option to the menu.
     */
    private addOption (text: string, dropdownMenu: DropdownMenuView = null): void {
        var option: Element = this.makeOptionElement(text);

        this.$element.append(option);

        if (dropdownMenu) {
            dropdownMenu.attachTo(option);
        }
    }

    /**
     * Creates and returns an Element for a menu option.
     */
    private makeOptionElement (text: string): Element {
        var option: Element = document.createElement('div');

        $(option).html(text)
            .attr('class', 'menu-option pointer');

        return option;
    }

    /**
     * Creates the DropdownMenuView for "File".
     */
    private makeFileDropdownMenu (): DropdownMenuView {
        return new DropdownMenuView()
            .configure({
                'New': () => {},
                'Open': () => {},
                'Save': () => {},
                '-1-': null,
                'Play': () => {}
            });
    }

    /**
     * Creates the DropdownMenuView for "Options".
     */
    private makeOptionsDropdownMenu (): DropdownMenuView {
        return new DropdownMenuView()
            .configure({
                'Option 1': () => {},
                'Option 2': () => {},
                'Option 3': () => {},
                'Option 4': () => {},
                'Option 5': new DropdownMenuView().configure({
                    'Test': () => {},
                    'Test 2': () => {},
                    '-1-': null,
                    'Test 3': () => {},
                    'Test 4': new DropdownMenuView().configure({
                        'Whoa': () => {},
                        'Hey': () => {}
                    })
                })
            });
    }

    /**
     * Creates the DropdownMenuView for "Theme".
     */
    private makeThemeDropdownMenu (): DropdownMenuView {
        return new DropdownMenuView()
            .configure({
                'Main': () => {
                    this.application.setTheme('main')
                },
                'Night': () => {
                    this.application.setTheme('night')
                }
            });
    }
}