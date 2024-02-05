import { MediaItemState, type MediaItem } from "../types";
import axios from 'axios'

export class IPTVChecker {
    private items: MediaItem[]
    private index = 0;

    onItemStateChanged?: (item: MediaItem) => void;
    onCompleted?: () => void;

    private runCounter = 0;

    private running = true;

    constructor(items: MediaItem[]) {
        this.items = items;
    }

    private async fetchItem() {
        while (this.running) {
            if (this.index >= this.items.length) {
                this.runCounter--;
                if (this.runCounter == 0 && this.onCompleted) {
                    this.onCompleted()
                }
                return
            }
            let item = this.items[this.index++]
            item.state = MediaItemState.Checking
            try {
                let resp = await axios.get(item.location, {timeout: 1000})
                if (resp.status >= 200 && resp.status < 400) {
                    item.state = MediaItemState.Success
                } else {
                    item.state = MediaItemState.Failure
                }
            } catch(e) {
                item.state = MediaItemState.Failure
            }
            if (this.onItemStateChanged) {
                this.onItemStateChanged(item)
            }
        }
    }

    run(): IPTVChecker  {
        this.running = true
        for (let i = 0; i < 10; i++) {
            this.runCounter++;
            this.fetchItem()
        }

        return this
    }

    abort() {
        this.running = false
    }
}

export function checkM3U8Content(content: string) {
    return /^#EXTM3U/.test(content)
}
