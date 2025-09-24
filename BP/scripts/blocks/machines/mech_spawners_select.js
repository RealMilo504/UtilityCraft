import { world, ItemStack } from '@minecraft/server'

const essences = [
    'twm:essence_vessel',
    'twm:blaze_essence',
    'twm:chicken_essence',
    'twm:cow_essence',
    'twm:creeper_essence',
    'twm:enderman_essence',
    'twm:hoglin_essence',
    'twm:magma_cube_essence',
    'twm:mooshroom_essence',
    'twm:pig_essence',
    'twm:sheep_essence',
    'twm:skeleton_essence',
    'twm:slime_essence',
    'twm:spider_essence',
    'twm:wither_skeleton_essence',
    'twm:zombie_essence'
]

const spawnerTypes = [
    'twm:mechanical_spawner',
    'twm:mechanical_spawner_blaze',
    'twm:mechanical_spawner_chicken',
    'twm:mechanical_spawner_cow',
    'twm:mechanical_spawner_creeper',
    'twm:mechanical_spawner_enderman',
    'twm:mechanical_spawner_hoglin',
    'twm:mechanical_spawner_magma_cube',
    'twm:mechanical_spawner_mooshroom',
    'twm:mechanical_spawner_pig',
    'twm:mechanical_spawner_sheep',
    'twm:mechanical_spawner_skeleton',
    'twm:mechanical_spawner_slime',
    'twm:mechanical_spawner_spider',
    'twm:mechanical_spawner_wither_skeleton',
    'twm:mechanical_spawner_zombie'
]

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:mech_spawners_select', {
        onPlayerInteract(e) {
            const { block, player } = e
            let { x, y, z } = block.location
            y += 0.367, x += 0.4995, z += 0.500
            const selectItem = (player.getComponent('equippable').getEquipment('Mainhand') != undefined) ? player.getComponent('equippable').getEquipment('Mainhand').typeId : undefined
            for (let i = 0; i < spawnerTypes.length; i++) {
                if (selectItem == essences[i]) {
                    player.runCommand(`clear @s ${essences[i]} 0 1`)
                    block.setPermutation(block.permutation.withState('twm:spawnerTypes', i))
                    block.dimension.runCommand(`summon ${spawnerTypes[i]} ${x} ${y} ${z} 0  0`)
                }
            }
        }
    })
})