import { Hash, Collection, IterationHandler } from "core/system/structures/Types";

/**
 * Iterates over the elements in a native Array, invoking a handler function
 * for each element until a non-undefined value is returned or the array ends.
 * If a value is returned by the handler, this function will return that value.
 */
function eachInArray (array: Array<any>, handler: IterationHandler): any {
    return loop(array.length, (i: number) => {
        return handler(array[i], i);
    });
}

/**
 * Iterates over the native properties in a generic key/value pair list, invoking a handler
 * function for each. The handler receives the property value and key name as arguments.
 */
function eachInHash(hash: Hash<any>, handler: IterationHandler): any {
    for (let key in hash) {
        if (hasOwn(hash, key)) {
            let r: any = handler(hash[key], key);

            if (!isUndefined(r)) {
                return r;
            }
        }
    }
}

/**
 * Runs a handler function for a designated number of cycles, halting
 * to return the function's own returned value if not undefined. The handler
 * receives the loop's current iteration counter as an argument.
 */
export function loop (times: number, handler: (i: number) => any): any {
    for (var x = 0 ; x < times ; x++) {
        var r: any = handler(x);

        if (!isUndefined(r)) {
            return r;
        }
    }
}

/**
 * Returns the type of the input value, with the exception of
 * null, which is normalized to "null" instead of "object".
 */
export function typeOf(value: any): any {
    if (value === null) {
        return "null";
    }

    return (typeof value);
}

/**
 * Determines whether a value is of a particular type.
 */
export function isTypeOf(value: any, type: string): boolean {
    return (typeOf(value) === type);
}

/**
 * Determines whether a value is undefined.
 */
export function isUndefined (value: any): boolean {
    return (typeOf(value) === "undefined");
}

/**
 * Determines whether a native Array contains a value.
 */
export function isInArray(array: Array<any>, value: any): boolean {
    return !!eachInArray(array, (element: any): boolean | void => {
        if (element === value) {
            return true;
        }
    });
}

/**
 * Determines whether a generic key/value list contains a property by key name,
 * or whether a native Array contains a particular value.
 */
export function has (target: Collection<any>, value: any): boolean {
    if (target instanceof Array) {
        return isInArray(target, value);
    }

    return (value in target);
}

/**
 * Determines whether a key/value list contains a native property by key name.
 */
export function hasOwn (object: Hash<any>, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(object, key);
}

/**
 * Determines whether any value in an array also exists in a second comparison array.
 */
export function intersects (array1: Array<any>, array2: Array<any>): boolean {
    return !!eachInArray(array1, (element: any): boolean | void => {
        if (isInArray(array2, element)) {
            return true;
        }
    });
}

/**
 * Converts an array-like list structure to a standard Array and returns the Array.
 */
export function toArray (value: any): Array<any> {
    return Array.prototype.slice.call(value, 0);
}

/**
 * Iterates over an iterable collection structure (a generic key/value
 * pair list or an Array), invoking a handler function for each item.
 * Returns the value, if any, first returned within an iteration cycle.
 */
export function each (collection: Collection<any>, handler: IterationHandler): any {
    if (!collection) {
        return;
    }

    if (collection instanceof Array) {
        return eachInArray(collection, handler);
    }

    return eachInHash(collection, handler);
}

export function map<T>(collection: Collection<any>, handler: IterationHandler): T {
    var mappedCollection: T;

    each(collection, (value: any, id: string | number) => {
        mappedCollection[id] = handler(value, id);
    });

    return mappedCollection;
}

/**
 * Creates context-bound functions on an instance using the targeted method names.
 */
export function bindAll (instance: any, ...methodNames: Array<string>) {
    each(methodNames, (methodName: string) => {
        instance[methodName] = instance[methodName].bind(instance);
    });
}

/**
 * Returns {value} if it is not null or undefined, and {defaultValue} otherwise.
 */
export function defaultTo (value: any, defaultValue: any): any {
    if (value === null || isUndefined(value)) {
        return defaultValue;
    }

    return value;
}