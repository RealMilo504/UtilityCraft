import { system } from '@minecraft/server';
const NAMESPACE = 'utilitycraft'

/**
 * @typedef {import("@minecraft/server").BlockCustomComponent} BlockCustomComponent
 * @typedef {import("@minecraft/server").ItemCustomComponent} ItemCustomComponent
 */

/**
 * ==================================================
 * DoriosAPI - Official Library by Dorios Studios
 * ==================================================
 *
 * This is the official API of **Dorios Studios**, created by Milo504.
 *
 * It serves as the foundation of the UtilityCraft addon and other projects,
 * centralizing common logic and utilities in one place.
 *
 * ## Purpose
 * - Simplifies the registration of custom **block** and **item components**.
 * - Provides **utility functions** (random ranges, string formatting, etc.).
 * - Stores **constants** used across multiple systems (e.g., unbreakable blocks).
 *
 * ## Extensions
 * In addition to this core file, DoriosAPI includes multiple modules
 * where default Minecraft classes are extended with new methods:
 *
 * - **Entity** → extra methods for data handling and interaction.
 * - **Player** → inventory helpers, item giving, stat handling, etc.
 * - **Block** → additional logic for machines and block utilities.
 * - **ItemStack** → simplified manipulation and checks.
 *
 * All extensions were created by **Milo504** with the goal of making
 * development **faster, cleaner, and more consistent**.
 *
 * Contributors are welcome to build upon this API, but credits to
 * **Dorios Studios** and **Milo504** should always remain.
 *
 * ------------------------------------------------------------
 * @namespace DoriosAPI
 * @version 1.0.0
 * @author Milo504
 * @studio Dorios Studios
 * @license All Rights Reserved
 * @repository 
 * @docs 
 * @lastUpdate 2025-09-27
 * ------------------------------------------------------------
 */
globalThis.DoriosAPI = {
    version: "1.0.0",
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
        },
        /**
         * Capitalizes and formats a namespaced identifier into a readable string.
         *
         * Examples:
         * - "minecraft:stone" → "Stone"
         * - "utilitycraft:iron_block" → "Iron Block"
         *
         * @param {string} str The namespaced identifier (e.g. "namespace:item_name").
         * @returns {string} The formatted, capitalized name.
         */
        capitalize(str) {
            let name = str.split(':')[1]
            let result = name.charAt(0).toUpperCase() + name.slice(1)
            if (result.indexOf('_') === -1) return result

            let temp = result
                .split('_')
                .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
                .join(' ')
            return temp
        }

    },
    constants: {
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
}