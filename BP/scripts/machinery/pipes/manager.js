import { world, system } from '@minecraft/server'
import { createEnergyNetwork, createFluidNetwork, createItemNetwork } from './network_creator.js'

world.afterEvents.playerBreakBlock.subscribe(e => {
    const { block, brokenBlockPermutation } = e;
    if (brokenBlockPermutation.hasTag('dorios:energy')) {
        updatePipes(block, 'dorios:energy', createEnergyNetwork);
    }

    if (brokenBlockPermutation.hasTag('dorios:item') ||
        vanillaContainers.includes(brokenBlockPermutation.type.id) ||
        brokenBlockPermutation.type.id.includes('dustveyn:storage_drawers')) {
        updatePipes(block, 'dorios:item', startRescanItem);
    }

    if (brokenBlockPermutation.hasTag('dorios:fluid')) {
        updatePipes(block, 'dorios:fluid', startRescanFluid);
    }
});

world.afterEvents.playerPlaceBlock.subscribe(e => {
    const { block } = e;

    if (block.hasTag('dorios:energy')) {
        if (block.typeId === 'twm:energy_cable') updateGeometry(block, 'dorios:energy');
        updatePipes(block, 'dorios:energy', createEnergyNetwork);
    }

    if (block.hasTag('dorios:item') ||
        vanillaContainers.includes(block.typeId) ||
        brokenBlockPermutation.type.id.includes('dustveyn:storage_drawers')) {
        if (block.typeId === 'twm:item_conduit') updateGeometry(block, 'dorios:item');
        if (block.typeId === 'twm:item_exporter') updateGeometryExporter(block, 'dorios:item');
        updatePipes(block, 'dorios:item', createItemNetwork);
    }

    if (block.hasTag('dorios:fluid')) {
        if (block.typeId === 'twm:fluid_pipe') updateGeometry(block, 'dorios:fluid');
        if (block.typeId === 'twm:fluid_extractor') updateGeometryExporter(block, 'dorios:fluid');
        updatePipes(block, 'dorios:fluid', createFluidNetwork);
    }
});



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
            || (block.hasTag('dorios:item') && (vanillaContainers.includes(neighbor?.typeId)
                || neighbor?.typeId.includes('dustveyn:storage_drawers')));

        // Set the perm
        block.setPermutation(block.permutation.withState(`twm:${dir}`, shouldConnect));
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
            (block.hasTag("dorios:item") && (vanillaContainers.includes(neighbor?.typeId)
                || neighbor?.typeId.includes('dustveyn:storage_drawers')
            ));

        newPerm = newPerm.withState(`twm:${visualDir}`, shouldConnect);
    }

    block.setPermutation(newPerm);
}

// Executes the scan function and update geometry
function updatePipes(block, tag, createNetwork) {
    const directions = [
        block.above(1),
        block.below(1),
        block.north(1),
        block.south(1),
        block.east(1),
        block.west(1)
    ];
    for (const neighbor of directions) {
        if (neighbor?.hasTag(tag)) {
            if (neighbor?.hasTag('dorios:isExporter')) {
                updateGeometryExporter(neighbor, tag);
            } else if (neighbor?.hasTag('dorios:isTube')) {
                updateGeometry(neighbor, tag);
            }
            createNetwork(neighbor.location, block.dimension);
        }
    }
    createNetwork(block.location, block.dimension);
}


