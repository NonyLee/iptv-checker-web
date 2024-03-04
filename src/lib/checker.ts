import axios from 'axios'
import { MediaItem, MediaState } from './mediaitem';
import { Player } from './player';
// import { Player } from './player';

// class MediaLoader {
//     private items: MediaItem[] = []
//     private runner = 0
//     constructor() {
//     }

//     async runLoad() {
//         this.runner++
//         let player = new Player()
//         while (this.items.length > 0) {
//             let item = this.items[0]
//             this.items.splice(0, 1)
//             // try {
//             //     await player.load(item.location)
//             // } 
//         }
//         this.runner--
//         player.destroy()
//     }

//     load(item: MediaItem) {
//         // Change the UI
//         item.state = MediaState.Loading
//         this.items.push(item)
//         if (this.runner < 3) {
//             this.runLoad()
//         }
//     }
// }

export abstract class BaseIPTVChecker {
    private items: MediaItem[]
    private index = 0;

    onItemStateChanged?: (item: MediaItem) => void;
    onCompleted?: () => void;

    private runCounter = 0;

    private running = true;

    constructor(items: MediaItem[]) {
        this.items = items;
    }

    abstract test(item: MediaItem): Promise<void>;

    removeItem(item: MediaItem) {
        let i = this.items.indexOf(item)
        if (i >= 0) this.items.splice(i, 1);
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
            try {
                await this.test(item)
                item.state = MediaState.Success
            } catch(e) {
                item.state = MediaState.Failure
            }
            if (this.onItemStateChanged) {
                this.onItemStateChanged(item)
            }
        }
    }

    run(): BaseIPTVChecker  {
        this.running = true
        for (let i = 0; i < 5; i++) {
            this.runCounter++;
            this.fetchItem()
        }

        return this
    }

    abort() {
        this.running = false
    }
}

export class SampleIPTVChecker extends BaseIPTVChecker {
    async test(item: MediaItem) {
        let resp = await axios.get(item.location, {timeout: 3000})
        if (resp.status >= 200 && resp.status < 400) {
        } else {
            throw Error()
        }
    }
}

export class LoadIPTVChecker extends BaseIPTVChecker {
    async test(item: MediaItem) {
        let player = new Player()
        await player.load(item.location)
        player.destroy()
    }
}

export function checkM3U8Content(content: string) {
    return /^#EXTM3U/.test(content)
}
