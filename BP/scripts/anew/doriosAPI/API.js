import { system } from '@minecraft/server';

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
         * Returns a random number between [min, max], inclusive if mode = "floor".
        * 
        * @param {number} min Minimum value.
        * @param {number} max Maximum value.
        * @param {string} [mode="floor"] How to handle decimals:
        *   - "floor": round down (inclusive of max)
        *   - "round": round to nearest
        *   - "float": return raw decimal
        * @returns {number} Random value
        */
        randomInterval(min, max, mode = "floor") {
            let value;
            if (mode === "floor") {
                value = Math.random() * (max - min + 1) + min; // inclusive max
                return Math.floor(value);
            }

            value = Math.random() * (max - min) + min; // [min, max)
            switch (mode) {
                case "round": return Math.round(value);
                case "float": return value;
                default: return Math.floor(value);
            }
        }
    },
    /**
    * List of blocks that cannot be broken or replaced by machines.
    * 
    * These blocks are considered unbreakable for safety reasons,
    * game logic, or to avoid exploits. 
    * 
    * Use this array to check against when validating block-breaking
    * operations (e.g., Block Breaker, custom mining systems).
    */
    unbreakableBlocks: [
        "minecraft:allow",
        "minecraft:barrier",
        "minecraft:bedrock",
        "minecraft:border_block",
        "minecraft:deny",
        "minecraft:end_portal_frame",
        "minecraft:end_portal",
        "minecraft:portal",
        "minecraft:reinforced_deepslate",
        "minecraft:command_block",
        "minecraft:chain_command_block",
        "minecraft:repeating_command_block"
    ]
}