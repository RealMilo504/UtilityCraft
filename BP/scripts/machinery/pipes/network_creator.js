const offsets = [
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 },
];
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

export function createEnergyNetwork(startPos, dimension) {
    const queue = [startPos];
    const visited = new Set();
    const machines = [];
    const generators = [];

    while (queue.length > 0) {
        const pos = queue.shift();
        const key = `${pos.x},${pos.y},${pos.z}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const block = dimension.getBlock(pos);
        const isStart = pos.x === startPos.x && pos.y === startPos.y && pos.z === startPos.z;

        if (block?.typeId === "utilitycraft:energy_cable") {
            // Always scan neighbors of cables
            for (const offset of offsets) {
                queue.push({
                    x: pos.x + offset.x,
                    y: pos.y + offset.y,
                    z: pos.z + offset.z,
                });
            }
            continue; // Skip further processing for cables
        }

        // Also scan neighbors if it's the starting position (even if not a cable)
        if (isStart) {
            for (const offset of offsets) {
                queue.push({
                    x: pos.x + offset.x,
                    y: pos.y + offset.y,
                    z: pos.z + offset.z,
                });
            }
        }
        // Get the entity at this position (should only be one if it's a machine/gen)
        const entity = dimension.getEntitiesAtBlockLocation(pos)[0];
        if (!entity) continue;

        const tf = entity.getComponent("minecraft:type_family");
        if (!tf) continue;

        // Check if the entity is a generator or machine
        if (tf.hasTypeFamily("dorios:energy_source")) {
            generators.push(entity);
        }

        if (tf.hasTypeFamily("dorios:energy_container")) {
            machines.push(pos);
        }
    }

    // Tag each generator with all connected machine positions
    for (const gen of generators) {
        // Remove old tags starting with net:[
        const oldNetTags = gen.getTags().filter(tag => tag.startsWith("net:["));
        for (const tag of oldNetTags) gen.removeTag(tag);

        // Add the machines' positions as tags to the generator
        for (const pos of machines) {
            gen.addTag(`net:[${pos.x},${pos.y},${pos.z}]`);
        }
    }
}

export function createItemNetwork(startPos, dimension) {
    const queue = [startPos];
    const visited = new Set();
    const outputs = [];
    const extractors = [];

    const globalBlockedTags = new Set();

    while (queue.length > 0) {
        const pos = queue.shift();
        const key = `${pos.x},${pos.y},${pos.z}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const block = dimension.getBlock(pos);
        const isStart = pos.x === startPos.x && pos.y === startPos.y && pos.z === startPos.z;

        if (block?.typeId === "utilitycraft:item_conduit" || block?.typeId === "utilitycraft:item_exporter") {
            for (const offset of offsets) {
                queue.push({
                    x: pos.x + offset.x,
                    y: pos.y + offset.y,
                    z: pos.z + offset.z,
                });
            }
        }

        // Also scan neighbors if it's the starting position (even if not a cable)
        if (isStart) {
            for (const offset of offsets) {
                queue.push({
                    x: pos.x + offset.x,
                    y: pos.y + offset.y,
                    z: pos.z + offset.z,
                });
            }
        }

        if (vanillaContainers.includes(block?.typeId)) {
            outputs.push(`van:[${pos.x},${pos.y},${pos.z}]`);
            continue;
        }

        if (block?.typeId.includes('dustveyn:storage_drawers')) {
            outputs.push(`dra:[${pos.x},${pos.y},${pos.z}]`);
            continue;
        }

        const entities = dimension.getEntitiesAtBlockLocation(pos);
        if (entities.length > 0) {
            const ent = entities[0];

            if (ent.typeId === "utilitycraft:pipe") {
                extractors.push(ent);
                continue;
            }

            const tf = ent.getComponent("minecraft:type_family");
            if (tf?.hasTypeFamily("dorios:container")) {
                outputs.push(`ent:[${pos.x},${pos.y},${pos.z}]`);
            }
        }
    }

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

        for (const tag of outputs) {
            if (globalBlockedTags.has(tag)) continue;
            ext.addTag(tag);
        }
    }
}

export function createFluidNetwork(startPos, dimension) {
    const queue = [startPos];
    const visited = new Set();
    const outputs = [];
    const extractors = [];

    const offsets = [
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: -1, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: -1 }
    ];

    const globalBlockedTags = new Set();

    while (queue.length > 0) {
        const pos = queue.shift();
        const key = `${pos.x},${pos.y},${pos.z}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const block = dimension.getBlock(pos);
        const isStart = pos.x === startPos.x && pos.y === startPos.y && pos.z === startPos.z;

        if (block?.typeId === "utilitycraft:fluid_pipe" || block?.typeId === "utilitycraft:fluid_extractor") {
            for (const offset of offsets) {
                queue.push({
                    x: pos.x + offset.x,
                    y: pos.y + offset.y,
                    z: pos.z + offset.z,
                });
            }
        }
        // Also scan neighbors if it's the starting position (even if not a cable)
        if (isStart) {
            for (const offset of offsets) {
                queue.push({
                    x: pos.x + offset.x,
                    y: pos.y + offset.y,
                    z: pos.z + offset.z,
                });
            }
        }
        if (block?.typeId.includes('fluid_tank')) {
            outputs.push(`tan:[${pos.x},${pos.y},${pos.z}]`);
            continue;
        }

        const entities = dimension.getEntitiesAtBlockLocation(pos);
        if (entities.length > 0) {
            const ent = entities[0];

            if (ent.typeId === "utilitycraft:pipe") {
                extractors.push(ent);
                continue;
            }

            const tf = ent.getComponent("minecraft:type_family");
            if (tf?.hasTypeFamily("dorios:fluid_container")) {
                outputs.push(`ent:[${pos.x},${pos.y},${pos.z}]`);
            }
        }
    }

    // Taggear outputs válidos a cada extractor, excluyendo la cara hacia la que está orientado
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

        for (const tag of outputs) {
            if (globalBlockedTags.has(tag)) continue;
            ext.addTag(tag);
        }
    }
}