import { world, ItemStack } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(e => {
    e.itemComponentRegistry.registerCustomComponent('twm:fiber', {
        onMineBlock(e) {
            const { minedBlockPermutation, block } = e
            let blockId = minedBlockPermutation.getItemStack(1).typeId
            if (!blockId.endsWith('_leaves')) return;
            let { x, y, z } = block.location
            block.dimension.spawnItem(new ItemStack('twm:fiber', randomInterval(1, 2)), { x, y, z })
        }
    })
})

function randomInterval(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}