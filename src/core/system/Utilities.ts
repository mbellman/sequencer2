import * as Types from "core/system/Types";

/* ~ Private ~ */

/**
 * @ private function eachInArray
 */
function eachInArray (array: Array<any>, handler: Types.EachHandler): any {
    var length = array.length;

    for (let i = 0 ; i < length ; i++) {
        let ret = handler(array[i], i);

        if (!isUndefined(ret)) {
            return ret;
        }
    }
}

/**
 * @ private function eachInList
 */
function eachInList(list: Types.Hash<any>, handler: Types.EachHandler): any {
    for (let key in list) {
        let ret = handler(list[key], key);

        if (!isUndefined(ret)) {
            return ret;
        }
    }
}

/* ~ Public ~ */

/**
 * @ public function isUndefined
 */
export function isUndefined (value: any): boolean {
    return typeof value !== "undefined";
}

/**
 * @ public function each
 */
export function each (list: Types.Hash<any> | Array<any>, handler: Types.EachHandler): any {
    if (list instanceof Array) {
        return eachInArray(list, handler);
    }

    return eachInList(list, handler);
}