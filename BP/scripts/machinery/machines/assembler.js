import * as doriosAPI from '../../doriosAPI.js'
import { Machine, settings } from '../machines_class.js'

doriosAPI.register.OldBlockComponent('twm:assembler', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.assembler);
    },
    onTick(e) {
        const machine = new Machine(e.block, settings.assembler)
        machine.transferItems()

        Machine.tick(() => {
            // We get the blueprint item
            let blueprint = machine.inv.getItem(3);
            if (!blueprint || blueprint?.typeId != 'twm:blueprint') {
                machine.displayEnergy()
                machine.progress.reset()
                return
            }

            // If theres no energy left, return (Maintains progress)
            if (machine.energy.get() <= 0) {
                machine.displayEnergy()
                machine.turnOff()
                return;
            }

            // If there are no materials to craft return
            let itemCount = 0
            for (let i = machine.inv.size - 10; i < machine.inv.size - 1; i++) {
                if (machine.inv.getItem(i)) itemCount++
            }
            if (itemCount == 0) {
                machine.displayEnergy()
                machine.progress.reset()
                return
            }

            // We get the recipe item
            const resultItem = blueprint.getDynamicProperty('id')
            const resultAmount = blueprint.getDynamicProperty('amount')
            const leftover = blueprint.getDynamicProperty('leftover') || false

            if (!resultItem) return
            const amountLeft = doriosAPI.containers.getInsertableAmount(machine.inv, 14, resultItem)
            if (amountLeft < resultAmount) {
                machine.displayEnergy()
                machine.progress.reset()
                return
            }

            let speed = 8 * e.block.permutation.getState('twm:speed')
            if (speed == 0) speed = 4
            let maxCraftAmount = Math.min(Math.floor(amountLeft / resultAmount), speed)

            // Do process
            if (machine.progress.get() >= machine.settings.energyCost) {
                let craftAmount = amountToCraft(blueprint, machine.inv, maxCraftAmount)
                if (craftAmount <= 0) {
                    machine.displayEnergy()
                    machine.turnOff()
                    return;
                }
                if (!machine.inv.getItem(machine.inv.size - 1)) {
                    doriosAPI.entities.setItem(machine.entity, 14, resultItem, craftAmount * resultAmount)
                } else {
                    doriosAPI.entities.changeItemAmount(machine.entity, 14, craftAmount * resultAmount)
                }
                if (leftover != false) doriosAPI.entity.addItem(machine.entity, leftover, 1)
                machine.progress.add(-machine.settings.energyCost)
            } else {
                machine.processWithEnergy()
            }

            machine.displayEnergy()
            machine.displayProgress(4, machine.settings.energyCost)
            machine.turnOn()
        })
    },
    onPlayerDestroy(e) {
        Machine.onDestroy(e)
    }
})

/**
 * Calculates how many times the blueprint can be crafted given the input inventory,
 * respecting the maximum craft amount, and consumes the materials.
 * Used by the Assembler (Autocrafter)
 * 
 * @param {Block} blueprint The blueprint block containing the 'materials' dynamic property (JSON array).
 * @param {Container} inventory The inventory container to consume materials from.
 * @param {number} maxCraftAmount The max number of times to craft.
 * @returns {number} The number of times the craft was performed (0 if not possible).
 */
function amountToCraft(blueprint, inventory, maxCraftAmount) {
    // Parse the recipe materials from the blueprint dynamic property
    const recipe = JSON.parse(blueprint.getDynamicProperty('materials') || '[]');

    // Count available materials in slots 6-14 (index 5 to 13)
    const materialMap = {};
    for (let slot = 5; slot < 14; slot++) {
        const item = inventory.getItem(slot);
        if (item) {
            materialMap[item.typeId] = (materialMap[item.typeId] || 0) + item.amount;
        }
    }

    // Calculate max possible crafts based on available materials
    let possibleCrafts = 64; // Start high, then find the minimum
    for (const mat of recipe) {
        const available = materialMap[mat.id] || 0;
        const craftsForMat = Math.floor(available / mat.amount);
        if (craftsForMat === 0) return 0; // Not enough material for even one craft
        possibleCrafts = Math.min(possibleCrafts, craftsForMat);
    }

    // Limit crafts by maxCraftAmount parameter
    const craftsToDo = Math.min(possibleCrafts, maxCraftAmount);
    if (craftsToDo === 0) return 0;

    // Consume materials from inventory slots 6-14
    for (const mat of recipe) {
        let remainingToConsume = mat.amount * craftsToDo;

        for (let slot = inventory.size - 10; slot < inventory.size - 1 && remainingToConsume > 0; slot++) {
            const item = inventory.getItem(slot);
            if (item && item.typeId === mat.id) {
                if (item.amount <= remainingToConsume) {
                    remainingToConsume -= item.amount;
                    inventory.setItem(slot, undefined); // Clear slot
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
