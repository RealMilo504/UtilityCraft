import { world, ItemStack } from '@minecraft/server'

const interacts = [
    { id: 'utilitycraft:drill_placer' },
    { id: 'utilitycraft:tractor_placer' },
    { id: 'utilitycraft:sink' },
    { id: 'utilitycraft:pedestal' }
]

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('utilitycraft:onInteract', {
        onPlayerInteract(e) {
            const { block, player } = e
            let { x, y, z } = block.location
            const isPlacer = interacts.find((placer) => block.matches(placer.id))
            switch (isPlacer.id) {
                case interacts[0].id:
                    block.dimension.setBlockType({ x, y, z }, 'air')
                    block.dimension.spawnEntity('utilitycraft:drill', { x, y, z })
                    player.playSound('random.anvil_land')
                    break
                case interacts[1].id:
                    block.dimension.setBlockType({ x, y, z }, 'air')
                    block.dimension.spawnEntity('utilitycraft:tractor', { x, y, z })
                    player.playSound('random.anvil_land')
                    break
                case interacts[2].id:
                    let equipment = player.getComponent('equippable')
                    let selectItem = equipment.getEquipment('Mainhand')
                    if (selectItem != undefined) {
                        if (selectItem.typeId == 'minecraft:bucket') {
                            player.dimension.spawnItem(new ItemStack('minecraft:water_bucket', 1), player.location)
                            player.runCommand('clear @s bucket 0 1')
                            player.playSound('cauldron.fillwater')
                        } else if (selectItem.typeId == 'minecraft:water_bucket') {
                            player.getComponent('equippable').setEquipment('Mainhand', new ItemStack('minecraft:bucket', 1))
                            player.playSound('cauldron.takewater')
                        }
                    }
                    break
                case interacts[3].id:
                    y += 1.2, x += 0.5, z += 0.5
                    if (block.permutation.getState('utilitycraft:hasItem') != 0)
                        if (block.permutation.getState('utilitycraft:hasItem') == 1) {
                            block.dimension.getEntities({ type: 'utilitycraft:accelerator_clock', maxDistance: 1, location: { x, y, z } })[0].addTag('despawn')
                            block.dimension.spawnItem(new ItemStack('utilitycraft:accelerator_clock', 1), { x, y, z })
                            block.setPermutation(block.permutation.withState('utilitycraft:hasItem', 0))
                        }
                    if (player.getComponent('equippable').getEquipment('Mainhand') != undefined && block.permutation.getState('utilitycraft:hasItem') == 0) {
                        const item = player.getComponent('equippable').getEquipment('Mainhand').typeId
                        if (item == 'utilitycraft:accelerator_clock') {
                            if (block.dimension.getEntities({ type: 'utilitycraft:accelerator_clock', maxDistance: 5, location: { x, y, z } })[0] != undefined) return
                            block.dimension.spawnEntity('utilitycraft:accelerator_clock', { x, y, z })
                            player.runCommandAsync('clear @s utilitycraft:accelerator_clock 0 1')
                            block.setPermutation(block.permutation.withState('utilitycraft:hasItem', 1))
                        }
                    }
                    break
            }
        }
    })
})