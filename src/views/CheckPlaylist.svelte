<script lang="ts">
    import { SampleIPTVChecker, LoadIPTVChecker, BaseIPTVChecker } from '../lib/checker';
    import Cache from "../lib/cache"
    import { replace } from 'svelte-spa-router'
    import { onDestroy } from "svelte"
    import { IPTVGroup } from '../lib/group';
    import ControlPanel from './ControlPanel.svelte';
    import {M3uParser, M3uPlaylist, M3uMedia} from 'm3u-parser-generator';
    import { download } from '../lib/download';
    import FlagButton from './FlagButton.svelte';
    import { flip } from "svelte/animate";
    import { MediaItem, MediaState } from '../lib/mediaitem';
    import Groups from './Groups.svelte';
    import GroupPlaylist from './GroupPlaylist.svelte';
    import { Player } from '../lib/player';
    import IconButton from './IconButton.svelte';

    let content = Cache.playlist || ""
    let filename = Cache.name || "playlist.m3u8"
    if (!content) {
        replace("/")
    }
    
    let {playlist, groups, checker} = parseGroups(content)
    let currentGroup: IPTVGroup|undefined
    
    checker.onItemStateChanged = (item) => {
        groups = groups
        if (currentGroup && currentGroup.name == item.groupTitle) {
            currentGroup = currentGroup
        }
    }
    checker.run()
    onDestroy(() => {
        if (checker) checker.abort()
    })

    function parseGroups(str: string): {playlist: M3uPlaylist, groups: Array<IPTVGroup>, checker: BaseIPTVChecker} {
        let playlist = M3uParser.parse(str)
        playlist.medias.sort((a, b) => {
            if (!a.name || !b.name) return 0 
            return a.name.localeCompare(b.name, "en", { numeric: true })
        })
        
        let medias: MediaItem[] = []
        let groups = playlist.medias.reduce((map, item) => {
            let groupName = item.attributes['group-title'] || ""
            let gp = map.filter(g => g.name === groupName)[0] || map.push(new IPTVGroup(groupName)) && map[map.length - 1];
            let mediaItem = new MediaItem(item)
            medias.push(mediaItem)
            gp.push(mediaItem)
            return map
        }, new Array<IPTVGroup>).sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
            
        let checker = new LoadIPTVChecker(medias)

        return {playlist, groups, checker}
    }

    function optimize() {
        groups = groups.filter((group) => {
            group.items = group.items.reduce((items, i) => {
                if (i.state == MediaState.Failure) {
                    checker.removeItem(i)
                    return items
                }
                if (items.length < 1 || items[items.length - 1].name !== i.name) {
                    items.push(i)
                    return items
                }
                let preItem = items[items.length - 1]
                if (preItem.state == MediaState.Success) {
                    checker.removeItem(i)
                    return items
                }
                if (i.state == MediaState.Success) {
                    while (items.length > 0 && items[items.length - 1].name === i.name) items.length--
                }
                items.push(i)

                return items
            }, new Array<MediaItem>)

            return group.items.length > 0
        })
        currentGroup = currentGroup
    }

    function downloadPlaylist() {
        let items: M3uMedia[] = []
        if (groups.length == 0) {
            return
        }
        groups.forEach((v, k) => {
            items.push(...v.items.filter(m => !m.invalid).map(m => m.media))
        })
        playlist.medias = items

        download(playlist.getM3uString(), filename)
    }

</script>
<div class="h-16 border-b-2 bg-white fixed top-0 w-full z-10 ">
    <div class="w-2/3 h-full flex items-center justify-end m-auto">
        <IconButton icon={"icon-[tabler--hand-click]"} text={"一键优化"} on:click={optimize}></IconButton>
        <div class="w-8"></div>
        <IconButton icon={"icon-[octicon--download-16]"} text={"重新生成"} on:click={downloadPlaylist}></IconButton>
    </div>
</div>

<div class="w-full flex justify-center">
    <div class="flex absolute top-16 bottom-0 py-2 w-1/2  m-auto">
    {#if groups}
        <Groups groups={groups} bind:currentGroup={currentGroup}></Groups>
    {/if}
    {#if currentGroup}
        <GroupPlaylist currentGroup={currentGroup}></GroupPlaylist>
    {/if}
    </div>
</div>
