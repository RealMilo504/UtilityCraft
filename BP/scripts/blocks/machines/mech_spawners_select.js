import { world, ItemStack } from '@minecraft/server'

const essences = [
    'utilitycraft:essence_vessel',
    'utilitycraft:blaze_essence',
    'utilitycraft:chicken_essence',
    'utilitycraft:cow_essence',
    'utilitycraft:creeper_essence',
    'utilitycraft:enderman_essence',
    'utilitycraft:hoglin_essence',
    'utilitycraft:magma_cube_essence',
    'utilitycraft:mooshroom_essence',
    'utilitycraft:pig_essence',
    'utilitycraft:sheep_essence',
    'utilitycraft:skeleton_essence',
    'utilitycraft:slime_essence',
    'utilitycraft:spider_essence',
    'utilitycraft:wither_skeleton_essence',
    'utilitycraft:zombie_essence'
]

const spawnerTypes = [
    'utilitycraft:mechanical_spawner',
    'utilitycraft:mechanical_spawner_blaze',
    'utilitycraft:mechanical_spawner_chicken',
    'utilitycraft:mechanical_spawner_cow',
    'utilitycraft:mechanical_spawner_creeper',
    'utilitycraft:mechanical_spawner_enderman',
    'utilitycraft:mechanical_spawner_hoglin',
    'utilitycraft:mechanical_spawner_magma_cube',
    'utilitycraft:mechanical_spawner_mooshroom',
    'utilitycraft:mechanical_spawner_pig',
    'utilitycraft:mechanical_spawner_sheep',
    'utilitycraft:mechanical_spawner_skeleton',
    'utilitycraft:mechanical_spawner_slime',
    'utilitycraft:mechanical_spawner_spider',
    'utilitycraft:mechanical_spawner_wither_skeleton',
    'utilitycraft:mechanical_spawner_zombie'
]

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('utilitycraft:mech_spawners_select', {
        onPlayerInteract(e) {
            const { block, player } = e
            let { x, y, z } = block.location
            y += 0.367, x += 0.4995, z += 0.500
            const selectItem = (player.getComponent('equippable').getEquipment('Mainhand') != undefined) ? player.getComponent('equippable').getEquipment('Mainhand').typeId : undefined
            for (let i = 0; i < spawnerTypes.length; i++) {
                if (selectItem == essences[i]) {
                    player.runCommand(`clear @s ${essences[i]} 0 1`)
                    block.setPermutation(block.permutation.withState('utilitycraft:spawnerTypes', i))
                    block.dimension.runCommand(`summon ${spawnerTypes[i]} ${x} ${y} ${z} 0  0`)
                }
            }
        }
    })
})