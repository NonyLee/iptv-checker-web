<script lang="ts">
    import { createEventDispatcher } from "svelte"
    export let icon: string
    export let text: string
    export let mode: string = "button"
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
<button class="text-stone-600 active:text-sky-600 flex flex-col items-center justify-center" on:click={() => onClick()}>
    <span class="{icon} text-2xl"></span>
    <span class="text-xs">{text}</span>
</button>