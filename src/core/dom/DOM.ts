/**
 * @ public class DOM
 * 
 * Convenience methods for DOM manipulation.
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
     * Removes a child node from a document Element.
     */
    public static remove (element: Element, node: Element): void {
        element.removeChild(node);
    }
}