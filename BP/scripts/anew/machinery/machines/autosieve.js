import { Machine, Energy } from '../managers.js'
import { sieveRecipes } from "../../config/recipes/sieve.js";

const INTPUTSLOT = 3
const MESHSLOT = 6

DoriosAPI.register.blockComponent('autosieve', {
    /**
     * Runs before the machine is placed by the player.
     * 
     * @param {{ params: MachineSettings }} ctx
     */
    beforeOnPlayerPlace(e, { params: settings }) {
        Machine.spawnMachineEntity(e, settings, () => {
            const machine = new Machine(e.block, settings);
            machine.setEnergyCost(settings.machine.energy_cost);
            machine.displayProgress()
            // Fill Slot to avoid issues
            machine.entity.setItem(1, 'utilitycraft:arrow_right_0')
            machine.energy.set(100000)
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

        /** @type {MeshParams} */
        const meshData = meshSlot.getComponent("utilitycraft:mesh").customComponentParameters.params

        // Validate recipe based on the input item
        const recipe = sieveRecipes[inputSlot?.typeId]
        if (!recipe) {
            machine.showWarning('Invalid Block')
            return;
        }

        const upgrades = {
            hasSpeed: machine.upgrades.speed !== 0,
            hasEnergy: machine.upgrades.energy !== 0
        };

        // Base count of empty slots
        let filledSlots = inv.emptySlotsCount;

        // Subtract empty upgrade slots so they don't count as usable space
        if (!upgrades.hasSpeed) filledSlots--;
        if (!upgrades.hasEnergy) filledSlots--;

        // Check how many items can still fit in the output slot
        if (filledSlots == 0) {
            machine.showWarning('Output Full')
            return;
        }

        const progress = machine.getProgress();
        const energyCost = settings.machine.energy_cost;

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

            const multi = meshData.multiplier
            const tier = meshData.tier

            machine.blockSlots(settings.machine.upgrades)

            // === 2) Process and add loot ===
            recipe.forEach(loot => {
                if (tier < (loot.tier ?? 0)) return;
                if (loot.item == "minecraft:flint" && tier >= 7) return;
                if (Math.random() <= loot.chance * multi) {
                    let qty = Array.isArray(loot.amount)
                        ? DoriosAPI.math.randomInterval(loot.amount[0], loot.amount[1])
                        : loot.amount;

                    if (meshData.amount_multiplier) qty *= meshData.amount_multiplier;

                    try {
                        machine.entity.addItem(
                            loot.item,
                            processCount * Math.ceil(Math.random() * qty)
                        );
                    } catch { }
                }
            });

            machine.unblockSlots(settings.machine.upgrades)


            // Deduct progress and input items
            machine.addProgress(-processCount * energyCost);
            machine.entity.changeItemAmount(INTPUTSLOT, -processCount);
        } else {
            // If not enough progress, continue charging with energy
            const energyToConsume = Math.min(machine.energy.get(), machine.rate)
            machine.energy.consume(energyToConsume);
            machine.addProgress(energyToConsume / machine.boosts.consumption);
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