import { world } from '@minecraft/server'

const mobs = [
    'blaze',
    'chicken',
    'cow',
    'creeper',
    'enderman',
    'hoglin',
    'magma_cube',
    'mooshroom',
    'pig',
    'sheep',
    'skeleton',
    'slime',
    'spider',
    'wither_skeleton',
    'zombie'
]

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:mech_spawners', {
        onTick(e) {
            const { block } = e
            let xtemp = 0, ztemp = 0

            if (!block.permutation.getState('twm:isOn')) return

            // if (block.above(1).typeId != "minecraft:air") return;


            const quantity = (block.permutation.getState('twm:quantity') == 4) ? 3 : block.permutation.getState('twm:quantity')
            const quantityMax = (block.permutation.getState('twm:quantity') == 4) ? 25 : 0
            let { x, y, z } = block.location
            for (let i = 0; i < (quantity + 1); i++) {
                if (Math.ceil(Math.random() * 100) < (50 + quantityMax)) {
                    xtemp = Math.random() + 1, ztemp = Math.random() + 1
                    x = ((Math.ceil(Math.random() * 10) < 5)) ? x - xtemp : x + xtemp
                    z = ((Math.ceil(Math.random() * 10) < 5)) ? z - ztemp : z + ztemp
                    block.dimension.runCommand(`summon ${mobs[block.permutation.getState('twm:spawnerTypes') - 1]} ${x} ${y} ${z}`)
                    x = block.location.x, z = block.location.z
                }
            }
        },
        onPlayerInteract(e) {
            const { block, player } = e

            const state = block.permutation.getState('twm:isOn')

            block.setPermutation(block.permutation.withState('twm:isOn', !state))
            if (state) {
                player.sendMessage('Spawner Off')
            } else {
                player.sendMessage('Spawner On')
            }


        }
    })
})