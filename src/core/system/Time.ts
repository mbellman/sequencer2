/**
 * @ public class Time
 * 
 * Time and date utilities.
 */
export default class Time {
    public static now (): number {
        return Date.now();
    }

    public static since (timestamp: number) {
        return Time.now() - timestamp;
    }
}