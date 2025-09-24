import * as doriosAPI from '../../doriosAPI.js';
import { Generator, settings } from '../generators_class.js'

doriosAPI.register.OldBlockComponent('utilitycraft:battery', {
    beforeOnPlayerPlace(e) {
        Generator.spawnGeneratorEntity(e, settings.battery)
    },
    onTick(e) {
        const gen = new Generator(e.block, settings.battery)
        const energy = gen.energy
        gen.transferEnergy(5)
        Generator.tick(() => {
            e.block.setPermutation(e.block.permutation.withState('utilitycraft:capacity',
                doriosAPI.math.scaleToSetNumber(energy.value, energy.cap, 6)))
            gen.displayEnergy()
        })
    },
    onPlayerDestroy(e) {
        Generator.onDestroy(e)
    }
})