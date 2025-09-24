import { world } from '@minecraft/server'
import { ModalFormData } from '@minecraft/server-ui'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:fan', {
        onPlayerInteract(e) {
            const { block, player } = e
            const hand = player.getComponent('equippable').getEquipment('Mainhand')
            const modalForm = new ModalFormData().title('Fan Settings')
            for (let i = 0; i <= 5; i++) {
                if (block.permutation.getState('twm:range') == i && hand == undefined && player.isSneaking == false) {
                    modalForm.toggle('Off/On', block.permutation.getState('twm:state'));
                    modalForm.slider('Range', 0, (3 + i * 2), 1, block.permutation.getState('twm:rangeSelected'));
                    modalForm
                        .show(player)
                        .then(formData => {
                            if (formData.formValues != undefined) {
                                block.setPermutation(block.permutation.withState('twm:state', formData.formValues[0]))
                                block.setPermutation(block.permutation.withState('twm:rangeSelected', formData.formValues[1]))
                            }
                        })
                }
            }
        },
        onTick(e) {
            const { block } = e
            let { x, y, z } = block.location


            if (block.permutation.getState('twm:rangeSelected') > (3 + block.permutation.getState('twm:range') * 2)) {
                block.setPermutation(block.permutation.withState('twm:rangeSelected', 3))
            }

            let entities = undefined
            let horStrength = 0, verStrength = 0, ydir = 0, zdir = 0, xdir = 0
            switch (block.permutation.getState('minecraft:facing_direction')) {
                case 'up':
                    y -= 1, x += 0.5, z += 0.5
                    verStrength = -0.25
                    ydir = -1
                    break
                case 'down':
                    y += 1, x += 0.5, z += 0.5
                    verStrength = 0.25
                    ydir = 1
                    break
                case 'north':
                    x += 0.5, z += 1
                    horStrength = 0.25
                    zdir = 1
                    break
                case 'south':
                    x += 0.5, z -= 0.5
                    horStrength = 0.25
                    zdir = -1
                    break
                case 'west':
                    z += 0.5, x += 1
                    horStrength = 0.25
                    xdir = 1
                    break
                case 'east':
                    z += 0.5, x -= 0.5
                    horStrength = 0.25
                    xdir = -1
                    break
            }
            if (block.permutation.getState('twm:state')) {
                for (let i = 0; i < block.permutation.getState('twm:rangeSelected'); i++) {
                    entities = block.dimension.getEntitiesAtBlockLocation({ x: x + i * xdir, y: y + i * ydir, z: z + i * zdir })
                    const blockatloc = block.dimension.getBlock({ x: x + i * xdir, y: y + i * ydir, z: z + i * zdir })
                    if (blockatloc != undefined) {
                        if (blockatloc.typeId != 'minecraft:air') {
                            break
                        }
                    }
                    if (entities != undefined) {
                        for (let j = 0; j < entities.length; j++) {
                            if (entities[j].typeId != 'minecraft:item') {
                                entities[j].applyKnockback(xdir, zdir, horStrength, verStrength)
                            }
                        }
                    }
                }
            }
        }
    })
})