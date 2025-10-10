import { Machine, Energy } from '../managers.js';

/**
 * Auto Assembler Machine Component
 * - Uses blueprints created by the Digitizer.
 * - Consumes materials automatically and crafts items according to the blueprint.
 * - Requires Dorios Energy (DE) to operate.
 * - Automatically consumes energy over time and processes when progress >= energy_cost.
 */

const BLUEPRINT_SLOT = 3;

DoriosAPI.register.blockComponent('assembler', {
    /**
     * Runs before the machine is placed by the player.
     * 
     * @param {{ params: MachineSettings }} ctx
     */
    beforeOnPlayerPlace(e, { params: settings }) {
        Machine.spawnMachineEntity(e, settings, () => {
            const machine = new Machine(e.block, settings);
            machine.setEnergyCost(settings.machine.energy_cost);
            machine.displayProgress();
            // Visual filler slot (optional, same as autosieve)
            machine.entity.setItem(1, 'utilitycraft:arrow_right_0');
            machine.energy.set(100000);
        });
    },

    /**
     * Executes each tick for the machine.
     * 
     * @param {import('@minecraft/server').BlockComponentTickEvent} e
     * @param {{ params: MachineSettings }} ctx
     */
    onTick(e, { params: settings }) {
        if (!worldLoaded) return;

        const { block } = e;
        const machine = new Machine(block, settings);
        const inv = machine.inv;

        const size = inv.size;
        const OUTPUT_SLOT = size - 1;
        const INPUT_START = size - 10;
        const INPUT_END = size - 2;

        // --- 1) Validate blueprint ---
        const blueprint = inv.getItem(BLUEPRINT_SLOT);
        if (!blueprint || blueprint?.typeId !== 'utilitycraft:blueprint') {
            machine.showWarning('No Blueprint');
            return; // label: No Blueprint
        }

        // --- 2) Validate energy ---
        if (machine.energy.get() <= 0) {
            machine.showWarning('No Energy', false);
            return; // label: No Energy
        }

        // --- 3) Validate materials ---
        let hasMaterials = false;
        for (let i = INPUT_START; i <= INPUT_END; i++) {
            if (inv.getItem(i)) {
                hasMaterials = true;
                break;
            }
        }
        if (!hasMaterials) {
            machine.showWarning('No Materials');
            return; // label: No Materials
        }

        // --- 4) Validate output space ---
        const resultItem = blueprint.getDynamicProperty('id');
        const resultAmount = blueprint.getDynamicProperty('amount');
        const leftover = blueprint.getDynamicProperty('leftover') || false;

        if (!resultItem || !resultAmount) {
            machine.showWarning('Invalid Blueprint');
            return;
        }

        const outputSlot = inv.getItem(OUTPUT_SLOT);
        const available = outputSlot
            ? (outputSlot.typeId === resultItem
                ? Math.max(0, 64 - outputSlot.amount)
                : 0)
            : 64;

        if (available < resultAmount) {
            machine.showWarning('Output Full');
            return; // label: Output Full
        }

        const energyCost = settings.machine.energy_cost;
        const progress = machine.getProgress();

        // --- 5) Processing Logic ---
        if (progress >= energyCost) {

            const maxCraftAmount = Math.min(Math.floor(available / resultAmount), machine.boosts.speed);

            const craftCount = amountToCraft(blueprint, inv, maxCraftAmount);
            if (craftCount <= 0) {
                machine.showWarning('Missing Materials', false);
                return;
            }
            machine.dim.runCommand(`say ${resultAmount} ${maxCraftAmount} ${craftCount} `)
            // Add crafted items to output
            if (!outputSlot) {
                machine.entity.setItem(OUTPUT_SLOT, resultItem, craftCount * resultAmount);
            } else {
                machine.entity.changeItemAmount(OUTPUT_SLOT, craftCount * resultAmount);
            }

            // Add leftover item if exists
            if (leftover !== false) {
                machine.entity.addItem(leftover, 1);
            }

            // Consume progress
            machine.addProgress(-energyCost);
        } else {
            // Consume energy progressively like autosieve
            const energyToConsume = Math.min(machine.energy.get(), settings.machine.rate_speed_base);
            machine.energy.consume(energyToConsume);
            machine.addProgress(energyToConsume / machine.boosts.consumption);
        }

        // --- 6) Visuals and status ---
        machine.on();
        machine.displayEnergy();
        machine.displayProgress();
        machine.showStatus('Running');
    },

    onPlayerBreak(e) {
        Machine.onDestroy(e);
    }
});


/**
 * Calculates how many times the blueprint can be crafted given the input inventory,
 * respecting the maximum craft amount, and consumes the materials.
 * Used by the Assembler (Autocrafter).
 *
 * @param {import('@minecraft/server').ItemStack} blueprint The blueprint containing the 'materials' dynamic property (JSON array).
 * @param {import('@minecraft/server').Container} inventory The inventory container to consume materials from.
 * @param {number} maxCraftAmount The max number of times to craft.
 * @returns {number} The number of crafts performed (0 if not possible).
 */
function amountToCraft(blueprint, inventory, maxCraftAmount) {
    // Parse the recipe materials from the blueprint dynamic property
    const recipe = JSON.parse(blueprint.getDynamicProperty('materials') || '[]');

    // Map of available materials
    const materialMap = {};
    for (let slot = inventory.size - 10; slot < inventory.size - 1; slot++) {
        const item = inventory.getItem(slot);
        if (item) {
            materialMap[item.typeId] = (materialMap[item.typeId] || 0) + item.amount;
        }
    }

    // Calculate max possible crafts based on available materials
    let possibleCrafts = 64;
    for (const mat of recipe) {
        const available = materialMap[mat.id] || 0;
        const craftsForMat = Math.floor(available / (mat.amount + 1));
        if (craftsForMat === 0) return 0;
        possibleCrafts = Math.min(possibleCrafts, craftsForMat);
    }

    // Limit crafts by maxCraftAmount
    const craftsToDo = Math.min(possibleCrafts, maxCraftAmount);
    if (craftsToDo === 0) return 0;

    // Consume materials from input slots
    for (const mat of recipe) {
        let remainingToConsume = mat.amount * craftsToDo;

        for (let slot = inventory.size - 10; slot < inventory.size - 1 && remainingToConsume > 0; slot++) {
            const item = inventory.getItem(slot);
            if (item && item.typeId === mat.id) {
                if (item.amount <= remainingToConsume) {
                    remainingToConsume -= item.amount;
                    inventory.setItem(slot, undefined);
                } else {
                    item.amount -= remainingToConsume;
                    inventory.setItem(slot, item);
                    remainingToConsume = 0;
                }
            }
        }
    }

    return craftsToDo;
}
