import * as doriosAPI from '../../doriosAPI.js'
import { Machine, LiquidManager, settings } from '../machines_class.js'
import { itemLiquidContainers } from '../generators_config.js'

doriosAPI.register.OldBlockComponent('utilitycraft:magmatic_chamber', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.magmaticChamber);
    },
    onTick(e) {
        if (e.block?.typeId == 'minecraft:air') return;
        const machine = new Machine(e.block, settings.magmaticChamber)
        if (!machine.entity || !machine.inv || !machine.liquid) return
        machine.liquid.transferForward(1000, e.block)
        machine.entity?.runCommand(`scoreboard players set @s liquidCap_0 ${settings.magmaticChamber.liquidCap}`)

        Machine.tick(() => {
            let item = machine.inv?.getItem(3);
            const itemToProcess = machine.settings.recipes[item?.typeId]

            // If theres no item to process or the machine is full return
            if (!itemToProcess) {
                machine.displayLiquid()
                machine.displayEnergy()
                machine.progress.reset(7)
                return;
            }

            // Facing direction
            let { x, y, z } = e.block.location
            const facingOffsets = { up: [0, -1, 0], down: [0, 1, 0], north: [0, 0, 1], south: [0, 0, -1], west: [1, 0, 0], east: [-1, 0, 0] };
            const facing = facingOffsets[e.block.permutation.getState('minecraft:facing_direction')];
            if (facing) [x, y, z] = [x + facing[0], y + facing[1], z + facing[2]];

            const canAccept = itemToProcess.type == machine.liquid.type || machine.liquid.type == 'empty'
            // Do process
            const energyCost = settings.magmaticChamber.energyCost
            if (itemToProcess.amount <= machine.liquid.getFreeSpace() && canAccept) {

                if (machine.progress.get() >= energyCost) {
                    let processCount = Math.min(Math.floor(machine.progress.get() / energyCost), item.amount);
                    machine.liquid.setType(itemToProcess.type)
                    machine.liquid.add(processCount * itemToProcess.amount)
                    machine.progress.add(-processCount * energyCost)
                    doriosAPI.containers.changeItemAmount(machine.inv, 3, -processCount)
                } else {
                    machine.processWithEnergy()
                }
            }

            machine.displayLiquid()
            machine.displayEnergy()
            machine.displayProgress(7, machine.settings.energyCost)
        })
    },
    onPlayerDestroy(e) {
        Machine.onDestroy(e)
    },
    onPlayerInteract(e) {
        const player = e.player
        const liquid = new LiquidManager(e.block, settings.magmaticChamber)
        if (!liquid.entity) return

        const mainhand = doriosAPI.entities.getEquipment(player, 'Mainhand')?.typeId

        const insert = machine.liquid.liquidItem(mainhand, itemLiquidContainers)
        if (insert == false) return
        if (player.getGameMode() != 'creative') {
            doriosAPI.entities.changeItemAmount(player, player.selectedSlotIndex, -1)
            if (insert != undefined) {
                doriosAPI.entities.addItem(player, insert)
            }
        }
    }
})