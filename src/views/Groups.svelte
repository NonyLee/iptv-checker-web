<script lang="ts">
    import { flip } from "svelte/animate";
    import type { IPTVGroup } from "../lib/group";
    import FlagButton from "./FlagButton.svelte";

    export let groups: IPTVGroup[]
    export let currentGroup: IPTVGroup|undefined = groups ? groups[0] : undefined
    
    let groupMoving: IPTVGroup|undefined
    $: isNoneGroup = groups.length == 1 && !groups[0].name

    function moveGroup(target: IPTVGroup) {
        if (!groupMoving || !groups) {
            return
        }
        let iSrc = groups.indexOf(groupMoving)
        let iTarget = groups.indexOf(target)
        if (iSrc < 0 || iTarget < 0 || iSrc == iTarget) {
            return
        }
        groups.splice(iSrc, 1)
        groups.splice(iTarget, 0, groupMoving)
        groups = groups
    }

    function removeGroup(g: IPTVGroup) {
        groups.splice(groups.indexOf(g), 1)
        groups = groups
        if (currentGroup?.name === g.name) {
            currentGroup = undefined
        }
    }

</script>
<div class="{isNoneGroup ? 'hidden' : ''} flex flex-col border-r-2  w-1/3 bg-white rounded-md">
    {#each groups as group (group)}
        <button
            animate:flip
            draggable={group.draggable}
            class="px-4 py-2 flex justify-between items-center {currentGroup == group ? 'text-sky-600 font-bold' : ''} {group.invalidCount < group.total ? '' : 'hidden'} pointer-events-auto"
            on:dragenter={(e) => moveGroup(group)}
            on:dragstart={(e) => groupMoving = group}
            on:dragend={(e) => group.draggable=false}
            on:click={() => currentGroup = group}>
            <span>{group.name}</span>
            <div class="flex items-center">
                <span class="mr-2">{group.completedCount}/{group.total}</span>
                <FlagButton on:click={() => removeGroup(group)} icon="icon-[mi--delete]"></FlagButton>
                <span class="ml-2">
                    <FlagButton 
                        icon="icon-[grommet-icons--sort]"
                        on:mousedown={() => group.draggable=true}
                        on:mouseup={() => group.draggable=false}></FlagButton>
                </span>
            </div>
        </button>
    {/each}
</div>