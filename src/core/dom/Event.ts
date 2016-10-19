import { ParsedEvent } from "core/system/Types";

/**
 * @ public function parseEventName
 * 
 * Parses an event string and returns a Hash containing the event's name
 * and its period-delimited namespace where applicable.
 */
export function parseEventName (event: string): ParsedEvent {
    var parsed: Array<string> = event.split('.');

    return {
        event: parsed[0],
        namespace: parsed[1]
    };
}

/**
 * @ public class SyntheticEvent
 * 
 * A fake Event instance with custom properties.
 */
export class SyntheticEvent extends Event {
    constructor (type: string) {
        super(type);
    }
}