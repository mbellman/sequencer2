import HashTable from "core/system/HashTable";
import Channel from "classes/Channel";

/**
 * @ public class Sequence
 */
export default class Sequence {
    /* @ A HashTable of channels in the current sequence. */
    private channels: HashTable<Channel> = new HashTable<Channel>();

    /**
     * Returns the number of active Sequence channels.
     */
    public getTotalChannels (): number {
        return this.channels.size();
    }

    /**
     * Adds a Channel to the Sequence.
     */
    public addChannel (channel: Channel): void {
        this.channels.store(channel.getName(), channel);
    }

    /**
     * Removes a Channel from the Sequence.
     */
    public removeChannel (channel: Channel): void {
        this.channels.delete(channel.getName());
    }
}