class DataCache {
    public plContent: string | null

    private plName: string | null

    constructor() {
        this.plContent = localStorage.getItem("pl_content")
        this.plName = localStorage.getItem("pl_name")
    }

    set playlist(val: string) {
        this.plContent = val
        localStorage.setItem("pl_content", val)
    }

    get playlist(): string|null {
        return this.plContent
    }

    set name(val: string) {
        this.plName = val
        localStorage.setItem("pl_name", val)
    }

    get name(): string|null {
        return this.plName;
    }
}

export default new DataCache()