import * as doriosAPI from '../../doriosAPI.js'
import { Machine, settings } from '../machines_class.js'

doriosAPI.register.OldBlockComponent('twm:infuser', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.infuser,
            (entity) => {
                doriosAPI.entities.setItem(entity, 6, 'twm:arrow_indicator_90', 1)
            })
    },
    onTick(e) {
        if (e.block?.typeId == 'minecraft:air') {
            console.log('Sopas, you broke the block in the same tick as the function.');
            return;
        }
        const machine = new Machine(e.block, settings.infuser)
        doriosAPI.containers.pullItemsFromBlock(machine.inv, e.block.above(1), 5)
        machine.transferItems()

        Machine.tick(() => {
            // We obtain both items
            let itemA = machine.inv?.getItem(3); // Item to be infused
            let itemB = machine.inv?.getItem(5); // Infuser

            // Verify both exists
            if (!itemA || !itemB) {
                machine.displayEnergySingle()
                machine.progress.reset(4)
                return
            }

            if (machine.energy.get() <= 0) {
                machine.displayEnergySingle()
                return
            }

            // Get the global recipe
            const globalRecipe = settings.infuser.recipes[itemB.typeId]
            if (!globalRecipe) {
                machine.displayEnergySingle()
                machine.progress.reset(4)
                return
            }

            // Main recipe
            const recipe = globalRecipe[itemA.typeId];
            if (!recipe) {
                machine.displayEnergySingle()
                machine.progress.reset(4)
                return
            }

            // How much items can fit in the slot
            const spaceLeft = doriosAPI.containers.getInsertableAmount(machine.inv, 7, recipe.output)

            if (spaceLeft == 0 || recipe.required > itemB.amount) {
                machine.displayEnergySingle()
                machine.progress.reset(4)
                return
            }

            const progress = machine.progress.get()
            const energyCost = settings.infuser.energyCost
            // Do process
            if (progress >= energyCost) {
                let processCount = Math.floor(Math.min(
                    spaceLeft,
                    itemB.amount / recipe.required,
                    progress / energyCost
                ))
                machine.progress.add(-processCount * energyCost);
                doriosAPI.containers.addItem(machine.inv, recipe.output, processCount)
                doriosAPI.containers.changeItemAmount(machine.inv, 3, -processCount);
                doriosAPI.containers.changeItemAmount(machine.inv, 5, -processCount * recipe.required);
            } else {
                machine.processWithEnergy()
            }
            machine.turnOn()
            machine.displayEnergySingle()
            machine.displayProgress()
        });
    },
    onPlayerDestroy(e) {
        Machine.onDestroy(e)
    }
})
