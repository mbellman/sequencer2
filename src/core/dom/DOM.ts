/**
 * @ public class DOM
 * 
 * Convenience methods for DOM access/manipulation.
 */
export default class DOM {
    /**
     * Creates and returns a new document Element.
     */
    public static create (type: string, innerHTML: string = ''): Element {
        var element: Element = document.createElement(type);
        element.innerHTML = innerHTML;

        return element;
    }

    /**
     * Returns a document Element by its ID attribute.
     */
    public static getById (id: string): Element {
        return document.getElementById(id);
    }
}