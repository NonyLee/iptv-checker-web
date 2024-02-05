<script lang="ts">
    import { MediaItemState, type MediaItem } from '../types';
    import { IPTVChecker } from '../lib/checker';
    import Cache from "../lib/cache"
    import { replace } from 'svelte-spa-router'
    import { onDestroy } from "svelte"
    import { IPTVGroup } from '../lib/group';
    import ControlPanel from './ControlPanel.svelte';
    import {M3uParser, M3uPlaylist} from 'm3u-parser-generator';
    import { download } from '../lib/download';

    let content = Cache.playlist || ""
    let filename = Cache.name || "playlist.m3u8"
    if (!content) {
        replace("/")
    }
    
    let {playlist, groups, checker} = parseGroups(content)
    let isNoneGroup = groups.size == 1 && groups.has("")
    let currentGroup: IPTVGroup|undefined
    let state: "idle"|"checking"|"completed" = "checking"

    let unlinkActive = false
    let duplicationActive = false

    checker.onCompleted = () => {
        state = "completed"
    }
    checker.onItemStateChanged = (item) => {
        groups = groups
        if (currentGroup && currentGroup.name == item.attributes['group-title']) {
            currentGroup = currentGroup
        }
    }
    checker.run()

    onDestroy(() => {
        if (checker) checker.abort()
    })

    function parseGroups(str: string): {playlist: M3uPlaylist, groups: Map<string, IPTVGroup>, checker: IPTVChecker} {
        let playlist = M3uParser.parse(str)
        let checker = new IPTVChecker(playlist.medias as MediaItem[])
        playlist.medias.sort((a, b) => {
            if (!a.name || !b.name) return 0 
            return a.name.localeCompare(b.name, "en", { numeric: true })
        })
        
        let groups = playlist.medias.reduce((map, item) => {
            let groupName = item.attributes['group-title'] || ""
            let gp = map.get(groupName) || new IPTVGroup(groupName);
            (item as MediaItem).state = MediaItemState.Idle;
            (item as MediaItem).invalid = false;
            gp.push(item as MediaItem)
            map.set(groupName, gp)
            return map
        }, new Map<string, IPTVGroup>);

        return {playlist, groups, checker}
    }

    function processItems(unlink: boolean, duplication: boolean) {
        groups.forEach((group, key) => {
            group.items.forEach((item, i) => {
                item.invalid = (unlink && item.state == MediaItemState.Failure)
                if (duplication && !item.invalid) {
                    item.invalid = group.items.findIndex((preItem) => !preItem.invalid && preItem.name === item.name) < i
                }
            })
        })
        currentGroup = currentGroup
    }

    function downloadPlaylist() {
        playlist.medias = playlist.medias.filter(m => !(m as MediaItem).invalid)
        download(playlist.getM3uString(), filename)
    }

    $: processItems(unlinkActive, duplicationActive)
</script>

{#if groups}
<div class="w-full h-full flex">
    <div class="{isNoneGroup ? 'hidden' : ''} flex flex-col border-r-2 min-w-48">
        {#each groups.values() as group}
        {#if group.invalidCount < group.total}
            <button class="px-4 py-2 flex justify-between items-center {currentGroup == group ? 'bg-blue-400' : ''}" on:click={() => currentGroup = group}>
                <span>{group.name}</span>
                <span class="ml-4">{group.completedCount}/{group.total}</span>
            </button>
        {/if}
        {/each}
    </div>
    {#if currentGroup}
    <div class="h-full overflow-y-auto">
        {#each currentGroup.items as item}
        {#if !item.invalid}
            <div class="px-4 py-2 border-b-2 border-gray-100 flex justify-between items-center min-w-48  ">
                <span>{item.name}</span>
                {#if item.state == MediaItemState.Idle || item.state == MediaItemState.Checking}
                    <span class="icon-[eos-icons--bubble-loading] ml-4"></span>
                {:else if item.state == MediaItemState.Success}
                    <span class="icon-[mdi--check-circle-outline] bg-green-600"></span>
                {:else if item.state == MediaItemState.Failure}
                    <span class="icon-[el--error]  ml-4 text-red-600"></span>
                {/if}
            </div>
        {/if}
        {/each}
    </div>
    {/if}
</div>
{/if}

{#if state == "completed"}
<div class="fixed right-0 top-0 w-20 h-full flex items-center">
    <ControlPanel
        bind:unlinkActive={unlinkActive}
        bind:duplicationActive={duplicationActive}
        on:downloadPlaylist={downloadPlaylist}>
    </ControlPanel>
</div>
{/if}