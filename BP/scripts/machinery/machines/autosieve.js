import * as doriosAPI from '../../doriosAPI.js'
import { Machine, settings } from '../machines_class.js'

doriosAPI.register.OldBlockComponent('twm:autosieve', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.autosieve);
    },
    onTick(e) {
        if (e.block?.typeId == 'minecraft:air') return;
        const machine = new Machine(e.block, settings.autosieve)
        if (!machine.entity || !machine.inv) return
        machine.transferItems(6, 14)

        Machine.tick(() => {
            const input = machine.inv.getItem(3);
            const mesh = machine.inv.getItem(5);

            const itemToProcess = machine.settings.recipes[input?.typeId];
            const multi = machine.settings.mesh[mesh?.typeId];

            if (!itemToProcess || !multi || machine.inv.emptySlotsCount === 0) {
                machine.displayEnergy();
                machine.progress.reset(4);
                return;
            }

            // If theres no energy left, return (Maintains progress)
            if (machine.energy.get() <= 0) {
                machine.displayEnergy()
                return
            }

            const progress = machine.progress.get()
            const energyCost = settings.autosieve.energyCost
            if (progress >= energyCost) {
                let processCount = Math.floor(Math.min(
                    input.amount,
                    progress / energyCost
                ))
                itemToProcess.forEach(loot => {
                    const randomChance = Math.random() * 100;
                    if (randomChance <= loot.prob * multi) {
                        try {
                            doriosAPI.entities.addItem(machine.entity, loot.item,
                                processCount * Math.ceil(Math.random() * loot.amount)
                            )
                        } catch { }
                    }
                });
                machine.progress.add(-processCount * energyCost);
                doriosAPI.containers.changeItemAmount(machine.inv, 3, -processCount);
            } else {
                machine.processWithEnergy()
            }
            machine.turnOn()
            machine.displayEnergy()
            machine.displayProgress(4, energyCost)
        })
    },
    onPlayerDestroy(e) {
        Machine.onDestroy(e)
    }
})
