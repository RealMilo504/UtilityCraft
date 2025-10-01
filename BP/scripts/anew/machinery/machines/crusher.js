import { Machine } from '../managers.js'
import { crusherRecipes } from "../../config/recipes/crusher.js";

const INPUT = 3
const OUTPUT = 6

/**
 * Machine settings object for configuring behavior.
 * 
 * @typedef {Object} MachineSettings
 * @property {string} entity Entity identifier used to spawn the machine.
 * @property {string} name_tag Localized name tag identifier.
 * @property {number} energy_cost Energy consumed per operation.
 * @property {number} rate_speed_base Base processing rate (DE/t).
 * @property {number} energy_cap Maximum internal energy capacity.
 * @property {Object.<string, {output: string, amount?: number}>} recipes Recipe group by input item id.
 */

DoriosAPI.register.blockComponent('crusher', {
    /**
     * Runs before the machine is placed by the player.
     * 
     * @param {{ params: MachineSettings }} ctx
     */
    beforeOnPlayerPlace(e, { params: settings }) {
        Machine.spawnMachineEntity(e, settings, () => {
            const machine = new Machine(e.block, settings);
            machine.setEnergyCost(settings.energy_cost);
            machine.displayProgress()
            machine.entity.setItem(1, 'utilitycraft:arrow_right_0')
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
        const { block, dimension: dim } = e;
        const machine = new Machine(block, settings);

        // ================== Single-machine processing logic ==================

        const inv = machine.inv;

        // Get the input slot (slot 3 in this case)
        const inputSlot = inv.getItem(INPUT);
        if (!inputSlot) {
            // No input item → reset progress and stop
            machine.setProgress(0);
            machine.displayEnergy();
            return;
        }

        // Get the output slot (usually the last one)
        const outputSlot = inv.getItem(OUTPUT);

        // Validate recipe based on the input item
        const recipe = crusherRecipes[inputSlot?.typeId];
        if (!recipe || outputSlot?.amount >= 64) {
            // No valid recipe or output is already full
            machine.setProgress(0);
            machine.displayEnergy();
            return;
        }

        // Output slot must either match the recipe result or be empty
        if (outputSlot && outputSlot.typeId !== recipe.output) {
            machine.setProgress(0);
            machine.displayEnergy();
            return;
        }

        // Check how many items can still fit in the output slot
        const spaceLeft = (outputSlot?.maxAmount ?? 64) - (outputSlot?.amount ?? 0);
        if ((recipe.amount ?? 1) > spaceLeft) {
            // Not enough room for recipe output
            machine.setProgress(0);
            machine.displayEnergy();
            return;
        }

        // ================== Cycle execution ==================

        const progress = machine.getProgress();
        const energyCost = settings.energy_cost;

        // Check energy availability
        if (machine.energy.get() <= 0) {
            machine.off();
            return;
        }

        // If there is enough progress accumulated to process
        if (progress >= energyCost) {
            const processCount = Math.min(
                Math.floor(progress / energyCost),
                inputSlot.amount,
                spaceLeft
            );

            // Add the processed items to the output
            if (!outputSlot) {
                machine.entity.setItem(OUTPUT, recipe.output, processCount * (recipe.amount ?? 1))
            } else {
                machine.entity.changeItemAmount(OUTPUT, processCount * (recipe.amount ?? 1))
            }

            // Deduct progress and input items
            machine.addProgress(-processCount * energyCost);
            machine.entity.changeItemAmount(INPUT, -processCount);
        } else {
            // If not enough progress, continue charging with energy
            const energyToConsume = Math.min(machine.energy.get(), settings.rate_speed_base)
            machine.energy.consume(energyToConsume);
            machine.addProgress(energyToConsume)
        }

        // Update machine visuals and state
        machine.on();
        machine.displayEnergy();
        machine.displayProgress();
    },
    onPlayerBreak(e) {
        Machine.onDestroy(e);
    }
});