import { world, ItemStack } from '@minecraft/server'
import { acceptedUpgrades, diffCapMachines } from '../machines_config.js'

function displayLevels(block, player) {
    let msg = '   '
    acceptedUpgrades.forEach(acceptedUpgrade => {
        const level = block.permutation.getState(`${acceptedUpgrade.upgrade}`)
        if (level != undefined) msg = msg.concat(`${acceptedUpgrade.name}: §f${level}   `)
    })
    player.onScreenDisplay.setActionBar(`${msg}`)
}

const cardinal = ['north', 'south', 'east', 'west']
const facing = ['up', 'down', 'north', 'south', 'east', 'west']

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('utilitycraft:machine_upgrades', {
        onPlayerInteract(e) {
            const { block, player } = e
            const mainHand = player.getComponent('equippable').getEquipment('Mainhand')

            if (!mainHand) {
                if (player.isSneaking) {
                    if (player.isSneaking) {
                        acceptedUpgrades.forEach(acceptedUpgrade => {
                            const level = block.permutation.getState(`${acceptedUpgrade.upgrade}`)
                            if (level != undefined && level > 0) {
                                block.setPermutation(block.permutation.withState(`${acceptedUpgrade.upgrade}`, 0))
                                world.getDimension(block.dimension.id).spawnItem(new ItemStack(`${acceptedUpgrade.upgrade}_upgrade`, level), player.location)

                            }
                        })
                    }
                    return
                }
                displayLevels(block, player)
                return
            }

            if (mainHand?.typeId == 'utilitycraft:wrench') {
                try {
                    const currentFacing = block.permutation.getState('minecraft:facing_direction');
                    const facingIndex = facing.indexOf(currentFacing);

                    if (facingIndex !== -1) {
                        const nextFacing = (facingIndex + 1) % facing.length;
                        block.setPermutation(
                            block.permutation.withState('minecraft:facing_direction', facing[nextFacing])
                        );
                    } else {
                        throw new Error("Invalid facing_direction");
                    }
                } catch {
                    try {
                        const currentCardinal = block.permutation.getState('minecraft:cardinal_direction');
                        const cardinalIndex = cardinal.indexOf(currentCardinal);

                        if (cardinalIndex !== -1) {
                            const nextCardinal = (cardinalIndex + 1) % cardinal.length;
                            block.setPermutation(
                                block.permutation.withState('minecraft:cardinal_direction', cardinal[nextCardinal])
                            );
                        }
                    } catch {
                        throw new Error("Invalid cardinal_direction")
                    }
                }
            }

            const upgrade = acceptedUpgrades.find(x => mainHand?.typeId == x.upgrade + '_upgrade');
            if (!upgrade) return
            let level = block.permutation.getState(`${upgrade.upgrade}`)

            if (level == undefined || level >= upgrade.cap) {
                player.onScreenDisplay.setActionBar('Max ' + upgrade.name + ' §fLevel')
                return
            }



            let cap = upgrade.cap
            if (diffCapMachines.includes(block.typeId) && !mainHand.typeId.includes('filter')) cap = 4

            const levelIncrease = Math.min(cap - level, mainHand.amount)

            block.setPermutation(block.permutation.withState(`${upgrade.upgrade}`, levelIncrease + level))
            player.runCommand(`clear @s ${upgrade.upgrade}_upgrade 0 ${levelIncrease}`)
            displayLevels(block, player)
        },
        onPlayerDestroy(e) {
            const { block, destroyedBlockPermutation } = e
            const blockPerms = destroyedBlockPermutation
            acceptedUpgrades.forEach(acceptedUpgrade => {
                const level = blockPerms.getState(`${acceptedUpgrade.upgrade}`)
                if (level && level > 0) {
                    world.getDimension(block.dimension.id).spawnItem(new ItemStack(`${acceptedUpgrade.upgrade}_upgrade`, level), block.location)
                }
            })
        }
    })
})

