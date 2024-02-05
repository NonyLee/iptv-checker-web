<script lang="ts">
    import IconButton from './IconButton.svelte';
    import { createEventDispatcher } from "svelte"

    export let unlinkActive = false
    export let duplicationActive = false

    let dispatcher = createEventDispatcher<{
        downloadPlaylist: void
    }>()
</script>

<div class="w-full rounded-l-lg bg-stone-700">
    <IconButton bind:active={unlinkActive} icon={"icon-[ci--unlink]"} text={"删除无连接"}></IconButton>
    <IconButton bind:active={duplicationActive} icon={"icon-[tabler--copy-off]"} text={"删除重复"}></IconButton>
    <hr class="border-t-2 border-stone-500 ml-2 mr-2" />
    <IconButton on:click={() => dispatcher("downloadPlaylist")} icon={"icon-[octicon--download-16]"} text={"重新生成"} mode="button"></IconButton>
</div>