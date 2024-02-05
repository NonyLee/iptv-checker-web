<script lang="ts">
    import Cache from "../lib/cache"
    import { push } from 'svelte-spa-router'
    import { checkM3U8Content } from "../lib/checker";
    import axios from "axios";
    import Addones from "../lib/addones"

    let fileInput: HTMLInputElement

    let borderColor = ""
    let url = ""

    const readPlaylist = (files?: FileList|null) => {
        if (!files || files.length < 1) {
            return
        }
        let file = files[0]
        const reader = new FileReader();
        reader.onloadend = () => {
            if (!checkM3U8Content(reader.result as string)) {
                alert("非IPTV源")
                return
            }

            Cache.playlist = reader.result as string
            Cache.name = file.name

            push("/check")
        }
        reader.readAsText(file, "utf8")
    }

    async function processUrl(e: KeyboardEvent) {
        if (e.code != "Enter") {
            return
        }
        if (!url || !/(^http:\/\/)|(^https:\/\/)/.test(url)) {
            return
        }

        let resp = await axios.get(url)
        if (resp.status < 200 || resp.status >= 400) {
            alert("请求地址失败!")
            return
        }
        let content = resp.data as string
        if (!checkM3U8Content(content)) {
            alert("非IPTV源")
            return
        }
        let paths = new URL(url).pathname.split("/")
        let name = paths[paths.length - 1]
        if (!name.includes(".")) {
            name = "playlist.m3u"
        }
        Cache.playlist = content
        Cache.name = name
        push("/check")
    }
</script>

<div class="fixed top-0 w-full flex flex-col justify-center items-center">
    <span class="bg-stone-200 p-4 rounded-b-lg text-red-500">
        因为多数IPTV源有跨域问题, 需要安装浏览器插件解决, 如
        {#each Addones as addone }
            <a href={addone.url} target="_blank" class="text-sm text-blue-400">{addone.name}</a>
        {/each}
        等
    </span>
</div>

<div class="w-full h-full flex justify-center items-center">
    <div class="w-1/3 h-1/4 border-2 rounded-xl flex flex-col px-6 {borderColor}">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="flex-1 flex justify-center items-center">
            <input bind:this={fileInput} type="file" accept=".m3u,.m3u8" class="hidden" on:change={e => readPlaylist(fileInput.files)}/>
            <button
                on:click={() => fileInput.click()}
                on:dragenter={() => borderColor = "border-blue-400"}
                on:dragleave={() => borderColor = ""}
                on:dragover={(e) => e.preventDefault()}
                on:drop={(e) => {e.preventDefault(); readPlaylist(e.dataTransfer?.files)}}
                class="w-full h-full flex justify-center items-center" >
                <span class="icon-[ph--plus-bold] text-gray-200 text-7xl "></span>
            </button>
        </div>
        
        <div class="h-12 border-t-2">
            <input type="text"
                placeholder="请输入m3u8地址, 回车加载"
                on:keydown={processUrl}
                bind:value={url} class="h-full w-full border-none outline-none" />
        </div>
    </div>
</div>