import { world, ItemStack } from '@minecraft/server'

const acceptedItems = {
    'minecraft:cobblestone': 1,
    'minecraft:stone': 1,
    'minecraft:diorite': 1,
    'minecraft:granite': 1,
    'minecraft:blackstone': 1,
    'minecraft:netherrack': 4
}

const heatSources = {
    'twm:blaze_block': 6,
    'minecraft:lava': 4,
    'minecraft:flowing_lava': 4,
    'minecraft:soul_fire': 3,
    'minecraft:soul_torch': 3,
    'minecraft:soul_campfire': 3,
    'minecraft:fire': 2,
    'minecraft:campfire': 2,
    'minecraft:magma_block': 2,
    'minecraft:torch': 1
}

//Give item to the player if not spawn it on the block
function giveItem(player, block, itemId) {
    let { x, y, z } = block.location
    x += 0.5; y += 1; z += 0.5
    let slots = player.getComponent('inventory').container.emptySlotsCount
    if (slots == 0) {
        block.dimension.spawnItem(new ItemStack(`${itemId}`, 1), { x, y, z })
    } else {
        player.getComponent('inventory').container.addItem(new ItemStack(`${itemId}`, 1))
    }
}

//Here inicializes the custom components
world.beforeEvents.worldInitialize.subscribe(e => {
    e.blockComponentRegistry.registerCustomComponent('twm:crucible', {
        onPlayerInteract(e) {
            const { player, block } = e
            //Gets the item on the main hand of the player
            let { x, y, z } = block.location
            x += 0.5; y += 1; z += 0.5

            let mainhand = player.getComponent('equippable').getEquipment('Mainhand')

            let cobble = block.permutation.getState('twm:cobble')
            let lava = block.permutation.getState('twm:lava')

            let item = acceptedItems[mainhand?.typeId]

            if (item) {
                if (cobble < 4 && lava < 4 && cobble + lava < 4) {
                    cobble += item
                    player.runCommand(`clear @s ${mainhand?.typeId} 0 1`)
                }
            } else {
                if (mainhand?.typeId == 'minecraft:bucket' && lava == 4) {
                    player.runCommand(`clear @s ${mainhand?.typeId} 0 1`)
                    giveItem(player, block, 'minecraft:lava_bucket')
                    lava = 0
                } else {
                    if (mainhand?.typeId == 'minecraft:water_bucket' && lava == 4) {
                        player.runCommand(`clear @s ${mainhand?.typeId} 0 1`)
                        giveItem(player, block, 'minecraft:bucket')
                        block.dimension.spawnItem(new ItemStack('minecraft:obsidian', 1), { x, y, z })
                        lava = 0
                    }
                    if (mainhand?.typeId == 'minecraft:lava_bucket' && lava == 0 && cobble == 0) {
                        player.runCommand(`clear @s ${mainhand?.typeId} 0 1`)
                        giveItem(player, block, 'minecraft:bucket')
                        lava = 4
                    }
                }
            }



            player.onScreenDisplay.setActionBar(`   Cobble: ${cobble * 1000}mB   Lava: ${lava * 250}mB   `)

            block.setPermutation(block.permutation.withState('twm:cobble', cobble))
            block.setPermutation(block.permutation.withState('twm:lava', lava))

        },
        //Every time the function tick on the block executes it executes this
        onTick(e) {
            const { block } = e

            const heatSource = heatSources[block.below(1)?.typeId]
            let smelt = block.permutation.getState('twm:smelting')
            let cobble = block.permutation.getState('twm:cobble')
            let lava = block.permutation.getState('twm:lava')

            if (!heatSource || cobble == 0 || lava == 4) {
                block.setPermutation(block.permutation.withState('twm:smelting', 0))
                return
            }

            smelt += heatSource

            if (smelt > 15) {
                block.setPermutation(block.permutation.withState('twm:cobble', cobble - 1))
                block.setPermutation(block.permutation.withState('twm:lava', lava + 1))
                smelt = 0
            }

            block.setPermutation(block.permutation.withState('twm:smelting', smelt))
        }
    })
})