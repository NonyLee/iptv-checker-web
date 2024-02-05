<script lang="ts">
    import { createEventDispatcher } from "svelte"
    export let icon: string
    export let text: string
    export let mode: string = "switcher"
    export let active = false

    const dispatcher = createEventDispatcher<{
        click: boolean
    }>()

    function onClick() {
        if (mode == "button") {
            dispatcher("click",  true)
            return
        }

        active = !active
        dispatcher("click",  active)
    }

</script>
<button class="{active ? 'text-blue-400' : 'text-white'} flex flex-col items-center justify-center w-full py-4 active:text-blue-400" on:click={() => onClick()}>
    <span class="{icon} text-3xl"></span>
    <span class="text-xs">{text}</span>
</button>