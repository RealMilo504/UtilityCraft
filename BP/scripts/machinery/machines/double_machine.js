import { Machine } from '../managers.js'
import { infuserRecipes } from "../../config/recipes/infuser.js"

const INPUTSLOT = 3
const CATALYSTSLOT = 4

DoriosAPI.register.blockComponent('double_machine', {
    /**
     * Runs before the machine is placed by the player.
     * 
     * @param {BlockComponentPlayerPlaceBeforeEvent} e
     * @param {{ params: MachineSettings }} ctx
     */
    beforeOnPlayerPlace(e, { params: settings }) {
        Machine.spawnMachineEntity(e, settings, () => {
            const machine = new Machine(e.block, settings);
            machine.setEnergyCost(settings.machine.energy_cost);
            machine.displayProgress()
            // Fill Slot to avoid issues
            machine.entity.setItem(1, 'utilitycraft:arrow_indicator_90')
        });
    },

    /**
     * Executes each tick for the machine.
     * 
     * @param {BlockComponentTickEvent} e
     * @param {{ params: MachineSettings }} ctx
     */
    onTick(e, { params: settings }) {
        if (!worldLoaded) return;
        const { block } = e;
        const machine = new Machine(block, settings);
        if (!machine.valid) return

        machine.transferItems()

        const inv = machine.inv;
        const OUTPUTSLOT = inv.size - 1

        //#region Comprobations
        // Get the catalyst slot
        const catalystSlot = inv.getItem(CATALYSTSLOT);
        if (!catalystSlot) {
            machine.showWarning('No Catalyst');
            return;
        }

        // Get the input slot (slot 3 in this case)
        const inputSlot = inv.getItem(INPUTSLOT);
        if (!inputSlot) {
            machine.showWarning('No Base Item');
            return;
        }

        const recipesComponent = block.getComponent("utilitycraft:machine_recipes")?.customComponentParameters?.params
        let recipes;
        if (recipesComponent.type) {
            recipes = infuserRecipes
        } else {
            recipes = recipesComponent
        }

        if (!recipes) {
            machine.showWarning('No Recipes');
            return;
        }

        // Validate recipe based on the input item
        const recipe = recipes[catalystSlot.typeId + '|' + inputSlot.typeId];
        if (!recipe) {
            machine.showWarning('Invalid Recipe');
            return;
        }

        // Get the output slot (usually the last one)
        const outputSlot = inv.getItem(OUTPUTSLOT);
        // Output slot must either match the recipe result or be empty
        if (outputSlot && outputSlot?.typeId !== recipe.output) {
            machine.showWarning('Recipe Conflict');
            return;
        }

        // Check how many items can still fit in the output slot
        const spaceLeft = (outputSlot?.maxAmount ?? 64) - (outputSlot?.amount ?? 0);
        if ((recipe.amount ?? 1) > spaceLeft) {
            machine.showWarning('Output Full');
            return;
        }

        // Check if there are enough items in the input slot
        const required = recipe.required ?? 1;
        if (catalystSlot.amount < required) {
            machine.showWarning(`Needs ${recipe.required ?? 1} Items`);
            return;
        }
        //#endregion

        const progress = machine.getProgress();
        const energyCost = settings.machine.energy_cost;

        // Check energy availability
        if (machine.energy.get() <= 0) {
            machine.showWarning('No Energy', false);
            return;
        }

        // If there is enough progress accumulated to process
        if (progress >= energyCost) {
            const processCount = Math.min(
                Math.floor(progress / energyCost),
                Math.floor(catalystSlot.amount / required),
                Math.floor(spaceLeft / (recipe.amount ?? 1))
            );
            if (processCount > 0) {
                // Add the processed items to the output
                if (!outputSlot) {
                    machine.entity.setItem(OUTPUTSLOT, recipe.output, processCount * (recipe.amount ?? 1));
                } else {
                    machine.entity.changeItemAmount(OUTPUTSLOT, processCount * (recipe.amount ?? 1));
                }

                // Deduct progress and input items
                machine.addProgress(-processCount * energyCost);
                machine.entity.changeItemAmount(INPUTSLOT, -processCount);
                machine.entity.changeItemAmount(CATALYSTSLOT, -processCount * required);
            }
        } else {
            // If not enough progress, continue charging with energy
            const energyToConsume = Math.min(machine.energy.get(), machine.rate);
            machine.energy.consume(energyToConsume);
            machine.addProgress(energyToConsume);
        }

        // Update machine visuals and state
        machine.on();
        machine.displayEnergy();
        machine.displayProgress();
        // Machine operating normally
        machine.showStatus('Running');
    },

    onPlayerBreak(e) {
        Machine.onDestroy(e);
    }
});