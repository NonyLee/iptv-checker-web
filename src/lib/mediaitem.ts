import {M3uMedia} from 'm3u-parser-generator';

export enum MediaState {
    Idle,
    Connecting,
    Loading,
    Success,
    Failure
}

export enum MeidaState {
    Idle,
    Loading,
    Completed
}

export class MediaItem {
    state: MediaState = MediaState.Idle
    invalid: boolean = false
    draggable: boolean = false

    media: M3uMedia

    resolution?: string

    constructor(media: M3uMedia) {
        this.media = media
    }

    get name(): string {
        return this.media.name || ""
    }

    get location(): string {
        return this.media.location
    }

    get groupTitle(): string {
        return this.media.attributes['group-title'] || ""
    }
}