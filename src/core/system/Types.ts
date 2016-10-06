/**
 * @ public interface Hash<T>
 * 
 * A generic key/value pair list type signature.
 */
export interface Hash<T> {
    [key: string]: T;
}

/**
 * @ public interface Hash<T>
 * 
 * A handler function type signature for Utilities.each().
 */
export interface EachHandler {
    (key: string | number, value: any): any;
}