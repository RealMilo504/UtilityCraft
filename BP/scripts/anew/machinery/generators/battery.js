import { world } from '@minecraft/server'
import { Generator, Energy } from '../managers.js'

const entitySettings = {
    name: "battery",
    type: "battery"
}

DoriosAPI.register.blockComponent('battery', {
    /**
     * Runs before the machine is placed by the player.
     * 
     * @param {import('@minecraft/server').BlockComponentPlayerPlaceBeforeEvent} e
     * @param {{ params: GeneratorSettings }} ctx
     */
    beforeOnPlayerPlace(e, { params }) {
        const settings = {
            entity: entitySettings,
            generator: params
        }
        Generator.spawnGeneratorEntity(e, settings);
    },

    /**
     * Executes each tick for the generator.
     * 
     * @param {import('@minecraft/server').BlockComponentTickEvent} e
     * @param {{ params: GeneratorSettings }} ctx
     */
    onTick(e, { params }) {
        const settings = {
            entity: entitySettings,
            generator: params
        }
        if (!worldLoaded) return;
        const { block } = e;
        const generator = new Generator(block, settings);
        if (!generator.entity) return

        const { energy, rate, entity } = generator
        const current = energy.get()

        const lastEnergy = entity.getDynamicProperty('lastEnergy') ?? 0
        const buffer = current - lastEnergy
        let sign = buffer > 0 ? "§a+" : buffer < 0 ? "§c-" : "§f";

        const transfered = generator.energy.transferToNetwork(rate / 10)

        e.block.setPermutation(e.block.permutation.withState('utilitycraft:capacity',
            DoriosAPI.math.scaleToSetNumber(current, energy.cap, 6)))

        // Update visuals
        generator.on();
        generator.displayEnergy();
        generator.setLabel(`
§r§aStatus

§r§bEnergy at §f${Math.floor(energy.getPercent())}%%
 ${Energy.formatEnergyToText(current)} / ${Energy.formatEnergyToText(energy.cap)}

§r§cTransferring §f${Energy.formatEnergyToText(transfered)}
§r§aFlow ${sign}${Energy.formatEnergyToText(Math.abs(buffer))}/t
                    `)
        entity.setDynamicProperty('lastEnergy', current)
    },

    onPlayerBreak(e) {
        Generator.onDestroy(e);
    }
});
