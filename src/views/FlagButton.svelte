<script lang="ts">
    import { createEventDispatcher } from "svelte"

    export let icon: string

    const dispatcher = createEventDispatcher<{
        click: void
        mousedown: void
        mouseup: void
    }>()
</script>
<button
    on:click={() => dispatcher("click")}
    on:mousedown={() => dispatcher("mousedown")}
    on:mouseup={() => dispatcher("mouseup")}
    class="w-5 h-5 flex items-center justify-center">
    <span class="{icon} text-base text-gray-400"></span>
</button>