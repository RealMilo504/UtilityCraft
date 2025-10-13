import { world, system, ItemStack } from '@minecraft/server'
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'
import { LiquidManager } from './machinery/managers.js'

const vanillaContainers = [
    'minecraft:chest',
    'minecraft:trapped_chest',
    'minecraft:barrel',
    'minecraft:furnace',
    'minecraft:blast_furnace',
    'minecraft:hopper',
    'minecraft:smoker',
    'minecraft:shulker',
    'minecraft:dropper'
];

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

const caps = {
    'utilitycraft:basic_fluid_tank': 8000,
    'utilitycraft:advanced_fluid_tank': 32000,
    'utilitycraft:expert_fluid_tank': 128000,
    'utilitycraft:ultimate_fluid_tank': 512000,
    'utilitycraft:basic_magmator': 8000 * 1,
    'utilitycraft:advanced_magmator': 8000 * 4,
    'utilitycraft:expert_magmator': 8000 * 16,
    'utilitycraft:ultimate_magmator': 8000 * 100,
    'utilitycraft:basic_thermo_generator': 2000 * 1,
    'utilitycraft:advanced_thermo_generator': 2000 * 4,
    'utilitycraft:expert_thermo_generator': 2000 * 16,
    'utilitycraft:ultimate_thermo_generator': 2000 * 100,
    'utilitycraft:magmatic_chamber': 16000
};
const liquids = {
    'minecraft:water': 'water',
    'minecraft:lava': 'lava'
}
world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('utilitycraft:extractor', {
        beforeOnPlayerPlace(e) {
            const { block } = e
            let { x, y, z } = block.location
            y += 0.375, x += 0.5, z += 0.5
            system.run(() => {
                block.dimension.spawnEntity('utilitycraft:pipe', { x, y, z })
            })
        },
        onPlayerDestroy(e) {
            e.block.dimension.getEntitiesAtBlockLocation(e.block.location)[0].remove()
        },
        onTick(e) {
            const { block, dimension } = e
            let { x, y, z } = block.location

            // If by any chance the script is executed when you break the machine, returns to avoid errors
            if (block?.typeId == 'minecraft:air') return;

            const entity = dimension.getEntitiesAtBlockLocation(block.location)[0]
            if (!entity) return

            const face = block.permutation.getState("minecraft:block_face")
            const faceOffset = blockFaceOffsets[face]
            if (faceOffset) {
                x += faceOffset[0]
                y += faceOffset[1]
                z += faceOffset[2]
            }

            const firstBlock = dimension.getBlock({ x, y, z })
            if (!firstBlock) return

            const firstContainer = dimension.getEntitiesAtBlockLocation(firstBlock.location)[0]
            let firstLiquid = null
            let firstAmount = 0
            let liquidType = null
            let isInfinite = false
            let speed = 1000 * (2 ** block.permutation.getState('utilitycraft:speed'))

            // Detectar tipo de fuente
            if (firstContainer) {
                const indexTag = firstContainer.getTags().filter(tag => {
                    if (!tag.startsWith('liquid')) return false
                    const type = tag.split(':')[1]
                    if (type != 'empty') return true
                    return false
                })[0]
                if (!indexTag) return
                const index = parseInt(indexTag.split('Type:')[0].split('liquid')[1])

                firstLiquid = new LiquidManager(firstContainer, null, index)
                firstAmount = firstLiquid.get()
                if (firstAmount <= 0) return
                liquidType = firstLiquid.type
            } else if (liquids[firstBlock.typeId]) {
                // Bloques líquidos vanilla
                if (firstBlock.permutation.getState("liquid_depth") !== 0) return
                firstAmount = 1000
                liquidType = liquids[firstBlock.typeId]
            } else if (firstBlock.typeId === 'utilitycraft:crucible') {
                const lavaLevel = firstBlock.permutation.getState('utilitycraft:lava')
                if (lavaLevel < 1) return
                firstAmount = 250 * lavaLevel
                liquidType = 'lava'
            } else if (firstBlock.typeId === 'utilitycraft:sink') {
                liquidType = 'water'
                firstAmount = Infinity
                isInfinite = true
            } else {
                return // Fuente inválida
            }

            const tags = entity.getTags()
            if (!tags) return

            let nextType, nextAmount, nextCap

            for (const tag of tags) {
                const coords = tag.slice(5, -1).split(",").map(Number)
                const pos = { x: coords[0], y: coords[1], z: coords[2] }

                const targetEnt = dimension.getEntitiesAtBlockLocation(pos)[0]
                const nextBlock = dimension.getBlock(pos)

                if (targetEnt) {
                    let index = 0
                    if (targetEnt.hasTag('dorios:multi_liquids')) {
                        let liquidsMax = world.scoreboard.getObjective('maxLiquids').getScore(targetEnt.scoreboardIdentity) ?? 0
                        let count = 0
                        const indexTag = targetEnt.getTags().filter(tag => {
                            if (!tag.startsWith('liquid')) return false
                            if (count > liquidsMax) return false
                            count++
                            const type = tag.split(':')[1]
                            if (type == 'empty' || type == liquidType) return true
                            return false
                        })[0]
                        if (indexTag) {
                            index = parseInt(indexTag.split('Type:')[0].split('liquid')[1])
                        } else index = count
                    }
                    const targetLiquid = new LiquidManager(targetEnt, null, index)

                    nextAmount = targetLiquid.get()
                    nextType = targetLiquid.type
                    nextCap = targetLiquid.getCap()

                    if (!nextCap) continue
                    if ((nextType !== liquidType && nextType != 'empty')) continue
                    if (nextAmount >= nextCap) continue

                    const transfer = Math.min(speed, firstAmount, nextCap - nextAmount)
                    if (transfer <= 0) continue

                    if (nextBlock.typeId.includes('fluid_tank')) {
                        LiquidManager.addLiquidToTank(nextBlock, liquidType, transfer)
                    } else {
                        targetLiquid.setType(liquidType)
                        targetLiquid.add(transfer)
                    }

                    // Actualiza fuente
                    if (!isInfinite) {
                        firstAmount -= transfer

                        if (firstContainer) {
                            firstLiquid.add(-transfer)
                            if (firstContainer.typeId.includes('fluid_tank')) {
                                firstContainer.getComponent('minecraft:health').setCurrentValue(firstAmount)
                            }
                            if (firstAmount <= 0 && firstBlock.typeId.includes('fluid_tank')) {
                                firstContainer.remove()
                                firstBlock.setPermutation(firstBlock.permutation.withState('utilitycraft:hasliquid', false))
                            }
                        } else if (liquids[firstBlock.typeId]) {
                            firstBlock.setType('minecraft:air')
                        } else if (firstBlock.typeId === 'utilitycraft:crucible') {
                            firstBlock.setPermutation(firstBlock.permutation.withState('utilitycraft:lava', 0))
                        }
                    }

                    return
                }

                // Si no hay entidad y es un tag de tanque (crear nuevo tanque)
                if (tag.startsWith("tan:") && !targetEnt && nextBlock?.typeId.includes('fluid_tank')) {
                    const nextBlock = dimension.getBlock(pos)
                    const transfer = Math.min(speed, firstAmount)
                    LiquidManager.addLiquidToTank(nextBlock, liquidType, transfer)

                    if (!isInfinite) {
                        firstAmount -= transfer

                        if (firstContainer) {
                            firstLiquid.add(-transfer)
                            if (firstContainer.typeId.includes('fluid_tank')) {
                                firstContainer.getComponent('minecraft:health').setCurrentValue(firstAmount)
                            }
                            if (firstAmount <= 0 && firstBlock.typeId.includes('fluid_tank')) {
                                firstContainer.remove()
                                firstBlock.setPermutation(firstBlock.permutation.withState('utilitycraft:hasliquid', false))
                            }
                        } else if (liquids[firstBlock.typeId]) {
                            firstBlock.setType('minecraft:air')
                        } else if (firstBlock.typeId === 'utilitycraft:crucible') {
                            firstBlock.setPermutation(firstBlock.permutation.withState('utilitycraft:lava', 0))
                        }
                    }
                    return
                }
            }

        }
    })
})

// Check surronding blocks, if its compatible, it sets the permutation to show the bone
function updateGeometry(block, tag) {
    const directions = {
        up: block.above(1),
        down: block.below(1),
        north: block.north(1),
        south: block.south(1),
        east: block.east(1),
        west: block.west(1)
    };
    for (const [dir, neighbor] of Object.entries(directions)) {
        const shouldConnect =
            // Check if its from the same category
            neighbor?.hasTag(`${tag}`)
            // If its a conduit, vanilla containers needs to be considered
            || (block.hasTag('dorios:item') && (vanillaContainers.includes(neighbor?.typeId) /*Borrar*/ || neighbor?.typeId.includes('dustveyn:storage_drawers')/*Borrar*/));

        // Set the perm
        block.setPermutation(block.permutation.withState(`utilitycraft:${dir}`, shouldConnect));
    }
}

function updateGeometryExporter(block, tag) {
    const permutation = block.permutation;
    const facing = permutation.getState("minecraft:block_face");

    const directionMap = {
        north: { north: "south", south: "north", east: "west", west: "east", up: "up", down: "down" },
        south: { north: "north", south: "south", east: "east", west: "west", up: "up", down: "down" },
        east: { north: "east", south: "west", east: "south", west: "north", up: "up", down: "down" },
        west: { north: "west", south: "east", east: "north", west: "south", up: "up", down: "down" },
        up: { north: "up", south: "down", east: "east", west: "west", up: "south", down: "north" },
        down: { north: "down", south: "up", east: "east", west: "west", up: "north", down: "south" }
    };

    const neighborAccess = {
        up: block.above(1),
        down: block.below(1),
        north: block.north(1),
        south: block.south(1),
        east: block.east(1),
        west: block.west(1)
    };

    const map = directionMap[facing] || directionMap.north;

    let newPerm = permutation;

    for (const [dir, visualDir] of Object.entries(map)) {
        const neighbor = neighborAccess[dir];
        const shouldConnect =
            neighbor?.hasTag(tag) ||
            (block.hasTag("dorios:item") && (vanillaContainers.includes(neighbor?.typeId) /*Borrar*/ || neighbor?.typeId.includes('dustveyn:storage_drawers')/*Borrar*/));

        newPerm = newPerm.withState(`utilitycraft:${visualDir}`, shouldConnect);
    }

    block.setPermutation(newPerm);
}

system.afterEvents.scriptEventReceive.subscribe(e => {
    const { id, message, sourceEntity } = e

    if (id == 'dorios:updatePipes') {
        const type = message.split('|')[0]
        const [x, y, z] = message.split('|')[1].slice(1, -1).split(",").map(Number);
        const block = sourceEntity.dimension.getBlock({ x, y, z })

        if (type == 'energy') {
            updatePipes(block, 'dorios:energy', startRescanEnergy);
        }

        if (type == 'item') {
            updatePipes(block, 'dorios:item', startRescanItem);
        }

        if (type == 'fluid') {
            updatePipes(block, 'dorios:fluid', startRescanFluid);
        }
    }
})

// Executes the scan function and update geometry
function updatePipes(block, tag, rescanFunction) {
    const directions = [
        block,
        block.above(1),
        block.below(1),
        block.north(1),
        block.south(1),
        block.east(1),
        block.west(1)
    ];
    let network = undefined
    for (const neighbor of directions) {
        if (!neighbor?.hasTag(tag)) continue
        const key = `${neighbor.location.x},${neighbor.location.y},${neighbor.location.z}`;
        if (!network?.has(key)) {
            network = rescanFunction(neighbor.location, block.dimension);
        };

        if (neighbor?.hasTag('dorios:isExporter')) {
            updateGeometryExporter(neighbor, tag);
        } else if (neighbor?.hasTag('dorios:isTube')) {
            updateGeometry(neighbor, tag);
        }
    }
}

world.afterEvents.playerBreakBlock.subscribe(e => {
    const { block, brokenBlockPermutation } = e;
    system.run(() => {
        if (brokenBlockPermutation.hasTag('dorios:energy')) {
            updatePipes(block, 'dorios:energy', startRescanEnergy);
        }

        if (brokenBlockPermutation.hasTag('dorios:item') || vanillaContainers.includes(brokenBlockPermutation.type.id) /*Borrar*/ || brokenBlockPermutation.type.id.includes('dustveyn:storage_drawers')/*Borrar*/) {
            updatePipes(block, 'dorios:item', startRescanItem);
        }

        if (brokenBlockPermutation.hasTag('dorios:fluid')) {
            updatePipes(block, 'dorios:fluid', startRescanFluid);
        }
    })
});

world.afterEvents.playerPlaceBlock.subscribe(e => {
    const { block } = e;
    system.run(() => {
        if (block.hasTag('dorios:energy')) {
            updatePipes(block, 'dorios:energy', startRescanEnergy);
        }

        if (block.hasTag('dorios:item') || vanillaContainers.includes(block.typeId)) {
            updatePipes(block, 'dorios:item', startRescanItem);
        }

        if (block.hasTag('dorios:fluid')) {
            updatePipes(block, 'dorios:fluid', startRescanFluid);
        }
    })
});

const offsets = [
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 },
];

function startRescanEnergy(startPos, dimension) {
    const queue = [startPos];
    const visited = new Set();

    while (queue.length > 0) {
        const pos = queue.shift();
        const key = `${pos.x},${pos.y},${pos.z}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const block = dimension.getBlock(pos);
        if (!block.hasTag('dorios:energy')) continue

        if (block?.typeId === "utilitycraft:energy_cable") {
            cablesUsed += 1
            for (const offset of offsets) {
                queue.push({
                    x: pos.x + offset.x,
                    y: pos.y + offset.y,
                    z: pos.z + offset.z,
                });
            }
            continue;
        }
        // Get the entity at this position (should only be one if it's a machine/gen)
        let entity = dimension.getEntitiesAtBlockLocation(pos)[0];
        if (block.hasTag('dorios:port')) {
            entity = dimension.getEntities({ tags: [`input:[${pos.x},${pos.y},${pos.z}]`] })[0]
            let queue = []
            if (!entity) continue
            energySources += 1
            entity.getTags()
                .filter(tag => tag.startsWith("input:["))
                .map(tag => {
                    const [x, y, z] = tag.slice(7, -1).split(",").map(Number);
                    queue.push(dimension.getBlock({ x, y, z })?.location);
                });
            searchEnergyContainers(queue, entity)
            continue
        }
        if (entity?.getComponent("minecraft:type_family")?.hasTypeFamily("dorios:energy_source")) {
            energySources += 1
            let queue = []
            queue.push(pos)
            searchEnergyContainers(queue, entity)
        }
    }
}


function searchEnergyContainers(startQueue, gen) {
    const dimension = gen.dimension
    let queue = []
    const visited = new Set();
    startQueue.forEach(startPos => {
        const key = `${startPos.x},${startPos.y},${startPos.z}`;
        if (!visited.has(key)) visited.add(key);
        for (const offset of offsets) {
            queue.push({
                x: startPos.x + offset.x,
                y: startPos.y + offset.y,
                z: startPos.z + offset.z,
            });
        }
    })
    const machines = [];
    world.sendMessage(`${gen.typeId}`)
    while (queue.length > 0) {
        const pos = queue.shift();
        const key = `${pos.x},${pos.y},${pos.z}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const block = dimension.getBlock(pos);
        if (!block.hasTag('dorios:energy')) continue

        if (block?.typeId === "utilitycraft:energy_cable") {
            for (const offset of offsets) {
                queue.push({
                    x: pos.x + offset.x,
                    y: pos.y + offset.y,
                    z: pos.z + offset.z,
                });
            }
            continue;
        }
        let entity = dimension.getEntitiesAtBlockLocation(pos)[0];

        if (block?.hasTag('dorios:energy') && block?.hasTag('dorios:port')) {
            entity = dimension.getEntities({ tags: [`input:[${pos.x},${pos.y},${pos.z}]`] })[0]
            if (entity) machines.push(entity.location);
            world.sendMessage(`${gen.typeId}: ${entity.typeId}`)
            continue
        }
        if (entity?.getComponent("minecraft:type_family")?.hasTypeFamily("dorios:energy_container")) machines.push(pos)

    }
    // Remove old tags starting with net:[
    gen.getTags().forEach(tag => {
        if (tag.startsWith("net:")) gen.removeTag(tag)
    })

    // Add the machines' positions as tags to the generator
    for (const pos of machines) {
        gen.addTag(`net:[${pos.x},${pos.y},${pos.z}]`);
    }
}

function startRescanItem(startPos, dimension) {
    const queue = [startPos];
    const visited = new Set();
    const inputs = [];
    const extractors = [];
    let cablesUsed = 0


    const globalBlockedTags = new Set();

    while (queue.length > 0) {
        const pos = queue.shift();
        const key = `${pos.x},${pos.y},${pos.z}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const block = dimension.getBlock(pos);

        if (block?.typeId === "utilitycraft:item_conduit" || block?.typeId === "utilitycraft:item_exporter") {
            cablesUsed += 1
            for (const offset of offsets) {
                queue.push({
                    x: pos.x + offset.x,
                    y: pos.y + offset.y,
                    z: pos.z + offset.z,
                });
            }
        }

        if (vanillaContainers.includes(block?.typeId)) {
            inputs.push(`van:[${pos.x},${pos.y},${pos.z}]`);
            continue;
        }

        if (block?.typeId.includes('dustveyn:storage_drawers')) {
            inputs.push(`dra:[${pos.x},${pos.y},${pos.z}]`);
            continue;
        }

        let entity = dimension.getEntitiesAtBlockLocation(pos)[0];
        if (block.hasTag('dorios:port') && block.hasTag('dorios:item')) {
            entity = dimension.getEntities({ tags: [`input:[${pos.x},${pos.y},${pos.z}]`] })[0]
            if (!entity) continue
            const loc = entity.location
            inputs.push(`ent:[${loc.x},${loc.y},${loc.z}]`);
            continue
        }
        if (entity) {
            if (entity.typeId === "utilitycraft:pipe") {
                extractors.push(entity);
                continue;
            }

            const tf = entity.getComponent("minecraft:type_family");
            if (tf?.hasTypeFamily("dorios:container")) {
                inputs.push(`ent:[${pos.x},${pos.y},${pos.z}]`);
            }
        }
    }

    if (cablesUsed <= 0) return
    for (const ext of extractors) {
        const extLoc = ext.location;
        const extPos = {
            x: Math.floor(extLoc.x),
            y: Math.floor(extLoc.y),
            z: Math.floor(extLoc.z)
        };

        const block = dimension.getBlock(extPos);
        const face = block.permutation.getState("minecraft:block_face");
        const faceOffset = blockFaceOffsets[face];

        if (faceOffset) {
            const bx = extPos.x + faceOffset[0];
            const by = extPos.y + faceOffset[1];
            const bz = extPos.z + faceOffset[2];
            globalBlockedTags.add(`van:[${bx},${by},${bz}]`);
            globalBlockedTags.add(`ent:[${bx},${by},${bz}]`);
            globalBlockedTags.add(`dra:[${bx},${by},${bz}]`);
        }
    }

    for (const ext of extractors) {
        const oldTags = ext.getTags().filter(tag => tag.startsWith("van:") || tag.startsWith("ent:") || tag.startsWith("dra:"));
        for (const tag of oldTags) ext.removeTag(tag);

        for (const tag of inputs) {
            if (globalBlockedTags.has(tag)) continue;
            ext.addTag(tag);
        }
    }
    // Log network creation
    // const isNetwork = cablesUsed > 0 && extractors.length > 0
    // if (isNetwork) console.warn(`[Item Network] Created a network with ${extractors.length} Exporter(s) and ${inputs.length} Container(s).`);
    // return visited
}



function startRescanFluid(startPos, dimension) {
    const queue = [startPos];
    const visited = new Set();
    const inputs = [];
    const extractors = [];
    let cablesUsed = 0

    const globalBlockedTags = new Set();

    while (queue.length > 0) {
        const pos = queue.shift();
        const key = `${pos.x},${pos.y},${pos.z}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const block = dimension.getBlock(pos);

        if (block?.typeId === "utilitycraft:fluid_pipe" || block?.typeId === "utilitycraft:fluid_extractor") {
            cablesUsed += 1
            for (const offset of offsets) {
                queue.push({
                    x: pos.x + offset.x,
                    y: pos.y + offset.y,
                    z: pos.z + offset.z,
                });
            }
        }

        if (block?.typeId.includes('fluid_tank')) {
            inputs.push(`tan:[${pos.x},${pos.y},${pos.z}]`);
            continue;
        }

        let entity = dimension.getEntitiesAtBlockLocation(pos)[0];
        if (block.hasTag('dorios:port') && block.hasTag('dorios:fluid')) {
            entity = dimension.getEntities({ tags: [`input:[${pos.x},${pos.y},${pos.z}]`] })[0]
            if (!entity) continue
            const loc = entity.location
            inputs.push(`ent:[${loc.x},${loc.y},${loc.z}]`);
            continue
        }
        if (entity) {
            if (entity.typeId === "utilitycraft:pipe") {
                extractors.push(entity);
                continue;
            }

            const tf = entity.getComponent("minecraft:type_family");
            if (tf?.hasTypeFamily("dorios:fluid_container")) {
                inputs.push(`ent:[${pos.x},${pos.y},${pos.z}]`);
            }
        }
    }

    if (cablesUsed <= 0) return
    // Taggear inputs válidos a cada extractor, excluyendo la cara hacia la que está orientado
    for (const ext of extractors) {
        const extLoc = ext.location;
        const extPos = {
            x: Math.floor(extLoc.x),
            y: Math.floor(extLoc.y),
            z: Math.floor(extLoc.z)
        };

        const block = dimension.getBlock(extPos);
        const face = block.permutation.getState("minecraft:block_face");
        const faceOffset = blockFaceOffsets[face];

        if (faceOffset) {
            const bx = extPos.x + faceOffset[0];
            const by = extPos.y + faceOffset[1];
            const bz = extPos.z + faceOffset[2];
            globalBlockedTags.add(`tan:[${bx},${by},${bz}]`);
            globalBlockedTags.add(`ent:[${bx},${by},${bz}]`);
        }
    }

    for (const ext of extractors) {
        const oldTags = ext.getTags().filter(tag => tag.startsWith("tan:") || tag.startsWith("ent:"));
        for (const tag of oldTags) ext.removeTag(tag);

        for (const tag of inputs) {
            if (globalBlockedTags.has(tag)) continue;
            ext.addTag(tag);
        }
    }
    // Log network creation
    // const isNetwork = cablesUsed > 0 && extractors.length > 0
    // if (isNetwork) console.warn(`[Fluid Network] Created a network with ${extractors.length} Extractor(s) and ${inputs.length} Fluid Container(s).`);
    // return visited
}

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