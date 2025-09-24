import { world } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:lantern', {
        onPlace(e) {
            const { block } = e
            const { x, y, z } = block.location
            block.dimension.runCommand(`execute positioned ${x + 19} ${y} ${z} run function ilumination/big_torch`)
            block.dimension.runCommand(`execute positioned ${x - 19} ${y} ${z} run function ilumination/big_torch`)
            block.dimension.runCommand(`execute positioned ${x} ${y} ${z + 19} run function ilumination/big_torch`)
            block.dimension.runCommand(`execute positioned ${x} ${y} ${z - 19} run function ilumination/big_torch`)
        },
        onPlayerDestroy(e) {
            const { block } = e
            const { x, y, z } = block.location
            block.dimension.runCommand(`execute positioned ${x + 19} ${y} ${z} run function ilumination/big_torch_break`)
            block.dimension.runCommand(`execute positioned ${x - 19} ${y} ${z} run function ilumination/big_torch_break`)
            block.dimension.runCommand(`execute positioned ${x} ${y} ${z + 19} run function ilumination/big_torch_break`)
            block.dimension.runCommand(`execute positioned ${x} ${y} ${z - 19} run function ilumination/big_torch_break`)
        }
    })
})