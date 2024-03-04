import { MediaItem, MediaState } from "./mediaitem"

export class IPTVGroup {
    readonly name: string
    items: MediaItem[] = []

    draggable = false

    constructor(name: string) {
        this.name = name
    }

    push(item: MediaItem) {
        this.items.push(item)
    }

    get total(): number {
        return this.items.length
    }

    get invalidCount(): number {
        return this.items.reduce((cnt, i) => {
            cnt += (i.invalid) ? 1 : 0
            return cnt
        }, 0)
    }

    get completedCount(): number {
        return this.items.reduce((cnt, i) => {
            cnt += (i.state == MediaState.Failure || i.state == MediaState.Success) ? 1 : 0
            return cnt
        }, 0)
    }
}