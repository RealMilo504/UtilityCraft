import { world } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('twm:drill', {
        onMineBlock(e) {
            const { block, itemStack } = e
            let { x, y, z } = block.location
            if (itemStack.typeId == 'twm:drill') {
                block.dimension.runCommand(`execute positioned ${x} ${y} ${z} run function tools/drills/drill`)
            } else {
                block.dimension.runCommand(`execute positioned ${x} ${y} ${z} run function tools/drills/heavy_drill`)
            }
        }
    })
})