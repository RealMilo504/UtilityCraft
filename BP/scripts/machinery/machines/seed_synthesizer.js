import * as doriosAPI from '../../doriosAPI.js'
import { Machine, settings } from '../machines_class.js'

doriosAPI.register.OldBlockComponent('utilitycraft:seed_synthesizer', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.seedSynthesizer);
    },
    onTick(e) {
        if (e.block?.typeId == 'minecraft:air') return;
        const machine = new Machine(e.block, settings.seedSynthesizer)
        if (!machine.entity || !machine.inv) return
        machine.transferItems(6, 14)

        Machine.tick(() => {
            const input = machine.inv.getItem(3);
            const soilItem = machine.inv.getItem(5);

            const seed = machine.settings.recipes[input?.typeId];
            const soil = machine.settings.soils[soilItem?.typeId];

            // If theres no item to process or the machine is full return
            if (!seed || !soil || machine.inv.emptySlotsCount == 0) {
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
            const energyCost = seed.cost * soil.cost
            if (progress >= energyCost) {
                const itemToProcess = seed.drops
                itemToProcess.forEach(loot => {
                    const randomChance = Math.random() * 100;
                    if (randomChance <= loot.prob) {
                        try {
                            const amount = doriosAPI.utils.randomInterval(loot.min, loot.max)
                            doriosAPI.containers.addItem(machine.inv, loot.item, amount)
                        } catch { }
                    }
                });
                machine.progress.add(- energyCost);
            } else {
                machine.processWithEnergy(energyCost)
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


