import { Generator, Energy, FluidManager } from '../managers.js'
export const heatSources = {
    'utilitycraft:blaze_block': 1.5,
    'minecraft:lava': 1,
    'minecraft:flowing_lava': 1,
    'minecraft:soul_fire': 0.75,
    'minecraft:soul_torch': 0.75,
    'minecraft:soul_campfire': 0.75,
    'minecraft:fire': 0.5,
    'minecraft:campfire': 0.5,
    'minecraft:magma': 0.5,
    'minecraft:torch': 0.25
}
const ENERGY_PER_WATER_MB = 1

DoriosAPI.register.blockComponent('thermo_generator', {
    /**
     * Runs before the machine is placed by the player.
     * 
     * @param {import('@minecraft/server').BlockComponentPlayerPlaceBeforeEvent} e
     * @param {{ params: GeneratorSettings }} ctx
     */
    beforeOnPlayerPlace(e, { params: settings }) {
        Generator.spawnGeneratorEntity(e, settings, (entity) => {
            entity.setItem(1, 'utilitycraft:arrow_right_0')
        });
    },

    /**
     * Executes each tick for the generator.
     * 
     * @param {import('@minecraft/server').BlockComponentTickEvent} e
     * @param {{ params: GeneratorSettings }} ctx
     */
    onTick(e, { params: settings }) {
        if (!worldLoaded) return;
        const { block } = e;
        const generator = new Generator(block, settings);
        if (!generator.entity) return
        const { entity, energy, rate } = generator
        generator.energy.transferToNetwork(rate * 4)

        /** @type {FluidManager} */
        const fluid = FluidManager.initializeSingle(entity);
        const heatMultiplier = heatSources[block.below(1)?.typeId]
        if (!heatMultiplier) {
            generator.displayEnergy();
            fluid.display(2)
            generator.off();
            generator.setLabel(`
§r§eNo Heat Source

§r§eInformation
 §eHeat: §f---


§r§bEnergy at ${Math.floor(energy.getPercent())}%%
§r§cRate ${Energy.formatEnergyToText(generator.rate)}/t
                    `)
            return
        }

        let burnSpeed = rate * heatMultiplier

        if (fluid.type == 'empty') {
            generator.displayEnergy();
            fluid.display(2)
            generator.off();
            generator.setLabel(`
§r§eNo Coolant

§r§eInformation
 §eHeat: §f---


§r§bEnergy at ${Math.floor(energy.getPercent())}%%
§r§cRate ${Energy.formatEnergyToText(burnSpeed)}/t
                    `)
            return
        }

        if (fluid.type != 'water') {
            generator.displayEnergy();
            fluid.display(2)
            generator.off();
            generator.setLabel(`
§r§eInvalid Coolant

§r§eInformation
 §eHeat: §f---


§r§bEnergy at ${Math.floor(energy.getPercent())}%%
§r§cRate ${Energy.formatEnergyToText(burnSpeed)}/t
                    `)
            return
        }

        // If generator has space for energy
        if (energy.getFreeSpace() <= 0) {
            generator.displayEnergy();
            fluid.display(2)
            generator.off();
            generator.setLabel(`
§r§eEnergy Full

§r§eInformation
 §eHeat: §f${heatMultiplier * 100}%%


§r§bEnergy at ${Math.floor(energy.getPercent())}%%
§r§cRate ${Energy.formatEnergyToText(burnSpeed)}/t
                    `)
            return
        }

        burnSpeed = Math.min(
            burnSpeed,
            energy.getFreeSpace(),
            fluid.get() * ENERGY_PER_WATER_MB
        )

        fluid.consume(burnSpeed / ENERGY_PER_WATER_MB)
        energy.add(burnSpeed)

        // Update visuals
        generator.on();
        generator.displayEnergy();
        fluid.display(2)
        generator.setLabel(`
§r§aRunning

§r§eInformation
 §eHeat: §f${heatMultiplier * 100}%%
 

§r§bEnergy at ${Math.floor(energy.getPercent())}%%
§r§cRate ${Energy.formatEnergyToText(generator.rate)}/t
                    `)
    },

    onPlayerBreak(e) {
        Generator.onDestroy(e);
    },

    onPlayerInteract({ block, player }) {
        const mainHand = player.getEquipment('Mainhand')
        if (!mainHand) return

        const entity = block.dimension.getEntitiesAtBlockLocation(block.location)[0]
        if (!entity) return

        const fluid = new FluidManager(entity, 0)
        const insert = fluid.fluidItem(mainHand.typeId)
        if (insert == false) return
        if (!player.isInCreative()) {
            player.changeItemAmount(player.selectedSlotIndex, -1)
            if (insert != undefined) player.giveItem(insert)
        }
    }
});
