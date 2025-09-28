import { system, world, Player, Block, Entity, Container, CommandPermissionLevel, CustomCommandParamType } from '@minecraft/server';
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
        * Capitalizes the first letter of a string and lowers the rest.
        * 
        * Example:
        *   capitalizeFirst("lava") → "Lava"
        *   capitalizeFirst("LIQUID") → "Liquid"
        * 
        * @param {string} text The text to format.
        * @returns {string} The formatted string with only the first letter capitalized.
        */
        capitalizeFirst(text) {
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        },
        /**
         * Wait for a specified number of ticks before executing a callback.
         *
         * @param {number} ticks The number of ticks to wait (20 ticks = 1 second).
         * @param {() => void} callback The function to execute after the delay.
         */
        waitTicks(ticks, callback) {
            system.runTimeout(callback, ticks);
        },

        /**
         * Wait for a specified number of seconds before executing a callback.
         *
         * @param {number} seconds The number of seconds to wait.
         * @param {() => void} callback The function to execute after the delay.
         */
        waitSeconds(seconds, callback) {
            const ticks = Math.floor(seconds * 20);
            system.runTimeout(callback, ticks);
        },
        /**
         * Sends a message to all players in the world.
         * 
         * @param {string} str The message to send.
         */
        msg(str) {
            world.sendMessage(`${str}`);
        },

        /**
         * Sends an action bar message to a player.
         * 
         * @param {Player} player The player to show the message to.
         * @param {string} msg The message to display.
         */
        actionBar(player, msg) {
            if (!player?.onScreenDisplay || typeof msg !== 'string') return;
            try {
                player.onScreenDisplay.setActionBar(msg);
            } catch {
                system.runTimeout(() => {
                    player.onScreenDisplay.setActionBar(msg);
                })
            }
        },
        /**
         * Sends a chat message directly to a player.
         * 
         * @param {Player} player The player to send the message to.
         * @param {string} msg The message to display.
         */
        playerMessage(player, msg) {
            if (!player || typeof msg !== 'string') return;
            try {
                player.sendMessage(msg);
            } catch {
                system.runTimeout(() => {
                    player.sendMessage(msg);
                });
            }
        },

        /**
         * Returns a random integer between min and max, inclusive.
         * 
         * @param {number} min The minimum value (inclusive).
         * @param {number} max The maximum value (inclusive).
         * @returns {number} A random integer between min and max.
         */
        randomInterval(min, max) {
            const minCeiled = Math.ceil(min);
            const maxFloored = Math.floor(max);
            return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
        },
        /**
         * Checks if an itemStack is a placeable block by attempting to set it at a dummy location.
         * It uses y = -64 to avoid affecting real structures.
         * 
         * @param {ItemStack} itemStack The item to test.
         * @param {BlockLocation} location Any location (x and z will be used).
         * @param {Dimension} dimension The dimension where the test happens.
         * @returns {boolean} True if the itemStack can be placed as a block, false otherwise.
         */
        isBlock(itemStack, location, dimension) {
            try {
                const testLoc = { x: location.x, y: -64, z: location.z };
                const testBlock = dimension.getBlock(testLoc);
                const originalType = testBlock.typeId;

                testBlock.setType(itemStack.typeId);
                testBlock.setType(originalType); // Restore the original block

                return true;
            } catch {
                return false;
            }
        },

        /**
         * Checks if an itemStack is *not* a block (i.e., is a regular item).
         * It does this by trying to place the item at a dummy location (y = -64).
         * 
         * @param {ItemStack} itemStack The item to test.
         * @param {BlockLocation} location Any location (x and z will be used).
         * @param {Dimension} dimension The dimension where the test happens.
         * @returns {boolean} True if the item is not a block, false if it's placeable.
         */
        isItem(itemStack, location, dimension) {
            try {
                const testLoc = { x: location.x, y: -64, z: location.z };
                const testBlock = dimension.getBlock(testLoc);
                const originalType = testBlock.typeId;

                testBlock.setType(itemStack.typeId);
                testBlock.setType(originalType); // Restore the original block

                return false; // If it can be placed, it's a block
            } catch {
                return true; // If it throws, it's an item
            }
        },
        /**
         * Transforms a namespaced or snake_case identifier into a human-readable title.
         * 
         * Examples:
         *   "minecraft:iron_sword" → "Iron Sword"
         *   "custom_item_name"     → "Custom Item Name"
         * 
         * @param {string} text The identifier to format.
         * @returns {string} The formatted title string.
         */
        formatIdToText(text) {
            const rawName = text.includes(":") ? text.split(":")[1] : text;
            return rawName
                .split("_")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        },
        /**
         * Prints a formatted JSON object to the player's chat.
         *
         * @param {Entity} player The player to send the message to.
         * @param {string} title A title to show before the JSON.
         * @param {Object} obj The object to stringify and print.
         */
        printJSON(player, title, obj) {
            const formatted = JSON.stringify(obj, null, 2).split("\n");
            player.sendMessage(`§6${title}:`);
            for (const line of formatted) {
                player.sendMessage(`§7${line}`);
            }
        }

    },
    /**
     * Mathematical helper functions provided by Dorios Studios.
     *
     * Includes common math utilities, number formatting,
     * vector calculations, proportional scaling, and
     * Roman numeral conversions.
     *
     * @namespace DoriosAPI.math
     */
    math: {
        /**
         * Clamps a value within a given range.
         *
         * @param {number} val The value to clamp.
         * @param {number} min The minimum allowed value.
         * @param {number} max The maximum allowed value.
         * @returns {number} Clamped value.
         */
        clamp(val, min, max) {
            return Math.max(min, Math.min(max, val));
        },

        /**
         * Rounds a number to a specified number of decimal places.
         *
         * @param {number} val The value to round.
         * @param {number} decimals Number of decimal places.
         * @returns {number} Rounded number.
         */
        roundTo(val, decimals) {
            const factor = Math.pow(10, decimals);
            return Math.round(val * factor) / factor;
        },

        /**
         * Calculates a clamped proportional value from 0 to the given scale.
         *
         * Useful for visual indicators like progress bars, energy levels, or tiered icons.
         * Converts a current value within a maximum range to a fixed-scale number.
         *
         * Example:
         *   scaleToSetNumber(45, 100, 5, 'floor') → 2
         *   scaleToSetNumber(45, 100, 5, 'normal') → 2.25
         *   scaleToSetNumber(45, 100, 5, 'ceil') → 3
         *
         * @param {number} current The current value (e.g. progress, energy).
         * @param {number} max The maximum possible value (e.g. capacity).
         * @param {number} scale The scale to map to (e.g. 6 for 0–6 icons).
         * @param {'floor' | 'ceil' | 'normal'} [mode='floor'] Rounding mode to apply to the result.
         * @returns {number} A clamped number from 0 to `scale`, rounded according to mode.
         */
        scaleToSetNumber(current, max, scale, mode = 'floor') {
            if (max <= 0) return 0;

            let value = (scale * current) / max;
            if (mode === 'floor') value = Math.floor(value);
            else if (mode === 'ceil') value = Math.ceil(value);

            return Math.max(0, Math.min(scale, value));
        },

        /**
         * Returns a directional vector [x, y, z] based on the block's facing direction.
         * @param {Block} block 
         * @returns {[number, number, number] | null}
         */
        getFacingVector(block) {
            const facing = block.permutation.getState('minecraft:facing_direction');
            switch (facing) {
                case 'up': return [0, 1, 0];
                case 'down': return [0, -1, 0];
                case 'north': return [0, 0, -1];
                case 'south': return [0, 0, 1];
                case 'west': return [-1, 0, 0];
                case 'east': return [1, 0, 0];
                default: return null;
            }
        },
        /**
        * Converts a Roman numeral string to its integer equivalent.
        * 
        * @param {string} str The Roman numeral to convert (e.g., "XIV").
        * @returns {number} The integer representation of the Roman numeral.
        */
        romanToInteger(str) {
            const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
            let total = 0, prev = 0;
            for (let i = str.length - 1; i >= 0; i--) {
                const val = map[str[i]];
                if (val < prev) total -= val;
                else total += val;
                prev = val;
            }
            return total;
        },

        /**
         * Converts an integer to its Roman numeral representation.
         * 
         * @param {number} num The number to convert (must be between 1 and 3999).
         * @returns {string} The Roman numeral string, or an empty string if invalid input.
         */
        integerToRoman(num) {
            if (typeof num !== "number" || num <= 0 || num >= 4000) return "";
            const map = [
                { value: 1000, numeral: "M" },
                { value: 900, numeral: "CM" },
                { value: 500, numeral: "D" },
                { value: 400, numeral: "CD" },
                { value: 100, numeral: "C" },
                { value: 90, numeral: "XC" },
                { value: 50, numeral: "L" },
                { value: 40, numeral: "XL" },
                { value: 10, numeral: "X" },
                { value: 9, numeral: "IX" },
                { value: 5, numeral: "V" },
                { value: 4, numeral: "IV" },
                { value: 1, numeral: "I" },
            ];
            let result = "";
            for (const { value, numeral } of map) {
                while (num >= value) {
                    result += numeral;
                    num -= value;
                }
            }
            return result;
        },

        /**
         * Calculates the distance between two vectors using the Pythagorean theorem.
         * 
         * @param {{ x: number, y: number, z: number }} a First vector.
         * @param {{ x: number, y: number, z: number }} b Second vector.
         * @returns {number} The distance between the two vectors.
         */
        distanceBetween(a, b) {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dz = a.z - b.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        },

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
        ],
        /**
         * Permission map for custom command registration.
         * 
         * Provides shortcuts for mapping string keys to 
         * CommandPermissionLevel values.
         * 
         * @constant
         */
        permissionMap: {
            any: CommandPermissionLevel.Any,
            host: CommandPermissionLevel.Host,
            owner: CommandPermissionLevel.Owner,
            admin: CommandPermissionLevel.Admin,
            gamedirector: CommandPermissionLevel.GameDirectors,
        },

        /**
         * Type map for custom command parameter definitions.
         * 
         * Provides shortcuts for mapping string keys to 
         * CustomCommandParamType values.
         * 
         * @constant
         */
        typeMap: {
            string: CustomCommandParamType.String,
            int: CustomCommandParamType.Integer,
            float: CustomCommandParamType.Float,
            bool: CustomCommandParamType.Boolean,
            enum: CustomCommandParamType.Enum,
            block: CustomCommandParamType.BlockType,
            item: CustomCommandParamType.ItemType,
            location: CustomCommandParamType.Location,
            target: CustomCommandParamType.EntitySelector,
            entityType: CustomCommandParamType.EntityType,
            player: CustomCommandParamType.PlayerSelector,
        },

        /**
         * Minecraft text formatting codes.
         * 
         * Includes all color codes and style modifiers
         * that can be used in chat, action bar, and UI text.
         * 
         * @constant
         */
        textColors: {
            // Colors
            black: "§0",
            darkBlue: "§1",
            darkGreen: "§2",
            darkAqua: "§3",
            darkRed: "§4",
            darkPurple: "§5",
            gold: "§6",
            gray: "§7",
            darkGray: "§8",
            blue: "§9",
            green: "§a",
            aqua: "§b",
            red: "§c",
            lightPurple: "§d",
            yellow: "§e",
            white: "§f",

            // Styles
            obfuscated: "§k",
            bold: "§l",
            strikethrough: "§m",
            underline: "§n",
            italic: "§o",
            reset: "§r"
        },

        /**
         * Common dimension identifiers with metadata.
         * 
         * @constant
         */
        dimensions: {
            overworld: {
                id: "minecraft:overworld",
                maxY: 320,
                minY: -64
            },
            nether: {
                id: "minecraft:nether",
                maxY: 128,
                minY: 0
            },
            end: {
                id: "minecraft:the_end",
                maxY: 256,
                minY: 0
            }
        },

        /**
         * Time conversion constants in game ticks.
         * 
         * @constant
         */
        time: {
            tick: 1,
            second: 20,
            minute: 1200,
            hour: 72000,
            day: 172800
        },

        /**
         * Equipment slot identifiers for entities/players.
         * Useful with Equippable component.
         * 
         * @constant
         */
        equipmentSlots: {
            mainhand: "Mainhand",
            offhand: "Offhand",
            head: "Head",
            chest: "Chest",
            legs: "Legs",
            feet: "Feet"
        },
    }
}

