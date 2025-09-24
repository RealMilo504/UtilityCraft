import * as doriosAPI from '../../doriosAPI.js'
import { Machine, settings } from '../machines_class.js'
import { system } from '@minecraft/server'

doriosAPI.register.OldBlockComponent('twm:block_breaker', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.blockBreaker);
        system.runTimeout(() => {
            const machine = new Machine(e.block, settings.blockBreaker)
            machine.displayEnergy()
        }, 10)
    },
    onTick(e) {
        const machine = new Machine(e.block, settings.blockBreaker)

        const realEnergyCost = Math.ceil(settings.blockBreaker.energyCost * (1 - 0.2 * e.block.permutation.getState('twm:energy')))

        // If theres no energy, return
        if (machine.energy.get() < realEnergyCost) {
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
        if (blockNext?.typeId == 'minecraft:air') {
            machine.turnOff()
            machine.displayEnergy()
            machine.displayInformationBasic(3, realEnergyCost)
            return
        }

        e.block.dimension.runCommand(`execute unless block ${x} ${y} ${z} bedrock unless block ${x} ${y} ${z} end_portal_frame unless block ${x} ${y} ${z} end_portal unless block ${x} ${y} ${z} portal unless block ${x} ${y} ${z} reinforced_deepslate unless block ${x} ${y} ${z} command_block unless block ${x} ${y} ${z} chain_command_block unless block ${x} ${y} ${z} repeating_command_block run setblock ${x} ${y} ${z} air destroy`)
        machine.energy.add(-realEnergyCost)
        machine.displayEnergy()
        machine.turnOn()
    },
    onPlayerDestroy(e) {
        Machine.onDestroy(e)
    }
})
