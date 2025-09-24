import { world } from '@minecraft/server'
import { ModalFormData } from '@minecraft/server-ui'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:xp_magnet', {
        onTick(e) {
            const { block } = e
            let { x, y, z } = block.location
            if (block.permutation.getState('twm:isOn')) {
                block.dimension.runCommand(`tp @e[type=xp_orb, r=${block.permutation.getState('twm:rangeSelected')}, x= ${x}, y=${y}, z=${z}] ${x} ${y + 0.1} ${z}`)
            }
        },
        onPlayerInteract(e) {
            const { block, player } = e
            const modalForm = new ModalFormData().title('Xp Magnet Settings');
            const hand = player.getComponent('equippable').getEquipment('Mainhand')
            if (hand == undefined && player.isSneaking == false) {
                modalForm.toggle('Off/On', block.permutation.getState('twm:isOn'));
                modalForm.slider('Radius', 0, 11, 1, block.permutation.getState('twm:rangeSelected'));
                modalForm
                    .show(player)
                    .then(formData => {
                        if (formData.formValues != undefined) {
                            block.setPermutation(block.permutation.withState('twm:isOn', formData.formValues[0]))
                            block.setPermutation(block.permutation.withState('twm:rangeSelected', formData.formValues[1]))
                        }
                    })
            }
        }
    })
})