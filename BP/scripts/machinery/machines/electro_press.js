import * as doriosAPI from '../../doriosAPI.js'
import { Machine, settings } from '../machines_class.js'

doriosAPI.register.OldBlockComponent('utilitycraft:electro_press', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.electroPress);
    },
    onTick(e) {
        const machine = new Machine(e.block, settings.electroPress)

        machine.transferItems();
        Machine.tick(() => {
            machine.setRefreshSpeed();
            const itemToProcess = machine.getItemToProcessSingleMachine();
            const { recipe, inputSlot, spaceLeft } = itemToProcess

            if (!itemToProcess || inputSlot?.amount < recipe.required) {
                machine.displayEnergy();
                machine.progress.reset(4);
                return;
            }

            if (machine.energy.get() <= 0) {
                machine.displayEnergy();
                machine.turnOff();
                return;
            }

            const progress = machine.progress.get();
            const energyCost = machine.settings.energyCost;

            if (progress >= energyCost) {
                const processCount = Math.min(
                    Math.floor(progress / energyCost),
                    Math.floor(inputSlot.amount / recipe.required),
                    spaceLeft
                );
                doriosAPI.containers.addItem(machine.inv, recipe.output, processCount)

                machine.progress.add(-processCount * energyCost);
                doriosAPI.entities.changeItemAmount(machine.entity, 3, -processCount * recipe.required);
            } else {
                machine.processWithEnergy();
            }

            machine.turnOn();
            machine.displayEnergy();
            machine.displayProgress();
        })
    },
    onPlayerDestroy(e) {
        Machine.onDestroy(e)
    }
})