import View from "core/program/View";

import { MenuBarTemplate } from "templates/MenuBarTemplate";

/**
 * @ public class MenuBarView
 * 
 * The user interface for the top menu bar.
 */
export default class MenuBarView extends View {
    /* @ The MenuBarView template. @override */
    public template: string = MenuBarTemplate;

    constructor () {
        super('menu-bar');
    }
}