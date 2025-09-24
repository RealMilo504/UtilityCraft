import { world, system, ItemStack } from '@minecraft/server'
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'

const blockFaceOffsets = {
    up: [0, -1, 0],
    down: [0, 1, 0],
    north: [0, 0, 1],
    south: [0, 0, -1],
    west: [1, 0, 0],
    east: [-1, 0, 0],
};

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('utilitycraft:exporter', {
        beforeOnPlayerPlace(e) {
            const { block } = e
            let { x, y, z } = block.location
            y += 0.375, x += 0.5, z += 0.5
            system.run(() => {
                const entity = block.dimension.spawnEntity('utilitycraft:pipe', { x, y, z })
                entity.setDynamicProperty('utilitycraft:whitelistOn', true)
            })
        },
        onPlayerDestroy(e) {
            e.block.dimension.getEntitiesAtBlockLocation(e.block.location)[0].remove()
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
        },
        onTick(e) {
            const { block, dimension } = e
            let { x, y, z } = block.location

            const entity = dimension.getEntitiesAtBlockLocation(block.location)[0]
            if (!entity) return
            let state = entity.getDynamicProperty('utilitycraft:whitelistOn')
            const hasFilter = block.permutation.getState('utilitycraft:filter')

            const face = block.permutation.getState("minecraft:block_face");
            const faceOffset = blockFaceOffsets[face];

            if (faceOffset) {
                x = x + faceOffset[0];
                y = y + faceOffset[1];
                z = z + faceOffset[2];
            }

            const firstBlock = dimension.getBlock({ x, y, z })
            if (!firstBlock) return

            const tags = entity.getTags().filter(tag =>
                tag.startsWith("ent:[") || tag.startsWith("van:[") || tag.startsWith("dra:[")
            );
            if (!tags) return

            let targetEnt = undefined
            let nextInv = undefined;

            // Drawers Temporal. Will be reworked
            if (firstBlock.typeId.includes('dustveyn:storage_drawers')) {
                const firstEnt = dimension.getEntitiesAtBlockLocation(firstBlock.location)[0]
                if (!firstEnt) return
                let itemToTransfer = firstEnt.getTags()[0]
                if (!itemToTransfer) return
                const firstId = firstEnt.scoreboardIdentity
                let firstAmount = Math.min(64, world.scoreboard.getObjective("capacity").getScore(firstId))
                if (firstAmount == 0) return
                if (hasFilter) {
                    if (entity.hasTag(`filt:${itemToTransfer}`) != state) return
                }
                for (const tag of tags) {
                    const coords = tag.substring(4)
                        .split(",")
                        .map(val => parseInt(val.replace(/[^\d-]/g, '')));
                    const pos = { x: coords[0], y: coords[1], z: coords[2] };

                    const targetBlock = dimension.getBlock(pos);
                    if (tag.startsWith('van')) {
                        nextInv = targetBlock?.getComponent("minecraft:inventory")?.container;
                        if (nextInv.emptySlotsCount == 0) continue
                        nextInv.addItem(new ItemStack(itemToTransfer, firstAmount))
                        firstEnt.runCommandAsync(`scoreboard players add @s capacity ${-firstAmount}`);
                        return

                    }
                    targetEnt = dimension.getEntitiesAtBlockLocation(pos)[0];
                    if (!targetEnt) continue
                    // Drawers section
                    if (tag.startsWith('dra')) {
                        if (!targetEnt.hasTag(`${itemToTransfer}`)) continue
                        const targetId = targetEnt.scoreboardIdentity
                        let capacity = world.scoreboard.getObjective("capacity").getScore(targetId)
                        let max_capacity = world.scoreboard.getObjective("max_capacity").getScore(targetId)
                        if (capacity < max_capacity) {
                            let amount = Math.min(firstAmount, max_capacity - capacity)
                            firstEnt.runCommandAsync(`scoreboard players add @s capacity ${-amount}`);
                            targetEnt.runCommandAsync(`scoreboard players add @s capacity ${amount}`);
                            return
                        }
                        continue
                    }
                    nextInv = targetEnt?.getComponent("minecraft:inventory")?.container;
                    if (!nextInv) continue
                    if (targetEnt?.getComponent("minecraft:type_family").hasTypeFamily('dorios:simple_input')) {
                        const nextSlot = nextInv.getItem(3)
                        if (!nextSlot) {
                            nextInv.addItem(new ItemStack(itemToTransfer, firstAmount))
                            firstEnt.runCommandAsync(`scoreboard players add @s capacity ${-firstAmount}`);
                            return
                        }
                        if (nextSlot.typeId != itemToTransfer) continue
                        if (nextSlot.amount < 64) {
                            const amount = Math.min(firstAmount, 64 - nextSlot.amount);
                            nextSlot.amount += amount
                            nextInv.setItem(3, nextSlot)
                            firstEnt.runCommandAsync(`scoreboard players add @s capacity ${-amount}`);
                            return
                        }
                        continue
                    }
                    const nextFilter = targetBlock.permutation.getState('utilitycraft:filter')
                    if (nextFilter) {
                        if (targetEnt.hasTag(`${itemToTransfer}`) != targetEnt.getDynamicProperty('utilitycraft:whitelistOn')) continue
                    }
                    if (targetEnt.typeId == 'utilitycraft:assembler' && nextInv.emptySlotsCount < 2) continue
                    nextInv.addItem(new ItemStack(itemToTransfer, firstAmount))
                    firstEnt.runCommandAsync(`scoreboard players add @s capacity ${-firstAmount}`);
                    return
                }
                return
            }



            let firstInv = undefined
            let firstIsSimple = false
            let firstIsComplex = false

            if (vanillaContainers.includes(firstBlock.typeId)) {
                firstInv = firstBlock.getComponent('minecraft:inventory').container
            }
            if (firstBlock.hasTag('dorios:item')) {
                const firstEnt = dimension.getEntitiesAtBlockLocation(firstBlock.location)[0]
                if (!firstEnt) return
                firstInv = firstEnt.getComponent("minecraft:inventory")?.container
                let firstTF = firstEnt.getComponent("minecraft:type_family")
                firstIsSimple = firstTF.hasTypeFamily('dorios:simple_output')
                firstIsComplex = firstTF.hasTypeFamily('dorios:complex_output')
                if (firstIsComplex) firstIsSimple = false
            }

            if (!firstInv) return
            if (firstInv.emptySlotsCount == firstInv.size) return

            for (let i = 0; i < firstInv.size; i++) {
                let itemToTransfer = firstInv.getItem(i)
                if (!itemToTransfer) continue
                if (firstIsSimple && i != firstInv.size - 1) continue
                if (firstIsComplex && firstInv.size - 9 > i) continue
                if (hasFilter) {
                    if (entity.hasTag(`filt:${itemToTransfer.typeId}`) != state) continue
                }
                for (const tag of tags) {
                    const coords = tag.substring(4)
                        .split(",")
                        .map(val => parseInt(val.replace(/[^\d-]/g, '')));
                    const pos = { x: coords[0], y: coords[1], z: coords[2] };

                    const targetBlock = dimension.getBlock(pos);
                    if (tag.startsWith('van')) {
                        nextInv = targetBlock?.getComponent("minecraft:inventory")?.container;
                        const transfered = firstInv.transferItem(i, nextInv)
                        if (!transfered) return
                        continue
                    }
                    targetEnt = dimension.getEntitiesAtBlockLocation(pos)[0];
                    if (!targetEnt) continue
                    // Drawers section
                    if (tag.startsWith('dra')) {
                        if (!targetEnt.hasTag(`${itemToTransfer?.typeId}`)) continue
                        const targetId = targetEnt.scoreboardIdentity
                        let capacity = world.scoreboard.getObjective("capacity").getScore(targetId)
                        let max_capacity = world.scoreboard.getObjective("max_capacity").getScore(targetId)
                        if (capacity < max_capacity) {
                            let amount = Math.min(itemToTransfer.amount, max_capacity - capacity)
                            itemToTransfer.amount > amount ? itemToTransfer.amount -= amount : itemToTransfer = undefined;
                            firstInv.setItem(i, itemToTransfer);
                            targetEnt.runCommandAsync(`scoreboard players add @s capacity ${amount}`);
                            return
                        }
                        continue
                    }
                    nextInv = targetEnt?.getComponent("minecraft:inventory")?.container;
                    if (!nextInv) continue
                    if (targetEnt?.getComponent("minecraft:type_family").hasTypeFamily('dorios:simple_input')) {
                        const nextSlot = nextInv.getItem(3)
                        if (!nextSlot) {
                            firstInv.transferItem(i, nextInv)
                            return
                        }
                        if (nextSlot.typeId != itemToTransfer.typeId) continue
                        if (nextSlot.amount < 64) {
                            const amount = Math.min(itemToTransfer.amount, 64 - nextSlot.amount);
                            nextSlot.amount += amount
                            nextInv.setItem(3, nextSlot)
                            itemToTransfer.amount > amount ? itemToTransfer.amount -= amount : itemToTransfer = undefined;
                            firstInv.setItem(i, itemToTransfer);
                            return
                        }
                        continue
                    }
                    const nextFilter = targetBlock.permutation.getState('utilitycraft:filter')
                    if (nextFilter) {
                        if (targetEnt.hasTag(`${itemToTransfer.typeId}`) != targetEnt.getDynamicProperty('utilitycraft:whitelistOn')) continue
                    }
                    if (targetEnt.typeId == 'utilitycraft:assembler' && nextInv.emptySlotsCount < 2) continue
                    const transfered = firstInv.transferItem(i, nextInv)
                    if (!transfered) return
                    continue
                }
            }
        }
    })
})









function openMenu({ x, y, z }, block, player) {
    let menu = new ActionFormData()
    const entity = block.dimension.getEntitiesAtBlockLocation(block.location)[0]
    let state = entity.getDynamicProperty('utilitycraft:whitelistOn')

    menu.title('Filter')

    if (state) {
        menu.button(`Whitelist Mode \n(Click to Change)`, 'textures/items/whitelist.png')
    } else {
        menu.button(`Blacklist Mode \n(Click to Change)`, 'textures/items/blacklist.png')

    }

    menu.button(`Add item \n(Adds the item in your Mainhand)`)

    const acceptedItems = entity.getTags().filter(tag => tag.startsWith("filt:"));

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
                entity.setDynamicProperty('utilitycraft:whitelistOn', !state)
                openMenu({ x, y, z }, block, player)
                return
            }

            if (selection == 1) {
                const mainHand = player.getComponent('equippable').getEquipment('Mainhand')
                if (mainHand) {
                    entity.addTag(`filt:${mainHand.typeId}`)
                }
                return
            }
            entity.removeTag(`${acceptedItems[selection - 2]}`)
            openMenu({ x, y, z }, block, player)
        })
}

function formatId(id) {
    // Elimina el prefijo (antes de los dos puntos)
    const parts = id.split(':');
    const name = parts[2]

    // Reemplaza guiones bajos con espacios y capitaliza cada palabra
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}