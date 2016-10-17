/**
 * @ public class Time
 * 
 * Time and date utilities.
 */
export default class Time {
    /**
     * Returns the difference in milliseconds between the current time and an older timestamp.
     */
    public static since (timestamp: number): number {
        return Date.now() - timestamp;
    }
}