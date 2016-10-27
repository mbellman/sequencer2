/**
 * @ private class DOMElement
 * 
 * Provides tools for single-element manipulation.
 */
class DOMElement {
    /* @ The document Element tied to the instance. */
    private element: HTMLElement;

    constructor (element: Element) {
        this.element = <HTMLElement>element;
    }

    /**
     * Sets an attribute on the Element.
     */
    public attr (attribute: string, value: string): DOMElement {
        this.element.setAttribute(attribute, value);

        return this;
    }

    /**
     * Sets a CSS property on the Element.
     */
    public css (property: string, value: string): DOMElement {
        this.element.style[property] = value;

        return this;
    }
}

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

    /**
     * Returns a DOMElement instance wrapping a document Element.
     */
    public static $ (element: Element): DOMElement {
        return new DOMElement(element);
    }
}