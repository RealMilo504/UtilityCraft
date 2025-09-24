import * as doriosAPI from '../../doriosAPI.js'
import { Machine, settings } from '../machines_class.js'

doriosAPI.register.OldBlockComponent('utilitycraft:induction_anvil', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.inductionAnvil);
        e.block.dimension.playSound('random.anvil_land', e.block.location)
    },
    onTick(e) {
        const machine = new Machine(e.block, settings.inductionAnvil)
        Machine.tick(() => {
            machine.displayEnergy()
            let item = machine.inv?.getItem(3)
            if (!item) return
            let rateSpeed = settings.inductionAnvil.rateSpeedBase * Math.pow(2, e.block.permutation.getState('utilitycraft:speed'));
            rateSpeed *= e.block.permutation.getState('utilitycraft:refreshSpeed')
            const per = doriosAPI.items.getDamage(item)
            if (item && per > 0 && machine.energy.value >= rateSpeed) {
                let newItem = doriosAPI.items.repair(item, rateSpeed)
                machine.inv.setItem(3, newItem)
                machine.energy.add(-rateSpeed)
            }
        })

    },
    onPlayerDestroy(e) {
        Machine.onDestroy(e)
    }
})
