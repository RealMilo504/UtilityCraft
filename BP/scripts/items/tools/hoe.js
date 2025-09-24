import { world } from '@minecraft/server'

world.beforeEvents.itemUseOn.subscribe((e) => {
    const { block, itemStack } = e
    let { x, y, z } = block.location
    if (itemStack.hasTag('twm:is_aiot')) {
        block.dimension.runCommandAsync(`fill ${x - 1} ${y} ${z - 1} ${x + 1} ${y} ${z + 1} farmland replace dirt`)
        block.dimension.runCommandAsync(`fill ${x - 1} ${y} ${z - 1} ${x + 1} ${y} ${z + 1} farmland replace grass`)
        block.dimension.runCommandAsync(`execute positioned ${x} ${y} ${z} run function tractor`)
    }
})