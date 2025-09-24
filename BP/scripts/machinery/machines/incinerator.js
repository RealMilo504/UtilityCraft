import * as doriosAPI from '../../doriosAPI.js'
import { Machine, settings } from '../machines_class.js'

doriosAPI.register.OldBlockComponent('twm:incinerator', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.incinerator);
    },
    onTick(e) {
        const { block } = e;
        // If by any chance the script is executed when you break the machine, returns to avoid errors
        if (block?.typeId == 'minecraft:air') return;

        const machine = new Machine(block, settings.incinerator)
        if (!machine.entity || !machine.inv) return
        machine.runProccessSingleMachine()
    },
    onPlayerDestroy(e) {
        Machine.onDestroy(e)
    }
})