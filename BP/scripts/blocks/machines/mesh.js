import { world, ItemStack } from '@minecraft/server'
import { autosieve } from '../../machinery/machines_config.js'


world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:mesh', {
        onPlayerInteract(e) {
            const { block, player } = e
            let { x, y, z } = block.location
            y += 0.75, x += 0.5, z += 0.5
            const mainHand = player.getComponent('equippable').getEquipment('Mainhand')

            const meshState = block.permutation.getState('twm:mesh')
            const blockState = block.permutation.getState('twm:state')
            const blockType = block.permutation.getState('twm:block')

            if (!mainHand && player.isSneaking && meshState != 'empty' && blockState == 0) {
                const playerInv = player.getComponent('inventory').container
                if (playerInv.emptySlotsCount == 0) {
                    block.dimension.spawnItem(new ItemStack('twm:' + meshState), block.location)
                } else playerInv.addItem(new ItemStack('twm:' + meshState))
                block?.setPermutation(block?.permutation.withState('twm:mesh', 'empty'))
                block?.setPermutation(block?.permutation.withState('twm:state', 0))
                return
            }

            if (mainHand) {
                if (mainHand.typeId.includes('mesh') && meshState == 'empty') {
                    block?.setPermutation(block?.permutation.withState('twm:mesh', mainHand.typeId.split(':')[1]))
                    if (player.getGameMode() != 'creative') {
                        player.runCommand(`clear @s ${mainHand.typeId} 0 1`)
                    }
                    return
                }

                if (blockType == 'empty') {
                    const sievableBlock = autosieve.recipes[mainHand.typeId]
                    if (!sievableBlock) return
                    applyBlock(player, block, mainHand)
                    block.dimension.playSound('dig.gravel', block.location)
                    return
                }
            }

            if (meshState == 'empty') return

            if (blockType != 'empty' && blockState == 1) {
                finishFiltering(block)
                block.dimension.playSound('dig.gravel', block.location)
                return
            }

            if (blockType != 'empty' && blockState != 1) {
                filter(block, blockState)
                block.dimension.playSound('dig.gravel', block.location)
                return
            }
        },
        onPlayerDestroy(e) {
            const { destroyedBlockPermutation, block } = e
            let mesh = destroyedBlockPermutation.getState('twm:mesh')
            if (mesh == 'empty') return;
            block.dimension.spawnItem(new ItemStack(`twm:${mesh}`, 1), block.location)
        }
    })
})

function applyBlock(player, block, mainHand) {
    const sieves = {
        center: block,

        // Row -2
        top2L2: block.north(2).west(2),
        top2L1: block.north(2).west(1),
        top2: block.north(2),
        top2R1: block.north(2).east(1),
        top2R2: block.north(2).east(2),

        // Row -1
        topL2: block.north(1).west(2),
        topL1: block.north(1).west(1),
        top: block.north(1),
        topR1: block.north(1).east(1),
        topR2: block.north(1).east(2),

        // Row 0 (center row)
        left2: block.west(2),
        left: block.west(1),
        right: block.east(1),
        right2: block.east(2),

        // Row +1
        botL2: block.south(1).west(2),
        botL1: block.south(1).west(1),
        bot: block.south(1),
        botR1: block.south(1).east(1),
        botR2: block.south(1).east(2),

        // Row +2
        bot2L2: block.south(2).west(2),
        bot2L1: block.south(2).west(1),
        bot2: block.south(2),
        bot2R1: block.south(2).east(1),
        bot2R2: block.south(2).east(2)
    }

    let amount = 0

    for (const sieve of Object.values(sieves)) {
        if (!sieve) continue
        if (sieve.typeId != 'twm:sieve') continue
        if (sieve.permutation.getState('twm:mesh') == 'empty') continue
        if (sieve.permutation.getState('twm:block') != 'empty') continue
        if (amount >= mainHand.amount) break

        amount++
        sieve?.setPermutation(sieve?.permutation.withState('twm:state', 4))
        sieve?.setPermutation(sieve?.permutation.withState('twm:block', mainHand.typeId))
    }

    player.runCommand(`clear @s ${mainHand.typeId} 0 ${amount}`)

}

function finishFiltering(block) {
    const sieves = {
        center: block,

        // Row -2
        top2L2: block.north(2).west(2),
        top2L1: block.north(2).west(1),
        top2: block.north(2),
        top2R1: block.north(2).east(1),
        top2R2: block.north(2).east(2),

        // Row -1
        topL2: block.north(1).west(2),
        topL1: block.north(1).west(1),
        top: block.north(1),
        topR1: block.north(1).east(1),
        topR2: block.north(1).east(2),

        // Row 0 (center row)
        left2: block.west(2),
        left: block.west(1),
        right: block.east(1),
        right2: block.east(2),

        // Row +1
        botL2: block.south(1).west(2),
        botL1: block.south(1).west(1),
        bot: block.south(1),
        botR1: block.south(1).east(1),
        botR2: block.south(1).east(2),

        // Row +2
        bot2L2: block.south(2).west(2),
        bot2L1: block.south(2).west(1),
        bot2: block.south(2),
        bot2R1: block.south(2).east(1),
        bot2R2: block.south(2).east(2)
    }
    for (const sieve of Object.values(sieves)) {
        let { x, y, z } = sieve.location
        y += 0.75, x += 0.5, z += 0.5
        if (!sieve) continue
        if (sieve.typeId != 'twm:sieve') continue
        if (sieve.permutation.getState('twm:block') == 'empty') continue
        if (sieve.permutation.getState('twm:mesh') == 'empty') continue
        if (sieve.permutation.getState('twm:state') != 1) continue

        const meshState = sieve.permutation.getState('twm:mesh')
        const multi = autosieve.mesh['twm:' + meshState]
        if (!multi) continue

        const sievableBlock = autosieve.recipes[sieve.permutation.getState('twm:block')]
        sievableBlock.forEach(loot => {
            const randomChance = Math.random() * 100;
            if (randomChance <= loot.prob * multi) {
                block.dimension.spawnItem(new ItemStack(loot.item, Math.ceil(Math.random() * loot.amount)), { x, y, z })
            }
        })

        sieve?.setPermutation(sieve?.permutation.withState('twm:state', 0))
        sieve?.setPermutation(sieve?.permutation.withState('twm:block', 'empty'))
    }
}

function filter(block, blockState) {
    const sieves = {
        center: block,

        // Row -2
        top2L2: block.north(2).west(2),
        top2L1: block.north(2).west(1),
        top2: block.north(2),
        top2R1: block.north(2).east(1),
        top2R2: block.north(2).east(2),

        // Row -1
        topL2: block.north(1).west(2),
        topL1: block.north(1).west(1),
        top: block.north(1),
        topR1: block.north(1).east(1),
        topR2: block.north(1).east(2),

        // Row 0 (center row)
        left2: block.west(2),
        left: block.west(1),
        right: block.east(1),
        right2: block.east(2),

        // Row +1
        botL2: block.south(1).west(2),
        botL1: block.south(1).west(1),
        bot: block.south(1),
        botR1: block.south(1).east(1),
        botR2: block.south(1).east(2),

        // Row +2
        bot2L2: block.south(2).west(2),
        bot2L1: block.south(2).west(1),
        bot2: block.south(2),
        bot2R1: block.south(2).east(1),
        bot2R2: block.south(2).east(2)
    }

    for (const sieve of Object.values(sieves)) {
        if (!sieve) continue
        if (sieve.typeId != 'twm:sieve') continue
        if (sieve.permutation.getState('twm:state') != blockState) continue
        if (sieve.permutation.getState('twm:block') == 'empty') continue
        if (sieve.permutation.getState('twm:mesh') == 'empty') continue

        sieve?.setPermutation(sieve?.permutation.withState('twm:state', blockState - 1))
    }
}