import Hls, {Events, type ErrorData, type ManifestLoadedData, type ManifestParsedData} from "hls.js";

class PromiseHandler {

    public promise: Promise<any>

    private fnResolve?: (val: any) => void
    private fnReject?: (reason: any) => void

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.fnResolve = resolve
            this.fnReject = reject
        })
    }
    resolve(val?: any) {
        this.fnResolve && this.fnResolve(val)
    }

    reject(reason?: any) {
        this.fnReject && this.fnReject(reason)
    }
}

export class Player {
    bitrate: number = 0
    latency: number = 0

    view: HTMLVideoElement
    hls: Hls

    private loadPromise?: PromiseHandler;

    private onHlsErrorHandler = (event: Events.ERROR, data: ErrorData) => {
        this.loadPromise && this.loadPromise.reject()
        this.loadPromise = undefined
    }
    private onHlsMFParsedHandler = (event: Events.MANIFEST_PARSED, data: ManifestParsedData) => {
        this.loadPromise && this.loadPromise.resolve()
        this.loadPromise = undefined
    }

    private onVideoLoaded = () => {
        this.loadPromise && this.loadPromise.resolve()
        this.loadPromise = undefined
    }

    constructor() {
        this.view = document.createElement("video")
        this.hls = new Hls({
            enableWorker: true,
            manifestLoadPolicy: {
                default: {
                  maxTimeToFirstByteMs: 1500,
                  maxLoadTimeMs: 1500,
                  timeoutRetry: null,
                  errorRetry: null,
                },
            },
        })
        this.hls.on(Hls.Events.ERROR, this.onHlsErrorHandler);
        // this.hls.on(Hls.Events.MANIFEST_PARSED, this.onHlsMFParsedHandler);
        this.view.onloadedmetadata = this.onVideoLoaded

        this.hls.attachMedia(this.view)
    }

    async load(url: string) {
        this.hls.loadSource(url)

        this.loadPromise = new PromiseHandler()
        return this.loadPromise.promise
    }

    get videoWidth(): number {
        return this.view.videoWidth
    }

    get videoHeight(): number {
        return this.view.videoHeight
    }

    destroy() {
        this.view.pause()
        this.hls.destroy()
    }
}