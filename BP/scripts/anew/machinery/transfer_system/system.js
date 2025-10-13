import { world, system, ItemStack } from '@minecraft/server'

//#region Utils
/**
 * Updates the block geometry states to visually connect with valid neighbors.
 *
 * Rules:
 * - Connects to any block sharing the same tag.
 * - If this block has 'dorios:item', also connects to vanilla containers or drawers.
 *
 * @param {Block} block The block to update.
 * @param {string} tag The connection tag (e.g. "dorios:energy").
 */
export function updateGeometry(block, tag) {
    if (!block?.permutation || !block?.dimension) return;

    const dim = block.dimension;
    const { x, y, z } = block.location;

    // Precompute the neighbor offsets
    const offsets = {
        up: { x, y: y + 1, z },
        down: { x, y: y - 1, z },
        north: { x, y, z: z - 1 },
        south: { x, y, z: z + 1 },
        east: { x: x + 1, y, z },
        west: { x: x - 1, y, z }
    };

    // Cache tag and container info for faster checks
    const isItemConduit = block.hasTag("dorios:item");

    for (const [dir, loc] of Object.entries(offsets)) {
        const neighbor = dim.getBlock(loc);
        if (!neighbor) {
            block.setState(`utilitycraft:${dir}`, false);
            continue;
        }

        // Connection logic
        const sameNetwork = neighbor.hasTag(tag);
        const validContainer = isItemConduit && (
            DoriosAPI.constants.vanillaContainers.includes(neighbor.typeId) ||
            neighbor.typeId.includes("dustveyn:storage_drawers")
        );

        const shouldConnect = sameNetwork || validContainer;

        // Apply state only if changed (avoid redundant permutations)
        if (block.getState(`utilitycraft:${dir}`) !== shouldConnect) {
            block.setState(`utilitycraft:${dir}`, shouldConnect);
        }
    }
}

/**
 * Updates the visual connection geometry of an Exporter-type block.
 *
 * This function determines which faces of the block should visually connect
 * to nearby blocks based on orientation and network tags.
 *
 * ## Behavior:
 * - The `directionMap` ensures that visual states are rotated correctly
 *   according to the block's facing direction (`minecraft:block_face`).
 * - Connections are established with neighboring blocks that share the same tag.
 * - If the block has the `dorios:item` tag, it also connects to vanilla containers
 *   and compatible drawers (e.g., Dustveyn Storage Drawers).
 *
 * @param {import("@minecraft/server").Block} block The exporter block whose geometry should update.
 * @param {string} tag The tag identifying compatible network blocks.
 */
export function updateGeometryExporter(block, tag) {
    if (!block?.permutation || !block?.dimension) return;

    const permutation = block.permutation;
    const dim = block.dimension;
    const facing = permutation.getState("minecraft:block_face");

    // Do NOT modify this map — it defines visual rotation logic
    const directionMap = {
        north: { north: "south", south: "north", east: "west", west: "east", up: "up", down: "down" },
        south: { north: "north", south: "south", east: "east", west: "west", up: "up", down: "down" },
        east: { north: "east", south: "west", east: "south", west: "north", up: "up", down: "down" },
        west: { north: "west", south: "east", east: "north", west: "south", up: "up", down: "down" },
        up: { north: "up", south: "down", east: "east", west: "west", up: "south", down: "north" },
        down: { north: "down", south: "up", east: "east", west: "west", up: "north", down: "south" }
    };

    // Coordinate offsets instead of repeated .above/.below() calls (slightly faster)
    const { x, y, z } = block.location;
    const neighbors = {
        up: dim.getBlock({ x, y: y + 1, z }),
        down: dim.getBlock({ x, y: y - 1, z }),
        north: dim.getBlock({ x, y, z: z - 1 }),
        south: dim.getBlock({ x, y, z: z + 1 }),
        east: dim.getBlock({ x: x + 1, y, z }),
        west: dim.getBlock({ x: x - 1, y, z })
    };

    const map = directionMap[facing] || directionMap.north;
    const isItemConduit = block.hasTag("dorios:item");

    let newPerm = permutation;

    for (const [dir, visualDir] of Object.entries(map)) {
        const neighbor = neighbors[dir];
        if (!neighbor) {
            newPerm = newPerm.withState(`utilitycraft:${visualDir}`, false);
            continue;
        }

        const connectsSameTag = neighbor.hasTag(tag);
        const connectsContainer =
            isItemConduit &&
            (DoriosAPI.constants.vanillaContainers.includes(neighbor.typeId) ||
                neighbor.typeId.includes("dustveyn:storage_drawers"));

        const shouldConnect = connectsSameTag || connectsContainer;
        newPerm = newPerm.withState(`utilitycraft:${visualDir}`, shouldConnect);
    }

    block.setPermutation(newPerm);
}

/**
 * Updates a pipe or conduit network around a given block.
 *
 * This function scans the six adjacent blocks (and itself) to determine whether
 * they belong to the same network (identified by `tag`). If a valid connection is found,
 * the provided `rescanFunction` is called to rebuild or validate the network data.
 *
 * Then, based on the neighbor's role:
 * - If it has `dorios:isExporter`, its geometry is updated using {@link updateGeometryExporter}.
 * - If it has `dorios:isTube`, its geometry is updated using {@link updateGeometry}.
 *
 * @param {import("@minecraft/server").Block} block The central block to check around.
 * @param {string} tag The tag that identifies all connected network blocks.
 * @param {(location: import("@minecraft/server").Vector3, dimension: import("@minecraft/server").Dimension) => Map<string, any>} rescanFunction
 *        The function used to rebuild or retrieve the network map when a connection is detected.
 */
function updatePipes(block, tag, rescanFunction) {
    if (!block?.dimension || typeof rescanFunction !== "function") return;

    const dim = block.dimension;
    const { x, y, z } = block.location;

    // Collect center + 6 direct neighbors
    const neighbors = [
        block,
        dim.getBlock({ x, y: y + 1, z }),
        dim.getBlock({ x, y: y - 1, z }),
        dim.getBlock({ x, y, z: z - 1 }),
        dim.getBlock({ x, y, z: z + 1 }),
        dim.getBlock({ x: x - 1, y, z }),
        dim.getBlock({ x: x + 1, y, z })
    ];

    let network = undefined;

    for (const neighbor of neighbors) {
        if (!neighbor?.hasTag(tag)) continue;

        const key = `${neighbor.location.x},${neighbor.location.y},${neighbor.location.z}`;

        // Initialize or rescan network only when not already known
        if (!network?.has?.(key)) {
            network = rescanFunction(neighbor.location, dim);
        }

        // Update geometry according to role
        if (neighbor.hasTag("dorios:isExporter")) {
            updateGeometryExporter(neighbor, tag);
        } else if (neighbor.hasTag("dorios:isTube")) {
            updateGeometry(neighbor, tag);
        }
    }
}
//#endregion


//#region Energy
/**
 * Performs a full rescan of the energy network starting from a given position.
 *
 * This function performs a breadth-first search (BFS) through all adjacent blocks
 * tagged with `dorios:energy`. It explores connected cables, ports, and energy sources,
 * and for each detected source or port, it delegates to {@link searchEnergyContainers}
 * to locate all connected energy containers.
 *
 * ## Behavior:
 * - Stops scanning when a block lacks the `dorios:energy` tag.
 * - Detects cables (`utilitycraft:energy_cable`) and follows all six directions recursively.
 * - Detects generator or port entities (`dorios:energy_source`, `dorios:port`) and
 *   triggers `searchEnergyContainers` for each one.
 * - Automatically adds connected blocks or entities to the appropriate generator’s tag list.
 *
 * This function should be called when a cable, machine, or generator
 * is placed or removed to ensure network synchronization.
 *
 * @param {import("@minecraft/server").Vector3} startPos The position where the rescan starts.
 * @param {import("@minecraft/server").Dimension} dimension The dimension in which to perform the scan.
 *
 * @example
 * // Called when an energy cable is placed
 * startRescanEnergy(block.location, block.dimension);
 */
export function startRescanEnergy(startPos, dimension) {
    const queue = [startPos];
    const visited = new Set();

    const offsets = [
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: -1, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: -1 },
    ];

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
        // Get the entity at this position (should only be one if it's a machine/gen)
        let entity = dimension.getEntitiesAtBlockLocation(pos)[0];
        if (block.hasTag('dorios:port')) {
            entity = dimension.getEntities({ tags: [`input:[${pos.x},${pos.y},${pos.z}]`] })[0]
            let queue = []
            if (!entity) continue
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
            let queue = []
            queue.push(pos)
            searchEnergyContainers(queue, entity)
        }
    }
}

/**
 * Searches for all connected energy containers from a given generator entity.
 *
 * This function performs a localized BFS traversal starting from a queue of positions
 * (usually collected by {@link startRescanEnergy}) and finds every connected block
 * or entity that can receive energy from the provided generator.
 *
 * ## Behavior:
 * - Scans all cables (`utilitycraft:energy_cable`) connected to the generator.
 * - Follows the `dorios:energy` tag to discover all machines or ports linked to the network.
 * - When a connected machine or port is found:
 *   - Adds its coordinates as a `net:[x,y,z]` tag on the generator entity.
 * - Removes old `net:` tags from the generator before applying the updated set.
 *
 * The BFS is self-contained per generator. It does not modify unrelated networks,
 * and it can safely be called multiple times for revalidation.
 *
 * @param {import("@minecraft/server").Vector3[]} startQueue Array of block positions to begin the localized search from.
 * @param {import("@minecraft/server").Entity} gen The generator or energy source entity initiating the search.
 *
 * @example
 * // Called internally by startRescanEnergy
 * searchEnergyContainers([{x:10, y:65, z:20}], generatorEntity);
 */
function searchEnergyContainers(startQueue, gen) {

    const offsets = [
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: -1, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: -1 },
    ];
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
//#endregion

system.afterEvents.scriptEventReceive.subscribe(e => {
    const { id, message, sourceEntity } = e

    if (id == 'dorios:updatePipes') {
        const type = message.split('|')[0]
        const [x, y, z] = message.split('|')[1].slice(1, -1).split(",").map(Number);
        const block = sourceEntity.dimension.getBlock({ x, y, z })

        if (type == 'energy') updatePipes(block, 'dorios:energy', startRescanEnergy);

        if (type == 'item') updatePipes(block, 'dorios:item', startRescanItem);

        if (type == 'fluid') updatePipes(block, 'dorios:fluid', startRescanFluid);
    }
})

world.afterEvents.playerBreakBlock.subscribe(e => {
    const { block, brokenBlockPermutation } = e;
    system.run(() => {
        if (brokenBlockPermutation.hasTag('dorios:energy')) {
            updatePipes(block, 'dorios:energy', startRescanEnergy);
        }

        // if (brokenBlockPermutation.hasTag('dorios:item') ||
        //     DoriosAPI.constants.vanillaContainers.includes(brokenBlockPermutation.type.id) /*Borrar*/ ||
        //     brokenBlockPermutation.type.id.includes('dustveyn:storage_drawers')/*Borrar*/) {
        //     updatePipes(block, 'dorios:item', startRescanItem);
        // }

        // if (brokenBlockPermutation.hasTag('dorios:fluid')) {
        //     updatePipes(block, 'dorios:fluid', startRescanFluid);
        // }
    })
});

world.afterEvents.playerPlaceBlock.subscribe(e => {
    const { block } = e;
    system.run(() => {
        if (block.hasTag('dorios:energy')) {
            updatePipes(block, 'dorios:energy', startRescanEnergy);
        }

        // if (block.hasTag('dorios:item') || DoriosAPI.constants.vanillaContainers.includes(block.typeId)) {
        //     updatePipes(block, 'dorios:item', startRescanItem);
        // }

        // if (block.hasTag('dorios:fluid')) {
        //     updatePipes(block, 'dorios:fluid', startRescanFluid);
        // }
    })
});