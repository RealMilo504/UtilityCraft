import * as DoriosLib from "DoriosLib/index.js";
import { world } from "@minecraft/server";
import { Machine, registerIOInterface } from "DoriosCore/index.js"
import { getOppositeFacingDirection } from "./oppositeFacing.js";
import { getCropDefinition } from "../../crops/harvest.js";
import {
    getHarvesterSide,
    hasHarvesterCollection
} from "./harvesterArea.js"
import {
    handleMachineOutlineInteract,
    initializeMachineOutline,
    removeMachineOutline,
    syncMachineOutlineIfNeeded
} from "../machineOutline.js"

const OUTPUT_START = 5;
const OUTPUT_END = 19;
const OUTPUT_SLOTS = Array.from(
    { length: OUTPUT_END - OUTPUT_START + 1 },
    (_, index) => OUTPUT_START + index
);

const VANILLA_CROP_STATES = Object.freeze({
    "minecraft:wheat": { state: "growth", mature: 7 },
    "minecraft:carrots": { state: "growth", mature: 7 },
    "minecraft:potatoes": { state: "growth", mature: 7 },
    "minecraft:beetroot": { state: "growth", mature: 7 },
    "minecraft:nether_wart": { state: "age", mature: 3 }
});

const TALL_CROPS = new Set([
    "minecraft:reeds",
    "minecraft:sugar_cane",
    "minecraft:bamboo",
    "minecraft:kelp",
    "minecraft:cactus"
]);

registerIOInterface("utilitycraft:harvester", {
    invertFaces: true,
    items: {
        buttonSlots: [20, 25],
        anyInputSlots: [],
        anyOutputSlots: OUTPUT_SLOTS,
        modes: [
            { id: "disabled" },
            { id: "output_1", outputSlots: OUTPUT_SLOTS }
        ]
    }
});

function getMatureCropAction(block) {
    const vanillaCrop = VANILLA_CROP_STATES[block.typeId];
    if (vanillaCrop) {
        try {
            if (block.permutation.getState(vanillaCrop.state) === vanillaCrop.mature) {
                return { block, state: vanillaCrop.state };
            }
        } catch {}
        return undefined;
    }

    if (!getCropDefinition(block)) return undefined;

    try {
        if (block.permutation.getState("utilitycraft:age") === 5) {
            return { block, state: "utilitycraft:age" };
        }
    } catch {}

    return undefined;
}

function getTallCropAction(block) {
    try {
        let upperBlock = block.above(1);
        if (!upperBlock || !TALL_CROPS.has(upperBlock.typeId)) return undefined;

        const cropTypeId = upperBlock.typeId;
        while (true) {
            let nextBlock;
            try {
                nextBlock = upperBlock.above(1);
            } catch {
                break;
            }
            if (!nextBlock || nextBlock.typeId !== cropTypeId) break;
            upperBlock = nextBlock;
        }

        return { block: upperBlock, remove: true };
    } catch {}

    return undefined;
}

function generateBlockLoot(block) {
    try {
        return world.getLootTableManager().generateLootFromBlock(block);
    } catch {
        return undefined;
    }
}

function createHarvestEntry(block) {
    const action = getMatureCropAction(block) ?? getTallCropAction(block);
    if (!action) return undefined;

    const loot = generateBlockLoot(action.block);
    if (!loot) return undefined;

    return { ...action, loot };
}

function canFitStacks(container, stacks) {
    const snapshot = [];

    for (let slot = OUTPUT_START; slot <= OUTPUT_END; slot++) {
        snapshot.push(container.getItem(slot)?.clone());
    }

    for (const stack of stacks) {
        if (!stack) continue;
        let remaining = stack.amount;

        for (const item of snapshot) {
            if (!item || !item.isStackableWith(stack)) continue;
            const moved = Math.min(remaining, item.maxAmount - item.amount);
            item.amount += moved;
            remaining -= moved;
            if (remaining <= 0) break;
        }

        for (let index = 0; index < snapshot.length && remaining > 0; index++) {
            if (snapshot[index]) continue;
            const moved = Math.min(remaining, stack.maxAmount);
            const inserted = stack.clone();
            inserted.amount = moved;
            snapshot[index] = inserted;
            remaining -= moved;
        }

        if (remaining > 0) return false;
    }

    return true;
}

function addStacksToOutput(container, stacks) {
    for (const stack of stacks) {
        if (!stack) continue;
        let remaining = stack.amount;

        for (let slot = OUTPUT_START; slot <= OUTPUT_END && remaining > 0; slot++) {
            const item = container.getItem(slot);
            if (!item || !item.isStackableWith(stack) || item.amount >= item.maxAmount) continue;

            const moved = Math.min(remaining, item.maxAmount - item.amount);
            const updated = item.clone();
            updated.amount += moved;
            container.setItem(slot, updated);
            remaining -= moved;
        }

        for (let slot = OUTPUT_START; slot <= OUTPUT_END && remaining > 0; slot++) {
            if (container.getItem(slot)) continue;

            const moved = Math.min(remaining, stack.maxAmount);
            const inserted = stack.clone();
            inserted.amount = moved;
            container.setItem(slot, inserted);
            remaining -= moved;
        }
    }
}

function spawnHarvestLoot(entries) {
    for (const entry of entries) {
        const location = {
            x: entry.block.location.x + 0.5,
            y: entry.block.location.y + 0.5,
            z: entry.block.location.z + 0.5
        };

        for (const stack of entry.loot) {
            entry.block.dimension.spawnItem(stack, location);
        }
    }
}

function applyHarvestActions(entries) {
    for (const entry of entries) {
        if (entry.remove) {
            entry.block.setType("minecraft:air");
            continue;
        }

        entry.block.setPermutation(entry.block.permutation.withState(entry.state, 0));
    }
}

/**
 * Harvester Machine Component
 * - Harvests crops or blocks in an area depending on its range upgrades.
 * - Uses Dorios Energy (DE) progressively per operation.
 * - Generates crop loot directly and resets mature plants without breaking them.
 */

DoriosLib.registry.blockComponent("utilitycraft:harvester", {
    /**
     * Called when the machine is placed by the player.
     * @param {{ params: MachineSettings }} ctx
     */
    beforeOnPlayerPlace(e, { params: settings }) {
        Machine.spawnEntity(e, settings, (entity) => {
            const machine = new Machine(e.block, { ...settings, ignoreTick: true });
            machine.displayEnergy();
            initializeMachineOutline(e.block, entity, e.player)
        });
    },

    /**
     * Called each tick.
     * Handles energy consumption, progress, and harvesting logic.
     * 
     * @param {import('@minecraft/server').BlockComponentTickEvent} e
     * @param {{ params: MachineSettings }} ctx
     */
    onTick(e, { params: settings }) {
        const { block, dimension } = e;

        if (!block || block.typeId === "minecraft:air") return;

        const machine = new Machine(block, settings);
        if (!machine.valid) return
        syncMachineOutlineIfNeeded(machine)
        machine.processIO();

        // --- Machine parameters ---
        const range = Math.max(0, Math.floor(machine.boosts.range ?? 0))
        const side = getHarvesterSide(range)
        const area = side ** 2;


        const progress = machine.getProgress();
        const energyCost = settings.machine.energy_cost;
        const realEnergyCost = energyCost * machine.boosts.consumption;

        machine.setRate(area)
        machine.setEnergyCost(energyCost * area)
        // --- Energy check ---
        if (machine.energy.get() <= 0) {
            machine.showWarning("No Energy", { displayProgress: false });
            return;
        }

        // --- Progress full, perform harvest ---
        if (progress >= realEnergyCost * area) {
            let { x, y, z } = block.location;
            y += 0.25; x += 0.5; z += 0.5;

            let tx = 1, tz = 1;
            // Facing direction handling
            const axis = getOppositeFacingDirection(block)
                ?? DoriosLib.block.getState(block, "utilitycraft:axis");
            switch (axis) {
                case "up":
                    y += 2;
                    x += ((side - 1) / 2);
                    z -= ((side - 1) / 2) + 1;
                    tx = -1;
                    break;
                case "down":
                    y--;
                    x += ((side - 1) / 2);
                    z -= ((side - 1) / 2) + 1;
                    tx = -1;
                    break;
                case "north":
                    z -= (1 + side);
                    x += ((side - 1) / 2);
                    tx = -1;
                    break;
                case "south":
                    x += ((side - 1) / 2);
                    tx = -1;
                    break;
                case "west":
                    x--;
                    z -= ((side - 1) / 2) + 1;
                    tx = -1;
                    break;
                case "east":
                    x += (side);
                    z -= ((side - 1) / 2) + 1;
                    tx = -1;
                    break;
            }

            const harvestEntries = [];
            for (let i = 1; i <= side; i++) {
                for (let j = 1; j <= side; j++) {
                    z += tz;
                    const targetBlock = dimension.getBlock({
                        x: Math.floor(x),
                        y: Math.floor(y),
                        z: Math.floor(z)
                    });

                    if (!targetBlock) continue;
                    const entry = createHarvestEntry(targetBlock);
                    if (entry) harvestEntries.push(entry);
                }
                z -= side * tz;
                x += tx;
            }

            if (hasHarvesterCollection(range)) {
                const combinedLoot = harvestEntries.flatMap((entry) => entry.loot);
                if (!canFitStacks(machine.container, combinedLoot)) {
                    machine.showWarning("Output Full", { resetProgress: false, displayProgress: false });
                    return;
                }
                addStacksToOutput(machine.container, combinedLoot);
            } else {
                spawnHarvestLoot(harvestEntries);
            }

            applyHarvestActions(harvestEntries);

            // Reset progress after operation
            machine.setProgress(0, { display: false });
        } else {
            // --- Charge energy & accumulate progress ---
            const energyToConsume = Math.min(
                machine.energy.get(),
                machine.rate,
                realEnergyCost * area - progress
            );
            machine.energy.consume(energyToConsume);
            machine.addProgress(energyToConsume);
        }

        // --- Visual updates ---
        machine.on();
        machine.showStatus("Running");
    },

    onPlayerInteract(e) {
        handleMachineOutlineInteract(e)
    },

    onPlayerBreak(e) {
        removeMachineOutline(e.block)
        Machine.onDestroy(e);
    }
});
