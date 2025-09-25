import { system, world } from '@minecraft/server';

/**
 * @typedef {import("@minecraft/server").BlockCustomComponent} BlockCustomComponent
 * @typedef {import("@minecraft/server").ItemCustomComponent} ItemCustomComponent
 */


const NAMESPACE = 'utilitycraft'
globalThis.DoriosAPI = {
    register: {
        /**
         * Registers a custom block component into the block component registry.
         * 
         * Runs only after the world has loaded.
         * 
         * Automatically prefixes the component identifier with the namespace `"utilitycraft"`.
         *
         * @param {string} id Identifier for the component (e.g., "machine" → "utilitycraft:machine").
         * @param {BlockCustomComponent} handlers Lifecycle callbacks for the block.
         */
        blockComponent(id, handlers) {
            system.beforeEvents.startup.subscribe(e => {
                const { blockComponentRegistry } = e;

                blockComponentRegistry.registerCustomComponent(
                    NAMESPACE + ':' + id,
                    handlers
                );
            });
        },

        /**
         * Registers a custom item component into the item component registry.
         * 
         * Runs only after the world has loaded.
         * 
         * Automatically prefixes the component identifier with the namespace `"utilitycraft"`.
         *
         * @param {string} id Identifier for the component (e.g., "weapon" → "utilitycraft:weapon").
         * @param {ItemCustomComponent} handlers Lifecycle callbacks for the item.
         */
        itemComponent(id, handlers) {
            system.beforeEvents.startup.subscribe(e => {
                const { itemComponentRegistry } = e;

                itemComponentRegistry.registerCustomComponent(
                    NAMESPACE + ':' + id,
                    handlers
                );
            });
        }
    },
    utils: {
        /**
         * Returns a random number between [min, max).
         * 
         * @param {number} min - Minimum value (inclusive).
         * @param {number} max - Maximum value (exclusive).
         * @param {string} [mode="floor"] - How to handle decimals:
         *   - "floor": round down (default)
         *   - "ceil": round up
         *   - "round": round to nearest
         *   - "float": return raw decimal
         * @returns {number} Random value
         */
        randomInterval(min, max, mode = "floor") {
            const value = Math.random() * (max - min) + min
            switch (mode) {
                case "ceil": return Math.ceil(value)
                case "round": return Math.round(value)
                case "float": return value
                default: return Math.floor(value)
            }
        }
    }
}


world.afterEvents.worldLoad.subscribe(e => {
    if (globalThis.DoriosAPI) {
        world.sendMessage('Yes')
    } else {
        world.sendMessage('no')
    }
})