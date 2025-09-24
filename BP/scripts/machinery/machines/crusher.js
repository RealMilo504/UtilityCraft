import * as doriosAPI from '../../doriosAPI.js'
import { Machine, settings } from '../machines_class.js'

doriosAPI.register.OldBlockComponent('utilitycraft:crusher', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.crusher);
    },
    onTick(e) {
        if (e.block?.typeId == 'minecraft:air') return;
        const machine = new Machine(e.block, settings.crusher)
        if (!machine.entity || !machine.inv) return
        machine.runProccessSingleMachine()
    },
    onPlayerDestroy(e) {
        Machine.onDestroy(e)
    }
})