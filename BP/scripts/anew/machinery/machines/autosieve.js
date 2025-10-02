import { Machine, Energy } from '../managers.js'
import { sieveRecipes } from "../../config/recipes/sieve.js";

const INTPUTSLOT = 3
const MESHSLOT = 6
const OUTPUTSLOT = 9

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

DoriosAPI.register.blockComponent('autosieve', {
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
            // Fill Slot to avoid issues
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

        const inv = machine.inv;

        // Get the input slot (slot 3 in this case)
        const inputSlot = inv.getItem(INTPUTSLOT);
        if (!inputSlot) {
            machine.showWarning('No Input Item')
            return;
        }

        const meshSlot = inv.getItem(MESHSLOT)
        if (!meshSlot || !meshSlot?.hasComponent("utilitycraft:mesh")) {
            machine.showWarning('No Mesh Item')
            return;
        }

        /**
         * Parameters stored in a sieve mesh item.
         *
         * @typedef {Object} MeshParams
         * @property {number} tier       The mesh tier level (e.g., 0, 1, 2...).
         * @property {number} multiplier Loot multiplier applied to sieve results.
         */

        /** @type {MeshParams} */
        const meshData = meshSlot.getComponent("utilitycraft:mesh").customComponentParameters.params

        // Validate recipe based on the input item
        const recipe = sieveRecipes[inputSlot?.typeId]
        if (!recipe) {
            machine.showWarning('Invalid Block')
            return;
        }

        // Check how many items can still fit in the output slot
        if (machine.inv.emptySlotsCount == 0) {
            machine.showWarning('Output Full')
            return;
        }

        const progress = machine.getProgress();
        const energyCost = settings.energy_cost;

        // Check energy availability
        if (machine.energy.get() <= 0) {
            machine.showWarning('No Energy')
            return;
        }

        // If there is enough progress accumulated to process
        if (progress >= energyCost) {
            const processCount = Math.min(
                Math.floor(progress / energyCost),
                Math.floor(inputSlot.amount)
            );

            recipe.forEach(loot => {
                if (Math.random() <= loot.prob * multi) {
                    try {
                        machine.entity.addItem(loot.item, processCount * Math.ceil(Math.random() * loot.amount)
                        )
                    } catch { }
                }
            });

            // Deduct progress and input items
            machine.addProgress(-processCount * energyCost);
            machine.entity.changeItemAmount(INTPUTSLOT, -processCount);
        } else {
            // If not enough progress, continue charging with energy
            const energyToConsume = Math.min(machine.energy.get(), machine.rate)
            machine.energy.consume(energyToConsume);
            machine.addProgress(energyToConsume)
        }

        // Update machine visuals and state
        machine.on();
        machine.displayEnergy();
        machine.displayProgress();
        // Machine operating normally
        machine.showStatus('Running')

    },
    onPlayerBreak(e) {
        Machine.onDestroy(e);
    }
});