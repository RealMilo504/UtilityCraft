import { world } from '@minecraft/server'
import { ModalFormData } from '@minecraft/server-ui';

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:ender_hopper', {
        onPlayerInteract(e) {
            const { block, player } = e
            let { x, y, z } = block.location
            x += 0.5, z += 0.5, y += 0.2
            const equipment = player.getComponent('equippable')
            const selectItem = equipment.getEquipment('Mainhand')
            const modalForm = new ModalFormData().title('Ender Hopper Settings');
            for (let i = 0; i <= 5; i++) {
                if (block.permutation.getState('twm:range') == i && selectItem == undefined && player.isSneaking == false) {
                    modalForm.toggle('Off/On', block.permutation.getState('twm:state'));
                    modalForm.slider('Radius', 0, (3 + i * 2), 1, block.permutation.getState('twm:rangeSelected'));
                    modalForm
                        .show(player)
                        .then(formData => {
                            if (formData.formValues != undefined) {
                                block.setPermutation(block.permutation.withState('twm:state', formData.formValues[0]))
                                block.setPermutation(block.permutation.withState('twm:rangeSelected', formData.formValues[1]))
                                switch (formData.formValues[0]) {
                                    case true:
                                        block.dimension.runCommand(`summon twm:ender_hopper tile.twm:ender_hopper.name ${x} ${y} ${z}`)
                                        block.dimension.runCommandAsync(`tag @e[type=twm:ender_hopper,x=${x},y=${y},z=${z}] add enderhopper`)
                                        break
                                    case false:
                                        block.dimension.runCommandAsync(`tag @e[type=twm:ender_hopper,x=${x},y=${y},z=${z}] add despawn`)
                                }
                            }
                        })
                }
            }
        },
        onTick(e) {
            const { block } = e
            let { x, y, z } = block.location
            x += 0.5, z += 0.5, y += 0.2
            block.dimension.runCommand(`particle minecraft:end_chest ${x} ${y} ${z}`)
            if (block.permutation.getState('twm:rangeSelected') > (3 + block.permutation.getState('twm:range') * 2)) {
                block.setPermutation(block.permutation.withState('twm:rangeSelected', 3))
            }
            if (block.permutation.getState('twm:state')) {
                const radius = block.permutation.getState('twm:rangeSelected')
                block.dimension.runCommand(`tp @e[x=${x},y=${y},z=${z},r=${radius + 0.5},rm=0.5,type=item] ${x} ${y + 0.4} ${z} `)
            }
            const entity = block.dimension.getEntities({ tags: ["enderhopper"], maxDistance: 0.1, location: { x, y, z } })[0]
            y -= 1.2
            const chest = block.dimension.getBlock({ x, y, z }).getComponent('minecraft:inventory')
            if (chest != undefined && entity != undefined) {
                const inventory = entity.getComponent('minecraft:inventory').container
                for (let i = 0; i < 5; i++) {
                    if (inventory.getItem(i) != undefined && chest.container.emptySlotsCount != 0) {
                        let item = inventory.getItem(i), itemnew = inventory.getItem(i)
                        itemnew.amount = 1
                        chest.container.addItem(itemnew)
                        if (inventory.getSlot(i).amount > 1) {
                            item.amount--
                            inventory.setItem(i, item)
                        } else {
                            inventory.setItem(i,)
                        }
                        break
                    }
                }
            }
        },
        onPlayerDestroy(e) {
            const { block } = e
            let { x, y, z } = block.location
            x += 0.5, z += 0.5, y += 0.2
            const inv = block.dimension.getEntities({ tags: ["enderhopper"], maxDistance: 0.1, location: { x, y, z } })[0].getComponent('minecraft:inventory').container
            for (let j = 0; j < inv.size; j++) {
                if (inv.getItem(j) != undefined) {
                    let item = inv.getItem(j)
                    block.dimension.spawnItem(item, { x, y, z })
                }
            }
        }
    })
})