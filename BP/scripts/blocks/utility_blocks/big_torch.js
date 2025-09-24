import { world } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:big_torch', {
        onPlace(e) {
            const { block } = e
            const { x, y, z } = block.location
            block.dimension.runCommand(`execute positioned ${x} ${y} ${z} run function ilumination/big_torch`)
        },
        onPlayerDestroy(e) {
            const { block } = e
            const { x, y, z } = block.location
            block.dimension.runCommand(`execute positioned ${x} ${y} ${z} run function ilumination/big_torch_break`)
        }
    })
})