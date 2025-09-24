import * as doriosAPI from '../../doriosAPI.js'
import { Machine, settings } from '../machines_class.js'
import { system } from '@minecraft/server'

doriosAPI.register.OldBlockComponent('utilitycraft:block_placer', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.blockPlacer);
        system.runTimeout(() => {
            new Machine(e.block, settings.blockPlacer).displayEnergy()
        }, 10)
    },
    onTick(e) {
        const machine = new Machine(e.block, settings.blockPlacer)
        const realEnergyCost = Math.ceil(settings.blockPlacer.energyCost * (1 - 0.2 * e.block.permutation.getState('utilitycraft:energy')))

        // If theres no energy, return
        if (machine.energy.get() < realEnergyCost) {
            machine.turnOff()
            machine.displayEnergy()
            return
        }

        let item = machine.inv?.getItem(3)
        // If theres no block to place, return
        if (!item) {
            machine.turnOff()
            machine.displayEnergy()
            return
        }
        // Facing direction
        let { x, y, z } = e.block.location
        const facingOffsets = { up: [0, -1, 0], down: [0, 1, 0], north: [0, 0, 1], south: [0, 0, -1], west: [1, 0, 0], east: [-1, 0, 0] };
        const facing = facingOffsets[e.block.permutation.getState('minecraft:facing_direction')];
        if (facing) [x, y, z] = [x + facing[0], y + facing[1], z + facing[2]];

        const blockNext = e.block.dimension.getBlock({ x, y, z })
        // If the next block isnt air, return
        if (blockNext?.typeId != 'minecraft:air') {
            machine.turnOff()
            machine.displayEnergy()
            return
        }
        // Try to place the block, if catch, that means is not a block 
        try {
            blockNext.setType(`${item.typeId}`)
            doriosAPI.containers.changeItemAmount(machine.inv, 3, -1)
            machine.energy.add(-realEnergyCost)
            machine.turnOn()
        } catch {
            machine.turnOff()
        }
        machine.displayEnergy()
    },
    onPlayerDestroy(e) {
        Machine.onDestroy(e)
    }
})