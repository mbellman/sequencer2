import HashTable from "core/system/structures/HashTable";
import Channel from "classes/Channel";

export default class Sequence {
    private channels: HashTable<Channel> = new HashTable<Channel>();

    public getTotalChannels (): number {
        return this.channels.size();
    }

    public addChannel (channel: Channel): void {
        this.channels.store(channel.getName(), channel);
    }

    public removeChannel (channel: Channel): void {
        this.channels.delete(channel.getName());
    }
}