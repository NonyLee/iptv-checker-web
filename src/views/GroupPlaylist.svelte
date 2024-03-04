<script lang="ts">
    import { flip } from "svelte/animate";
    import type { IPTVGroup } from "../lib/group";
    import { MediaState, MediaItem } from "../lib/mediaitem";
    import FlagButton from "./FlagButton.svelte";

    export let currentGroup: IPTVGroup
    
    let itemMoving: MediaItem|undefined

    function moveGroupItem(target: MediaItem) {
        if (!itemMoving || !currentGroup || !currentGroup.items) {
            return
        }
        let iSrc = currentGroup.items.indexOf(itemMoving)
        let iTarget = currentGroup.items.indexOf(target)
        if (iSrc < 0 || iTarget < 0 || iSrc == iTarget) {
            return
        }
        currentGroup.items.splice(iSrc, 1)
        currentGroup.items.splice(iTarget, 0, itemMoving)
        currentGroup = currentGroup
    }
    function removeItem(item: MediaItem) {
        if (!currentGroup) {
            return
        }
        currentGroup.items.splice(currentGroup.items.indexOf(item), 1)
        currentGroup = currentGroup
    }

    const linkBorderStyls = new Map([
        [MediaState.Idle, " bg-stone-100 "],
        [MediaState.Connecting, " bg-stone-100 "],
        [MediaState.Loading, ""],
        [MediaState.Success, "bg-green-200"],
        [MediaState.Failure, "bg-red-200"],
    ])
    const linkTextStyls = new Map([
        [MediaState.Idle, "text-green-600 icon-[lucide--link-2] text-sm animate-pulse "],
        [MediaState.Connecting, "text-green-600 icon-[lucide--link-2] text-sm animate-pulse"],
        [MediaState.Loading, "text-green-600 icon-[lucide--link-2] text-sm"],
        [MediaState.Success, "text-green-600 icon-[lucide--link-2] text-sm"],
        [MediaState.Failure, "text-red-600 icon-[lucide--link-2-off] text-xs"],
    ])
</script>

<div class="h-full overflow-y-auto overflow-x-hidden bg-white rounded-md ml-2 w-2/3">
    {#each currentGroup.items as item (item)}
        <button
            animate:flip
            draggable={item.draggable}
            on:dragenter={(e) => moveGroupItem(item)}
            on:dragstart={(e) => itemMoving = item}
            on:dragend={(e) => item.draggable=false}
            class="px-4 py-2 border-b-2 border-gray-100 flex justify-between items-center  w-full {item.invalid ? 'hidden' : ''} ">
            <span class="flex ">
                
                <span class="ml-2">{item.name}</span>
            </span>
            <span class="flex items-center ml-6">
                <span class="{linkBorderStyls.get(item.state)} relative flex items-center justify-center w-6 h-6 rounded-full mr-1">
                    <span class="{linkTextStyls.get(item.state)}"></span>
                </span>
                <FlagButton 
                    icon="icon-[grommet-icons--sort]"
                    on:mousedown={() => item.draggable=true}
                    on:mouseup={() => item.draggable=false}>
                </FlagButton>
                <FlagButton on:click={() => removeItem(item)} icon="icon-[ph--x-bold]">
                </FlagButton>
            </span>
        </button>
    {/each}
</div>