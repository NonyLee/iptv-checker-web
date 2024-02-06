<script lang="ts">
    import { createEventDispatcher } from "svelte"
    const dispatcher = createEventDispatcher<{
        click: void
    }>()
</script>
<button on:click={() => dispatcher("click")} class=" rounded-full bg-gray-200 w-5 h-5 flex items-center justify-center">
    <span class="icon-[flowbite--x-solid] text-xs text-gray-400"></span>
</button>