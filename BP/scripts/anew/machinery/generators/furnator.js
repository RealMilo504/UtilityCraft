import { Generator } from '../managers.js'

DoriosAPI.register.blockComponent('furnator', {
    /**
     * Runs before the machine is placed by the player.
     * 
     * @param {import('@minecraft/server').BlockComponentPlayerPlaceBeforeEvent} e
     * @param {{ params: GeneratorSettings }} ctx
     */
    beforeOnPlayerPlace(e, { params: settings }) {
        Generator.spawnGeneratorEntity(e, settings);
    },

    /**
     * Executes each tick for the generator.
     * 
     * @param {import('@minecraft/server').BlockComponentTickEvent} e
     * @param {{ params: GeneratorSettings }} ctx
     */
    onTick(e, { params: settings }) {
        if (!worldLoaded) return;
        const { block, dimension } = e;
        const generator = new Generator(block, settings);
        if (!generator.entity) return


        // Update visuals
        generator.on();
        generator.displayEnergy();
        // generator.showStatus('Running');
    },

    onPlayerBreak(e) {
        Machine.onDestroy(e);
    }
});
