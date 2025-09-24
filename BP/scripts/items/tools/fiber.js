import { world, ItemStack } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(e => {
    e.itemComponentRegistry.registerCustomComponent('utilitycraft:fiber', {
        onMineBlock(e) {
            const { minedBlockPermutation, block } = e
            let blockId = minedBlockPermutation.getItemStack(1).typeId
            if (!blockId.endsWith('_leaves')) return;
            let { x, y, z } = block.location
            block.dimension.spawnItem(new ItemStack('utilitycraft:fiber', randomInterval(1, 2)), { x, y, z })
        }
    })
})

function randomInterval(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}