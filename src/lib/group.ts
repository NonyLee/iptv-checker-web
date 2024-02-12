import { MediaItemState, type MediaItem } from "../types"

export class IPTVGroup {
    readonly name: string
    items: MediaItem[] = []
    private cntTotal: number = 0

    draggable = false

    constructor(name: string) {
        this.name = name
    }

    push(item: MediaItem) {
        this.items.push(item)
        this.cntTotal = this.items.length
    }

    get total(): number {
        return this.cntTotal
    }

    get invalidCount(): number {
        return this.items.reduce((cnt, i) => {
            cnt += (i.invalid) ? 1 : 0
            return cnt
        }, 0)
    }

    get completedCount(): number {
        return this.items.reduce((cnt, i) => {
            cnt += (i.state == MediaItemState.Failure || i.state == MediaItemState.Success) ? 1 : 0
            return cnt
        }, 0)
    }
}