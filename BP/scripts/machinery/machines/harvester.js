import { system } from '@minecraft/server'
import * as doriosAPI from '../../doriosAPI.js'
import { Machine, settings } from '../machines_class.js'

doriosAPI.register.OldBlockComponent('twm:harvest', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.harvester,)
        system.runTimeout(() => {
            new Machine(e.block, settings.harvester).displayEnergy()
        }, 10)
    },
    onTick(e) {
        const { block } = e
        let { x, y, z } = block.location
        y += 0.250, x += 0.5, z += 0.5
        // If by any chance the script is executed when you break the machine, returns to avoid errors
        if (block?.typeId == 'minecraft:air') return;

        const machine = new Machine(block, settings.harvester)
        if (!machine.entity || !machine.inv) return

        const range = block.permutation.getState('twm:range')
        let side = (range * 2) + 3
        let area = side ** 2

        let energy = machine.energy.get()
        const energyCost = settings.harvester.energyCost
        const realEnergyCost = Math.ceil(energyCost * (1 - 0.2 * block.permutation.getState('twm:energy')))

        if (energy <= realEnergyCost * area) {
            machine.turnOff()
            machine.displayEnergy()
            return
        }
        machine.energy.add(-realEnergyCost * area)

        let xtp = x, ytp = y, ztp = z
        let tx = 1, tz = 1
        side = (side == 11) ? 9 : side

        switch (block.permutation.getState('minecraft:facing_direction')) {
            case 'up':
                y--
                ytp++
                x += ((side - 1) / 2)
                z -= ((side - 1) / 2) + 1
                tx = -1
                break
            case 'down':
                y += 2
                ytp--
                x += ((side - 1) / 2)
                z -= ((side - 1) / 2) + 1
                tx = -1
                break
            case 'north':
                x += ((side - 1) / 2)
                tx = -1
                ztp--
                break
            case 'south':
                z -= (1 + side)
                x += ((side - 1) / 2)
                tx = -1
                ztp++
                break
            case 'west':
                x += (((side - 1)) + 1)
                z -= ((side - 1) / 2) + 1
                tx = -1
                xtp--
                break
            case 'east':
                x--
                z -= ((side - 1) / 2) + 1
                tx = -1
                xtp++
                break
        }

        for (let i = 1; i <= side; i++) {
            for (let j = 1; j <= side; j++) {
                z += tz
                block.dimension.runCommand(`execute positioned ${x} ${y} ${z} run function harvester`)
            }
            z -= side * tz
            x += tx
        }

        system.runTimeout(() => {
            block.dimension.runCommand(`tp @e[x=${x},y=${y - 1},z=${z},dx=${side},dz=${side},dy=${y - 1},type=item] ${xtp} ${ytp} ${ztp} `)
            machine.displayEnergy()
        }, 30);

        machine.displayEnergy()
        machine.turnOn()
    },
    onPlayerDestroy(e) {
        Machine.onDestroy(e)
    }
})