import { world } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('twm:vein', {
        onMineBlock(e) {
            const { block, source } = e
            let { x, y, z } = block.location
            if (source.getGameMode() != 'creative' && source.isSneaking) {
                block.dimension.runCommand(`execute positioned ${x} ${y} ${z} run function tools/veinminer`)
                block.dimension.runCommand(`execute positioned ${x} ${y} ${z} run function tools/veinshovel`)
                block.dimension.runCommand(`execute positioned ${x} ${y} ${z} run function tools/treecapitator`)
            }
        }
    })
})