import { world } from "@minecraft/server";
import * as DoriosLib from "DoriosLib/index.js";
import { Machine, registerIOInterface } from "DoriosCore/index.js"
import { getOppositeFacingBlock } from "./oppositeFacing.js";
import {
    handleMachineOutlineInteract,
    initializeMachineOutline,
    removeMachineOutline,
    syncMachineOutlineIfNeeded
} from "../machineOutline.js"

const PICKAXE_SLOT = 2;

registerIOInterface("utilitycraft:block_breaker", {
    invertFaces: true,
    items: {
        buttonSlots: [5, 10],
        anyInputSlots: [PICKAXE_SLOT],
        anyOutputSlots: [],
        modes: [
            { id: "disabled" },
            { id: "input_2", inputSlots: [PICKAXE_SLOT] }
        ]
    }
});

function isPickaxe(item) {
    if (!item) return false;

    try {
        if (item.hasTag?.("minecraft:is_pickaxe") || item.hasTag?.("minecraft:pickaxe")) return true;
    } catch {}

    return item.typeId.split(":").pop()?.includes("pickaxe") === true;
}

function generateBlockLoot(block, tool) {
    try {
        return world.getLootTableManager().generateLootFromBlock(block, tool);
    } catch {
        return undefined;
    }
}

function spawnBlockLoot(block, loot) {
    const location = {
        x: block.location.x + 0.5,
        y: block.location.y + 0.5,
        z: block.location.z + 0.5
    };

    for (const itemStack of loot) {
        block.dimension.spawnItem(itemStack, location);
    }
}

DoriosLib.registry.blockComponent('utilitycraft:block_breaker', {
    /**
     * Runs before the machine is placed by the player.
     * 
     * @param {import('@minecraft/server').BlockComponentPlayerPlaceBeforeEvent} e
     * @param {{ params: MachineSettings }} ctx
     */
    beforeOnPlayerPlace(e, { params: settings }) {
        Machine.spawnEntity(e, settings, (entity) => {
            const machine = new Machine(e.block, { ...settings, ignoreTick: true });
            machine.setEnergyCost(settings.machine.energy_cost);
            initializeMachineOutline(e.block, entity, e.player)
        });
    },

    /**
     * Executes each tick for the machine.
     * 
     * @param {import('@minecraft/server').BlockComponentTickEvent} e
     * @param {{ params: MachineSettings }} ctx
     */
    onTick(e, { params: settings }) {
        const { block } = e;
        const machine = new Machine(block, settings);
        if (!machine.valid) return
        syncMachineOutlineIfNeeded(machine)

        let progress = machine.getProgress();
        const energyCost = settings.machine.energy_cost;
        machine.processIO();

        const tool = machine.container.getItem(PICKAXE_SLOT);
        if (!isPickaxe(tool)) {
            machine.showWarning('Missing Pickaxe', { resetProgress: false, displayProgress: false });
            return;
        }

        // Check energy availability
        if (machine.energy.get() <= 0) {
            machine.showWarning('No Energy', { resetProgress: true, displayProgress: false });
            return;
        }

        const energyToConsume = Math.min(machine.energy.get(), machine.rate, Math.max(0, energyCost - progress));
        if (energyToConsume > 0) {
            machine.energy.consume(energyToConsume);
            progress += energyToConsume;
            machine.setProgress(progress, { display: false });
        }

        if (progress >= energyCost) {
            // Block in front
            /**
             * @type {Block}
             */
            const facing = getOppositeFacingBlock(machine.block);
            if (facing) {
                // Conditions: not unbreakable, not air, not fluid
                if (
                    !DoriosLib.constants.UNBREAKABLE_BLOCKS.includes(facing.typeId) &&
                    !facing.isAir &&
                    !facing.isLiquid
                ) {
                    const loot = generateBlockLoot(facing, tool);
                    if (!loot) {
                        machine.showWarning('Tool Too Weak', { resetProgress: false, displayProgress: false });
                        return;
                    }

                    spawnBlockLoot(facing, loot);
                    facing.setType("minecraft:air");
                    // Reset progress after operation
                    machine.on();
                    DoriosLib.time.runAfterSeconds(1, () => {
                        machine.off()
                    })
                    machine.setProgress(0, { display: false });
                } else {
                    machine.showWarning('Nothing to Break', { resetProgress: false, displayProgress: false });
                    return;
                }
            }
        } else {
            machine.off()
        }

        // Update visuals
        machine.showStatus('Running');
    },

    onPlayerInteract(e) {
        handleMachineOutlineInteract(e)
    },

    onPlayerBreak(e) {
        removeMachineOutline(e.block)
        Machine.onDestroy(e);
    }
});
