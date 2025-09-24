import { world } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:mob_grinder', {
        onTick(e) {
            const { block } = e
            let { x, y, z } = block.location
            block.dimension.runCommand(`damage @e[r=0.6, type=!item, x=${x + 0.5}, y = ${y}, z = ${z + 0.5}] 1 none entity @p`)
        },
        onPlace(e) {
            const { block } = e
            let { x, y, z } = block.location
            block.dimension.spawnEntity('twm:mob_grinder_entity', { x: x + 0.5, y: y, z: z + 0.5 })
        }
    })
})