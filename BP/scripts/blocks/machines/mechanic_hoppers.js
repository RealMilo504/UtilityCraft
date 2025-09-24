import { world, ItemStack, system } from '@minecraft/server'
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'


world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('utilitycraft:mechanic_hoppers', {
        onTick(e) {
            const { block, dimension } = e
            let { x, y, z } = block.location
            x += 0.5, z += 0.5, y += 0.375

            // If by any chance the script is executed when you break the machine, returns to avoid errors
            if (block?.typeId == 'minecraft:air') return;

            const hopper = block.dimension.getEntitiesAtBlockLocation(block.location)[0]
            if (!hopper) return

            const hopperInv = hopper?.getComponent('minecraft:inventory').container
            if (!hopperInv) return


            let speed = 4 * (2 ** block.permutation.getState('utilitycraft:speed'))
            const acceptedItems = hopper?.getTags()
            let state = hopper.getDynamicProperty('utilitycraft:whitelistOn')

            const direction = block.permutation.getState('minecraft:block_face')
            const hasFilter = block.permutation.getState('utilitycraft:filter')

            let firstBlock = undefined

            let initialchest = undefined
            if (block.typeId == 'utilitycraft:mechanic_hopper' || (block.typeId == 'utilitycraft:mechanic_dropper' && direction == 'up')) {
                y += 1
                firstBlock = block.above(1)
            }
            if (block.typeId == 'utilitycraft:mechanic_upper' || (block.typeId == 'utilitycraft:mechanic_dropper' && direction != 'up')) {
                y -= 1
                firstBlock = block.below(1)
            }

            if (firstBlock?.typeId.includes('dustveyn:storage_drawers')) {
                const firstEnt = dimension.getEntitiesAtBlockLocation(firstBlock.location)[0]
                if (!firstEnt) return
                let itemToTransfer = firstEnt.getTags()[0]
                if (!itemToTransfer) return
                const firstId = firstEnt.scoreboardIdentity
                let firstAmount = Math.min(speed, world.scoreboard.getObjective("capacity").getScore(firstId))
                if (firstAmount == 0) return
                if (hasFilter) {
                    if (entity.hasTag(`filt:${itemToTransfer}`) != state) return
                }
                hopperInv.addItem(new ItemStack(itemToTransfer, firstAmount))
                firstEnt.runCommandAsync(`scoreboard players add @s capacity ${-firstAmount}`);
            } else {
                initialchest = firstBlock?.getComponent('minecraft:inventory')

                const initialentity = block.dimension.getEntities({ families: ["dorios:container"], maxDistance: 0.4, location: { x, y, z } })[0]
                const items = block.dimension.getEntities({ type: 'item', location: { x, y: y - 0.5, z }, maxDistance: 0.75 })
                const initialInv = (initialchest != undefined) ? initialchest.container : ((initialentity != undefined) ? initialentity.getComponent('minecraft:inventory').container : undefined)

                let firstIsSimple = initialentity?.getComponent("minecraft:type_family").hasTypeFamily('dorios:simple_output')
                let firstIsComplex = initialentity?.getComponent("minecraft:type_family").hasTypeFamily('dorios:complex_output')
                if (firstIsComplex) firstIsSimple = false

                if (initialInv != undefined && hopperInv?.emptySlotsCount != 0) {
                    for (let i = 0; i < initialInv.size; i++) {
                        if (initialInv.getItem(i) && hopperInv.emptySlotsCount != 0) {
                            if (firstIsSimple && i != initialInv.size - 1) continue
                            if (firstIsComplex && (initialInv.size - 9 > i)) continue
                            if (acceptedItems.includes(initialInv.getItem(i).typeId) == state || !hasFilter) {
                                let item = initialInv.getItem(i), itemnew = initialInv.getItem(i)
                                speed = (speed <= item.amount) ? speed : item.amount
                                itemnew.amount = speed
                                hopperInv.addItem(itemnew)
                                if (initialInv.getSlot(i).amount > speed) {
                                    item.amount -= speed
                                    initialInv.setItem(i, item)
                                } else {
                                    initialInv.setItem(i,)
                                }
                                break
                            }
                        }
                    }
                } else {
                    if (items[0] != undefined && hopperInv.emptySlotsCount != 0) {
                        for (let i = 0; i < items.length; i++) {
                            if (hopperInv.emptySlotsCount != 0) {
                                let item = items[i].getComponent('item').itemStack
                                if (acceptedItems.includes(item.typeId) == state || !hasFilter) {
                                    hopperInv.addItem(item)
                                    items[i].kill()
                                    break
                                }
                            }
                        }
                    }
                }
            }
            if (block.typeId == 'utilitycraft:mechanic_hopper' && (direction == 'up' || direction == 'down') || (block.typeId == 'utilitycraft:mechanic_dropper' && direction == 'up')) {
                y -= 2
            }
            if (block.typeId == 'utilitycraft:mechanic_upper' && (direction == 'up' || direction == 'down') || (block.typeId == 'utilitycraft:mechanic_dropper' && direction != 'up')) {
                y += 2
            }

            if (direction != 'up' && direction != 'down' && block.typeId != 'utilitycraft:mechanic_dropper') {
                y = (block.typeId == 'utilitycraft:mechanic_hopper') ? y = y - 1 : y += 1
                switch (direction) {
                    case 'north':
                        z += 1
                        break
                    case 'south':
                        z -= 1
                        break
                    case 'east':
                        x -= 1
                        break
                    case 'west':
                        x += 1
                        break
                }
            } else {
                y = (direction == 'up') ? y -= 0.25 : y += 0.25
            }
            const nextBlock = block.dimension.getBlock({ x, y, z })
            if (nextBlock.typeId.includes('dustveyn:storage_drawers')) {
                for (let i = 0; i < hopperInv.size; i++) {
                    let itemToTransfer = hopperInv.getItem(i)
                    if (!itemToTransfer) continue
                    const targetEnt = dimension.getEntitiesAtBlockLocation(nextBlock.location)[0];
                    if (!targetEnt.hasTag(`${itemToTransfer?.typeId}`)) continue
                    const targetId = targetEnt.scoreboardIdentity
                    let capacity = world.scoreboard.getObjective("capacity").getScore(targetId)
                    let max_capacity = world.scoreboard.getObjective("max_capacity").getScore(targetId)
                    if (capacity < max_capacity) {
                        let amount = Math.min(itemToTransfer.amount, max_capacity - capacity, speed)
                        itemToTransfer.amount > amount ? itemToTransfer.amount -= amount : itemToTransfer = undefined;
                        hopperInv.setItem(i, itemToTransfer);
                        targetEnt.runCommandAsync(`scoreboard players add @s capacity ${amount}`);
                        return
                    }
                    continue
                }
                return
            }
            const nextchest = nextBlock.getComponent('minecraft:inventory')
            const nextentity = block.dimension.getEntities({ families: ['dorios:container'], location: { x, y, z }, maxDistance: 0.3 })[0]
            const nextInv = (nextchest != undefined) ? nextchest.container : ((nextentity != undefined) ? nextentity.getComponent('minecraft:inventory').container : undefined)


            if (nextInv != undefined || block.typeId == 'utilitycraft:mechanic_dropper') {
                if (nextentity?.typeId == 'utilitycraft:assembler' && nextInv.emptySlotsCount < 2) return
                if (nextentity?.getComponent("minecraft:type_family")?.hasTypeFamily("dorios:simple_input")) {
                    const slotNext = nextInv.getItem(3);
                    for (let i = 0; i < hopperInv.size; i++) {
                        let itemToTransfer = hopperInv.getItem(i);
                        if (!itemToTransfer) continue
                        if (!slotNext) {
                            hopperInv.transferItem(i, nextInv);
                            break
                        }
                        speed = Math.min(itemToTransfer.amount, 64 - slotNext.amount, speed);
                        if (itemToTransfer.typeId == slotNext.typeId && slotNext.amount < 64) {
                            nextInv.addItem(new ItemStack(itemToTransfer.typeId, speed));
                            itemToTransfer.amount > speed ? itemToTransfer.amount -= speed : itemToTransfer = undefined;
                            hopperInv.setItem(i, itemToTransfer);
                            break
                        }
                    }
                    return
                }
                for (let j = 0; j < hopperInv.size; j++) {
                    if (hopperInv.getItem(j) != undefined && (nextInv?.emptySlotsCount != 0 || block.typeId == 'utilitycraft:mechanic_dropper')) {
                        let item = hopperInv.getItem(j), itemnew = hopperInv.getItem(j)
                        speed = (speed <= item.amount) ? speed : item.amount
                        itemnew.amount = speed
                        if (block.typeId != 'utilitycraft:mechanic_dropper') {
                            nextInv.addItem(itemnew)
                        } else {
                            block.dimension.spawnItem(itemnew, { x, y, z })
                        }
                        if (hopperInv.getSlot(j).amount > speed) {
                            item.amount -= speed
                            hopperInv.setItem(j, item)
                        } else {
                            hopperInv.setItem(j,)
                        }
                        break
                    }
                }

            }
        },
        onPlace(e) {
            const { block } = e
            let { x, y, z } = block.location
            x += 0.5, z += 0.5, y += 0.375

            system.run(() => {
                const entity = block.dimension.spawnEntity('utilitycraft:mechanic_hopper', { x, y, z })
                entity.setDynamicProperty('utilitycraft:whitelistOn', true)
            })
        },
        onPlayerDestroy(e) {
            const { block } = e
            let { x, y, z } = block.location
            x += 0.5, z += 0.5, y += 0.375
            const entity = block.dimension.getEntitiesAtBlockLocation(block.location)[0]
            if (!entity) return
            const inv = entity.getComponent('minecraft:inventory').container
            for (let j = 0; j < inv.size; j++) {
                if (inv.getItem(j) != undefined) {
                    let item = inv.getItem(j)
                    block.dimension.spawnItem(item, { x, y, z })
                }
            }
            entity.remove()
        },
        onPlayerInteract(e) {
            const { block, player } = e
            let { x, y, z } = block.location
            x += 0.5, z += 0.5, y += 0.375
            if (player.isSneaking) return
            const hasFilter = block.permutation.getState('utilitycraft:filter')
            if (!hasFilter) return
            const mainHand = player.getComponent('equippable').getEquipment('Mainhand')
            if (mainHand?.typeId.includes('wrench')) return
            openMenu({ x, y, z }, block, player)
        }
    })
})

function openMenu({ x, y, z }, block, player) {
    let menu = new ActionFormData()
    const hopper = block.dimension.getEntitiesAtBlockLocation(block.location)[0]
    let state = hopper.getDynamicProperty('utilitycraft:whitelistOn')

    menu.title('Filter')

    if (state) {
        menu.button(`Whitelist Mode \n(Click to Change)`, 'textures/items/whitelist.png')
    } else {
        menu.button(`Blacklist Mode \n(Click to Change)`, 'textures/items/blacklist.png')

    }

    menu.button(`Add item \n(Adds the item in your Mainhand)`)

    const acceptedItems = hopper.getTags()

    if (acceptedItems) {
        for (let item of acceptedItems) {
            menu.button(`${formatId(item)}`)
        }
    }

    menu.show(player)
        .then(result => {
            let selection = result.selection
            if (selection == undefined) return;

            if (selection == 0) {
                hopper.setDynamicProperty('utilitycraft:whitelistOn', !state)
                openMenu({ x, y, z }, block, player)
                return
            }

            if (selection == 1) {
                const mainHand = player.getComponent('equippable').getEquipment('Mainhand')
                if (mainHand) {
                    hopper.addTag(`${mainHand.typeId}`)
                }
                return
            }
            hopper.removeTag(`${acceptedItems[selection - 2]}`)
            openMenu({ x, y, z }, block, player)
        })
}

function formatId(id) {
    // Elimina el prefijo (antes de los dos puntos)
    const parts = id.split(':');
    const name = parts[1] || parts[0]; // Por si no hay prefijo

    // Reemplaza guiones bajos con espacios y capitaliza cada palabra
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
