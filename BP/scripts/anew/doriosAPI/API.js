import { system, Player, Block, Entity, Container } from '@minecraft/server';
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
 * ----------------------------------------------------
 * @namespace DoriosAPI
 * @version 1.0.0
 * @author Milo504
 * @studio Dorios Studios
 * @license All Rights Reserved
 * @repository 
 * @docs 
 * @lastUpdate 2025-09-27
 * -----------------------------------------------------
 */
globalThis.DoriosAPI = {
    version: "1.0.0",
    /**
     * Functions to register custom components into Minecraft registries.
     *
     * Provides helpers to simplify the registration of
     * block and item components, automatically prefixing
     * the identifier with the `"utilitycraft"` namespace.
     *
     * @namespace DoriosAPI.register
     */
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
    /**
     * This function was created by **Dorios Studios** to handle
     * item insertions into inventories with compatibility for
     * custom addons and containers.
     *
     * ## Features
     * - Works with both **entities** and **containers** as parameters.
     * - Automatically extracts `minecraft:inventory.container` if an
     *   entity is passed instead of a container.
     * - Compatible with multiple addons:
     *   - **Storage Drawers (dustveyn:storage_drawers)**.
     *   - **Dorios containers** (custom entities with inventories).
     *   - **UtilityCraft machines** like Assemblers and Simple Inputs.
     * - Additional compatibility will be added in the future.
     *
     * @function addItem
     * @memberof DoriosAPI
     * @param {Entity | Container} target Target entity or container.
     * @param {ItemStack} itemStack Item to insert.
     * @returns {boolean} Whether the item was successfully added.
     */
    addItemStack(target, itemStack) {
        if (!itemStack) return false;

        // Resolve target inventory
        const targetInv = target?.getComponent?.("minecraft:inventory")?.container ?? target;
        if (!targetInv && !target) return false;

        // Storage Drawers
        if (target?.typeId?.includes("dustveyn:storage_drawers")) {
            const targetEnt = target.dimension.getEntitiesAtBlockLocation(target.location)[0];
            if (!targetEnt?.hasTag(itemStack.typeId)) return false;

            const targetId = targetEnt.scoreboardIdentity;
            let capacity = world.scoreboard.getObjective("capacity").getScore(targetId);
            let max_capacity = world.scoreboard.getObjective("max_capacity").getScore(targetId);

            if (capacity < max_capacity) {
                const amount = Math.min(itemStack.amount, max_capacity - capacity);
                targetEnt.runCommandAsync(`scoreboard players add @s capacity ${amount}`);
                return true;
            }
            return false;
        }

        // Entity with logic
        if (target?.getComponent) {
            // Simple input → slot 3 only
            if (target.getComponent("minecraft:type_family")?.hasTypeFamily("dorios:simple_input")) {
                const slotNext = targetInv.getItem(3);
                if (!slotNext) {
                    targetInv.setItem(3, itemStack);
                    return true;
                }
                if (slotNext.typeId === itemStack.typeId && slotNext.amount < 64) {
                    const amount = Math.min(itemStack.amount, 64 - slotNext.amount);
                    slotNext.amount += amount;
                    targetInv.setItem(3, slotNext);
                    return true;
                }
                return false;
            }

            // Assemblers → require 2 empty slots
            if (target?.typeId === "utilitycraft:assembler" && targetInv.emptySlotsCount < 2) return false;
        }

        // Normal containers
        if (targetInv?.emptySlotsCount > 0) {
            targetInv.addItem(itemStack);
            return true;
        }

        return false;
    },
    /**
     * Adds an item to an inventory or entity by item identifier and amount.
     *
     * Internally creates an `ItemStack` and uses {@link addItemStack}.
     *
     * @function addItem
     * @memberof DoriosAPI
     * @param {import("@minecraft/server").Entity | import("@minecraft/server").Container} target Target entity or container.
     * @param {string} itemId The identifier of the item (e.g. `"minecraft:iron_ingot"`).
     * @param {number} amount The quantity of items to add.
     * @returns {boolean} Whether the item was successfully added.
     */
    addItem(target, itemId, amount = 1) {
        if (!itemId || amount <= 0) return false;
        const itemStack = new ItemStack(itemId, amount);
        return addItemStack(target, itemStack);
    },
    /**
     * This function was created by **Dorios Studios** to handle
     * item transfers between inventories in Minecraft Bedrock.
     *
     * ## Features
     * - Works with both **entities** and **containers** as parameters.
     * - Automatically extracts `minecraft:inventory.container` if an
     *   entity is passed instead of a container.
     * - Uses {@link addItemStack} for all target insertions, ensuring
     *   compatibility with Dorios containers, Storage Drawers, and
     *   UtilityCraft machines.
     *
     * ## Parameters
     * - `initial` → Source entity or container.
     * - `target` → Target entity or container.
     * - `range` → Required. Either:
     *   - A single slot number (e.g. `5`)
     *   - An array with `[start, end]` indices (e.g. `[0, 5]`)
     *
     * @function transferItems
     * @memberof DoriosAPI
     * @param {Entity | Container} initial Source entity or container.
     * @param {Entity | Container} target Target entity or container.
     * @param {number | [number, number]} range Slot index or range of slots to transfer.
     */
    transferItems(initial, target, range) {
        const sourceInv = initial?.getComponent?.("minecraft:inventory")?.container ?? initial;
        if (!sourceInv) return;

        // Resolve range
        let start, end;
        if (typeof range === "number") {
            start = end = range;
        } else if (Array.isArray(range) && range.length === 2) {
            [start, end] = range;
        } else {
            return; // invalid
        }

        for (let slot = start; slot <= end; slot++) {
            let itemToTransfer = sourceInv.getItem(slot);
            if (!itemToTransfer) continue;

            // Try to add to target using addItemStack
            const added = addItemStack(target, itemToTransfer);

            // If fully added → clear slot
            if (added) {
                sourceInv.setItem(slot, undefined);
                continue;
            }
        }
    },
    /**
     * Utility functions provided by Dorios Studios
     * to simplify common development tasks within Minecraft addons.
     *
     * @namespace DoriosAPI.utils
     */
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
    /**
     * Constants used across Dorios Studios addons.
     *
     * Includes both general Minecraft constants and
     * specific constants defined by Dorios Studios.
     *
     * @namespace DoriosAPI.constants
     */
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