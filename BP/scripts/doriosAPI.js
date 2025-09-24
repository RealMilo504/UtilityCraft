import { system, world, ItemStack } from '@minecraft/server'

/**
 * Utility functions related to entities for Dorios API.
 *
 * Includes inventory management, health control, equipment handling,
 * and item durability operations for all entities that support relevant components.
 */
export const entities = {
    /**
     * Adds an item to the entity's inventory or drops it at the entity's location if the inventory is full.
     *
     * @param {Entity} entity The target entity to receive the item.
     * @param {ItemStack|string} item The item to add. Can be an ItemStack or an item identifier string.
     * @param {number} [amount=1] Amount of the item if a string is provided. Ignored if item is an ItemStack.
     */
    addItem(entity, item, amount = 1) {
        if (!entity?.getComponent || !entity.getComponent('inventory')) return;

        const inventory = entity.getComponent('inventory');
        const invContainer = inventory.container;

        const itemStack = typeof item === 'string'
            ? new ItemStack(item, amount)
            : item;

        if (this.isInventoryFull(entity)) {
            const loc = entity.location;
            entity.dimension.spawnItem(itemStack, loc);
        } else {
            invContainer.addItem(itemStack);
        }
    },

    /**
     * Changes the amount of items in a specific inventory slot of an entity.
     *
     * - Positive `amount` adds items.
     * - Negative `amount` removes items.
     * - Fails if the slot is empty, exceeds the stack limit, or goes below zero.
     *
     * @param {Entity} entity The entity with an inventory.
     * @param {number} slot The inventory slot index to modify.
     * @param {number} amount The amount to add (positive) or remove (negative).
     * @returns {boolean} Whether the operation was successful.
     */
    changeItemAmount(entity, slot, amount) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return false;

        const inv = inventory.container;
        const item = inv.getItem(slot);
        if (!item) return false;

        const newAmount = item.amount + amount;

        if (newAmount > item.maxAmount || newAmount < 0) return false;

        if (newAmount === 0) {
            inv.setItem(slot, undefined); // Clears slot
        } else {
            item.amount = newAmount;
            inv.setItem(slot, item);
        }

        return true;
    },

    /**
     * Sets an item in a specific inventory slot of an entity.
     *
     * - Accepts either an ItemStack or a string with amount.
     * - Overwrites any existing item in the slot.
     *
     * @param {Entity} entity The entity with an inventory.
     * @param {number} slot The inventory slot index to set.
     * @param {ItemStack|string} item The item to place (ItemStack or item ID string).
     * @param {number} [amount=1] Amount if item is a string. Ignored for ItemStack.
     * @returns {boolean} Whether the operation was successful.
     */
    setItem(entity, slot, item, amount = 1) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return false;

        const inv = inventory.container;

        const itemStack = typeof item === 'string'
            ? new ItemStack(item, amount)
            : item;

        try {
            inv.setItem(slot, itemStack);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Returns all items in the entity's inventory container as an array.
     * 
     * - Skips empty slots.
     * - Returns an empty array if the entity has no inventory.
     *
     * @param {Entity} entity The entity to get inventory items from.
     * @returns {ItemStack[]} Array of items present in the inventory.
     */
    getItems(entity) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return [];

        const container = inventory.container;
        const items = [];

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (item) items.push(item);
        }

        return items;
    },

    /**
     * Searches for an item in the entity's inventory.
     * 
     * - If a string is provided, searches by item identifier.
     * - If an ItemStack is provided, uses container.find to locate it.
     * 
     * @param {Entity} entity The entity to search in.
     * @param {string|ItemStack} item Item identifier or ItemStack to search for.
     * @returns {{ slot: number, item: ItemStack }|undefined} Found item with slot, or undefined.
     */
    findItem(entity, item) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return;

        const container = inventory.container;

        if (typeof item === 'string') {
            for (let i = 0; i < container.size; i++) {
                const slotItem = container.getItem(i);
                if (slotItem?.typeId === item) {
                    return { slot: i, item: slotItem };
                }
            }
        } else {
            try {
                const slot = container.find(item);
                if (slot !== -1) {
                    const found = container.getItem(slot);
                    return { slot, item: found };
                }
            } catch {
                return;
            }
        }

        return;
    },

    /**
     * Drops all items from the entity's inventory at its current location,
     * excluding any item with a typeId present in the optional exclude list.
     * 
     * @param {Entity} entity The entity whose inventory items will be dropped.
     * @param {string[]} [excludeIds=[]] Optional array of item identifiers to exclude.
     */
    dropAllItems(entity, excludeIds = []) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return;

        const container = inventory.container;
        const location = entity.location;
        const dimension = entity.dimension;

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (item && !excludeIds.includes(item.typeId)) {
                dimension.spawnItem(item, location);
                container.setItem(i, undefined);
            }
        }
    },

    /**
     * Gets the item in the specified inventory slot of an entity.
     * 
     * @param {Entity} entity The entity whose inventory to access.
     * @param {number} slot The inventory slot index to read.
     * @returns {ItemStack|undefined} The item in the slot, or undefined if empty or invalid.
     */
    getItem(entity, slot) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return;

        return inventory.container.getItem(slot);
    },

    /**
     * Checks if the entity has a specific item in its inventory.
     * 
     * @param {Entity} entity The entity to check.
     * @param {string} id The item identifier to look for.
     * @param {number} [amount=1] Minimum amount required.
     * @returns {boolean} Whether the item exists in sufficient quantity.
     */
    hasItem(entity, id, amount = 1) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return false;

        const container = inventory.container;
        let total = 0;

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (item?.typeId === id) total += item.amount;
            if (total >= amount) return true;
        }

        return false;
    },

    /**
     * Clears the entity's inventory, optionally skipping certain item IDs.
     * 
     * @param {Entity} entity - The entity whose inventory will be cleared.
     * @param {string[]} [excludeIds=[]] - Item IDs to keep.
     */
    clearInventory(entity, excludeIds = []) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return;

        const container = inventory.container;

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (item && !excludeIds.includes(item.typeId)) {
                container.setItem(i, undefined);
            }
        }
    },

    /**
     * Removes a specific amount of items from the entity's inventory.
     * 
     * @param {Entity} entity - The entity to remove items from.
     * @param {string} id - The item identifier to remove.
     * @param {number} [amount=1] - The quantity to remove.
     * @returns {boolean} Whether the removal was successful.
     */
    removeItem(entity, id, amount = 1) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return false;

        const container = inventory.container;
        let remaining = amount;

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item || item.typeId !== id) continue;

            if (item.amount > remaining) {
                item.amount -= remaining;
                container.setItem(i, item);
                return true;
            } else {
                remaining -= item.amount;
                container.setItem(i, undefined);
                if (remaining === 0) return true;
            }
        }

        return false;
    },

    /**
     * Counts the total number of items with a specific identifier in the entity's inventory.
     * 
     * @param {Entity} entity The entity to search in.
     * @param {string} id The item identifier to count.
     * @returns {number} Total amount found in the inventory.
     */
    countItem(entity, id) {
        const inventory = entity.getComponent('inventory');
        if (!inventory) return 0;

        const container = inventory.container;
        let total = 0;

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (item?.typeId === id) total += item.amount;
        }

        return total;
    },

    /**
     * Returns the current health of the entity.
     * 
     * @param {Entity} entity The entity to get health from.
     * @returns {number|undefined} The current health, or undefined if not available.
     */
    getHealth(entity) {
        const health = entity.getComponent('health');
        return health?.current;
    },

    /**
     * Sets the current health of the entity.
     * 
     * @param {Entity} entity The entity to modify.
     * @param {number} value The health value to set.
     * @returns {boolean} Whether the operation was successful.
     */
    setHealth(entity, value) {
        const health = entity.getComponent('health');
        if (!health) return false;

        health.setCurrent(value);
        return true;
    },

    /**
     * Adds or subtracts health from the entity.
     * 
     * @param {Entity} entity The entity to modify.
     * @param {number} delta Positive to heal, negative to damage.
     * @returns {boolean} Whether the operation was successful.
     */
    addHealth(entity, delta) {
        const health = entity.getComponent('health');
        if (!health) return false;

        const newHealth = Math.max(0, Math.min(health.current + delta, health.max));
        health.setCurrent(newHealth);
        return true;
    },

    /**
     * Returns detailed health information of the entity.
     * 
     * @param {Entity} entity The entity to inspect.
     * @returns {{
     *   current: number,
     *   max: number,
     *   missing: number,
     *   percentage: number
     * }|undefined} Health data or undefined if not available.
     */
    getHealthInfo(entity) {
        const health = entity.getComponent('health');
        if (!health) return;

        const current = health.current;
        const max = health.max;
        const missing = max - current;
        const percentage = Math.floor((current / max) * 10000) / 100;

        return { current, max, missing, percentage };
    },

    /**
     * Returns equipped items from a specific slot or all equipment if no slot is given.
     * 
     * Works with any entity that has the "equippable" component.
     * 
     * @param {Entity} entity The entity to inspect.
     * @param {string} [slot] Optional slot to retrieve ("Mainhand", "Offhand", "Head", "Chest", "Legs", "Feet").
     * @returns {ItemStack|object|undefined} The item in the slot, or an object with all equipment.
     */
    getEquipment(entity, slot) {
        if (!entity?.getComponent) return;

        const equip = entity.getComponent('equippable');
        if (!equip) return;

        const validSlots = ['Mainhand', 'Offhand', 'Head', 'Chest', 'Legs', 'Feet'];

        if (slot) {
            if (!validSlots.includes(slot)) return;
            return equip.getEquipment(slot) ?? undefined;
        }

        const result = {};
        for (const s of validSlots) {
            result[s] = equip.getEquipment(s) ?? undefined;
        }
        return result;
    },

    /**
     * Sets an item in a specific equipment slot of an entity.
     * 
     * @param {Entity} entity The entity to equip.
     * @param {string} slot Slot name to set ("Mainhand", "Offhand", "Head", "Chest", "Legs", "Feet").
     * @param {ItemStack} item The item to equip.
     * @returns {boolean} Whether the operation was successful.
     */
    setEquipment(entity, slot, item) {
        if (!entity?.getComponent || !item) return false;

        const equip = entity.getComponent('equippable');
        if (!equip) return false;

        const validSlots = ['Mainhand', 'Offhand', 'Head', 'Chest', 'Legs', 'Feet'];
        if (!validSlots.includes(slot)) return false;

        try {
            equip.setEquipment(slot, item);
            return true;
        } catch {
            return false;
        }
    },
    /*
     * Finds the first empty slot in an entity's inventory.
     *
     * @param {Entity} entity
     * @returns {number} The index of the first empty slot, or -1 if none.
     */
    findFirstEmptySlot(entity) {
        const invComp = entity.getComponent("minecraft:inventory");
        if (!invComp) return -1;

        const container = invComp.container;
        for (let i = 0; i < container.size; i++) {
            if (!container.getItem(i)) return i;
        }
        return -1;
    },
    /**
     * Finds the first empty slot in an entity's inventory and inserts the given item.
     *
     * @param {Entity} entity - The entity whose inventory will be modified.
     * @param {ItemStack} itemStack - The item to insert.
     * @returns {number} The slot index where the item was inserted, or -1 if none found.
     */
    setInFirstEmptySlot(entity, itemStack) {
        const invComp = entity.getComponent("minecraft:inventory");
        if (!invComp) return -1;

        const container = invComp.container;

        for (let i = 0; i < container.size; i++) {
            if (!container.getItem(i)) {
                container.setItem(i, itemStack);
                return i;
            }
        }

        return -1;
    },
    /**
     * Checks if an entity's inventory is completely full.
     *
     * @param {Entity} entity - The entity to check.
     * @returns {boolean} True if the inventory has no empty slots, false otherwise.
     */
    isInventoryFull(entity) {
        const invComp = entity.getComponent("minecraft:inventory");
        if (!invComp) return false;

        const container = invComp.container;
        return container.emptySlotsCount === 0;
    },

    /**
     * Repairs the item and returns it.
     * @param {ItemStack} item The item to repair.
     * @param {number} amount Amount of durability to restore.
     * @param {Entity} [entity] Optional entity to update item in.
     * @param {number} [slot] Optional slot to apply item into.
     * @returns {ItemStack|null}
     */
    repairItemInSlot(entity, item, amount, slot) {
        const durability = item?.getComponent("minecraft:durability");
        if (!durability) return null;

        durability.damage = Math.max(durability.damage - amount, 0);

        if (entity && typeof slot === "number") {
            const container = entity.getComponent("minecraft:inventory")?.container;
            container?.setItem(slot, item);
        }

        return item;
    },

    /**
     * Damages the item and returns it.
     * @param {ItemStack} item The item to damage.
     * @param {number} amount Amount of durability to subtract.
     * @param {Entity} [entity] Optional entity to update item in.
     * @param {number} [slot] Optional slot to apply item into.
     * @returns {ItemStack|null}
     */
    damageItemInSlot(entity, item, amount, slot) {
        const durability = item?.getComponent("minecraft:durability");
        if (!durability) return null;

        durability.damage = Math.min(durability.damage + amount, durability.maxDurability);

        if (entity && typeof slot === "number") {
            const container = entity.getComponent("minecraft:inventory")?.container;
            container?.setItem(slot, item);
        }

        return item;
    }


};

/**
 * Utility functions related to blocks for Dorios API.
 *
 * Includes block state access, block permutation manipulation, and directional block logic.
 */
export const blocks = {
    /**
     * Gets the value of a given state from a block's permutation.
     * 
     * @param {Block} block The block to read the state from.
     * @param {string} state The name of the state to get.
     * @returns {*} The value of the state, or undefined if block is null.
     */
    getState(block, state) {
        return block?.permutation.getState(state);
    },

    /**
     * Sets a given state on a block's permutation.
     * 
     * @param {Block} block The block to set the state on.
     * @param {string} state The name of the state to set.
     * @param {*} value The value to assign to the state.
     * @returns {boolean} True if the state was successfully set, false otherwise.
     */
    setState(block, state, value) {
        if (!block || !block.permutation) return false;

        try {
            block.setPermutation(block.permutation.withState(state, value));
            return true;
        } catch (e) {
            return false;
        }
    },
    /**
     * Returns the block in the direction the given block is facing.
     * 
     * @param {Block} block The block to check from.
     * @returns {Block | null} The facing block, or null if facing direction is invalid.
     */
    getFacingBlock(block) {
        const facingOffsets = {
            up: [0, 1, 0],
            down: [0, -1, 0],
            north: [0, 0, -1],
            south: [0, 0, 1],
            west: [-1, 0, 0],
            east: [1, 0, 0]
        };

        const facing = block.permutation.getState('minecraft:facing_direction');
        const offset = facingOffsets[facing];

        if (!offset) return null;

        const { x, y, z } = block.location;
        const targetLocation = {
            x: x + offset[0],
            y: y + offset[1],
            z: z + offset[2]
        };

        return block.dimension.getBlock(targetLocation);
    },
    /**
     * Returns an array of blocks adjacent to the given block (6 directions).
     *
     * @param {Block} block The reference block.
     * @returns {Block[]} Array of neighboring blocks.
     */
    getAdjacentBlocks(block) {
        const { x, y, z } = block.location;
        const dim = block.dimension;

        return [
            dim.getBlock({ x: x + 1, y, z }),
            dim.getBlock({ x: x - 1, y, z }),
            dim.getBlock({ x, y: y + 1, z }),
            dim.getBlock({ x, y: y - 1, z }),
            dim.getBlock({ x, y, z: z + 1 }),
            dim.getBlock({ x, y, z: z - 1 })
        ];
    },
}

/**
 * Utility functions related to items for Dorios API.
 *
 * Handles durability, enchantments, metadata (like lore), and comparisons between ItemStacks.
 */
export const items = {
    /**
     * Repairs the item by decreasing its damage value.
     * Returns the modified item.
     * @param {ItemStack} item - The item to repair.
     * @param {number} amount - Amount of durability to restore.
     * @returns {ItemStack|null}
     */
    repair(item, amount) {
        const durability = item?.getComponent("minecraft:durability");
        if (!durability) return null;

        durability.damage = Math.max(durability.damage - amount, 0);
        return item;
    },
    /**
     * Returns durability left as a percentage (0–100).
     * @param {ItemStack} item - The item to check.
     * @returns {number|null}
     */
    getDurabilityPercentage(item) {
        const remaining = this.getRemainingDurability(item);
        const max = getMaxDurability(item);
        if (remaining === null || max === null) return null;

        return Math.floor((remaining / max) * 100);
    },
    /**
     * Returns how much durability the item has left (max - damage).
     * @param {ItemStack} item - The item to check.
     * @returns {number|null}
     */
    getRemainingDurability(item) {
        const max = this.getMaxDurability(item);
        const damage = this.getDamage(item);
        if (max === null || damage === null) return null;

        return max - damage;
    },
    /**
     * Returns a list of all enchantments on an item with their levels.
     *
     * @param {ItemStack} item - The item to inspect.
     * @returns {Array<{ id: string, level: number }>} Array of enchantment data.
     */
    getEnchantments(item) {
        const enchantments = item?.getComponent("minecraft:enchantable")?.getEnchantments();
        if (!enchantments) return [];

        const result = [];
        for (const enchant of enchantments) {
            result.push({
                id: enchant.type.id,
                level: enchant.level
            });
        }

        return result;
    },
    /**
     * Checks if an item has any enchantments.
     * @param {ItemStack} item - The item to check.
     * @returns {boolean} True if enchanted, false otherwise.
     */
    isEnchanted(item) {
        const enchantments = item?.getComponent("minecraft:enchantable")?.getEnchantments();
        return enchantments?.length > 0;
    },
    /**
     * Returns the max durability of the item.
     * @param {ItemStack} item - The item to check.
     * @returns {number|null}
     */
    getMaxDurability(item) {
        return item?.getComponent("minecraft:durability")?.maxDurability ?? null;
    },
    /**
     * Returns the current damage value of the item.
     * @param {ItemStack} item - The item to check.
     * @returns {number|null}
     */
    getDamage(item) {
        return item?.getComponent("minecraft:durability")?.damage ?? null;
    },
    /**
     * Compares two ItemStacks for type, damage, enchantments, and lore.
     *
     * @param {ItemStack} a First item to compare.
     * @param {ItemStack} b Second item to compare.
     * @returns {boolean} True if the items are identical in type, damage, enchantments, and lore.
     */
    compareItems(a, b) {
        if (!a || !b) return false;
        if (a.typeId !== b.typeId) return false;

        const aDur = a.getComponent("minecraft:durability");
        const bDur = b.getComponent("minecraft:durability");
        if (aDur?.damage !== bDur?.damage) return false;

        const aEnchant = a.getComponent("minecraft:enchantable")?.getEnchantments() || [];
        const bEnchant = b.getComponent("minecraft:enchantable")?.getEnchantments() || [];
        if (aEnchant.length !== bEnchant.length) return false;
        for (let i = 0; i < aEnchant.length; i++) {
            if (aEnchant[i].type.id !== bEnchant[i].type.id || aEnchant[i].level !== bEnchant[i].level) return false;
        }

        const aLore = a.getLore() || [];
        const bLore = b.getLore() || [];
        if (aLore.length !== bLore.length) return false;
        for (let i = 0; i < aLore.length; i++) {
            if (aLore[i] !== bLore[i]) return false;
        }

        return true;
    },

}

/**
 * Utility functions related to containers for Dorios API.
 *
 * Designed to manipulate both block and entity containers, supporting operations such as
 * adding, removing, merging, and transferring items across inventories.
 */
export const containers = {
    /**
 * Prints all slots of a container with their item IDs.
 * Format: slotNumber: itemId
 * 
 * @param {Container} container - The container to inspect.
 */
    printSlots(container) {
        if (!container) {
            console.warn("No container provided.");
            return;
        }

        const size = container.size;
        for (let i = 0; i < size; i++) {
            const item = container.getItem(i);
            const id = item ? item.typeId : "empty";
            console.warn(`${i}: ${id}`);
        }
    },
    /**
     * Adds an item to the  inventory.
     *
     * @param {Container} inv The inventory container (e.g., block or entity inventory).
     * @param {ItemStack|string} item The item to add. Can be an ItemStack or an item identifier string.
     * @param {number} [amount=1] Amount of the item if a string is provided. Ignored if item is an ItemStack.
     */
    addItem(inv, item, amount = 1) {
        if (!inv) return;

        const itemStack = typeof item === 'string'
            ? new ItemStack(item, amount)
            : item;
        inv.addItem(itemStack);

    },
    /**
     * Checks if an inventory is completely full.
     *
     * @param {Container} inv The inventory container (e.g., block or entity inventory).
     * @returns {boolean} True if the inventory has no empty slots, false otherwise.
     */
    isInventoryFull(inv) {
        if (!inv) return false;

        const container = inv.container;
        return container.emptySlotsCount === 0;
    },
    /**
     * Calculates how many items of a given type can be inserted into a specific inventory slot.
     *
     * @param {Container} inv The inventory container (e.g., block or entity inventory).
     * @param {number} slot The slot index to check.
     * @param {string} typeId The type ID of the item to insert (e.g., "minecraft:iron_ingot").
     * @returns {number} The number of items that can be inserted into the slot.
     *                     Returns the full max stack size if the slot is empty.
     *                     Returns 0 if the slot is incompatible or full.
     */
    getInsertableAmount(inv, slot, typeId) {
        const item = inv.getItem(slot);

        // If the slot is empty, return the max stack size for that item
        if (!item) {
            const tempItem = new ItemStack(typeId, 1); // Temporary stack to read maxAmount
            return tempItem.maxAmount;
        }

        // If the item matches and is stackable, return remaining space
        if (item.typeId === typeId && item.maxAmount > 1) {
            return item.maxAmount - item.amount;
        }

        // Slot is either occupied by a different item or not stackable
        return 0;
    },
    /**
     * Drops all items from the given inventory at the specified location.
     * 
     * @param {Container} inventory The inventory container (e.g. from entity or block).
     * @param {Dimension} dimension The dimension to drop items in.
     * @param {Vector3} location The location to drop the items at.
     */
    dropAllItems(inventory, dimension, location) {
        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (item) {
                dimension.spawnItem(item, location);
                inventory.setItem(i, undefined);
            }
        }
    },
    /**
     * Attempts to pull matching items from a given container block.
     * - Only works if the block above is a vanilla container.
     * - Transfers items to a specific slot (e.g., slot 5) in the given inventory.
     * - If the slot is empty, it moves the first available item.
     * - If the slot already contains an item, it tries to merge similar items until full.
     *
     * @param {Container} inv The receiving inventory container.
     * @param {Block} inputBlock The block expected to be a vanilla container.
     * @param {number} targetSlot The slot index where items should be inserted.
     */
    pullItemsFromBlock(inv, inputBlock, targetSlot) {
        if (!inputBlock) return;

        const inputContainer = inputBlock.getComponent('minecraft:inventory')?.container;
        if (!inputContainer) return;

        const itemInSlot = inv.getItem(targetSlot);

        for (let i = 0; i < inputContainer.size; i++) {
            let inputItem = inputContainer.getItem(i);
            if (!inputItem) continue;

            // If the slot has an item and it's different, skip
            if (itemInSlot && inputItem.typeId !== itemInSlot.typeId) continue;

            // If the slot is empty, move the item entirely
            if (!itemInSlot) {
                inputContainer.moveItem(i, targetSlot, inv);
                break;
            }

            // Merge stacks
            const transferableAmount = Math.min(inputItem.amount, 64 - itemInSlot.amount);
            if (inputItem.amount > transferableAmount) {
                inputItem.amount -= transferableAmount;
            } else {
                inputItem = undefined;
            }

            itemInSlot.amount += transferableAmount;

            inputContainer.setItem(i, inputItem);
            inv.setItem(targetSlot, itemInSlot);
            break;
        }
    },
    /**
     * Changes the amount of items in a specific inventory slot.
     *
     * - Positive `amount` adds items.
     * - Negative `amount` removes items.
     * - Fails if slot is empty, overflows the stack, or underflows below 0.
     *
     * @param {Inventory} inv The entity with the inventory.
     * @param {number} slot The inventory slot index to modify.
     * @param {number} amount The amount to add (positive) or remove (negative).
     * @returns {boolean} Whether the operation was successful.
     */
    changeItemAmount(inv, slot, amount) {
        if (!inv) return false;

        const item = inv.getItem(slot);
        if (!item) return false;

        const maxAmount = item.maxAmount;
        const newAmount = item.amount + amount;

        // Overflow or underflow check
        if (newAmount > maxAmount || newAmount < 0) return false;

        if (newAmount === 0) {
            inv.setItem(slot, undefined); // Clears the slot
        } else {
            item.amount = newAmount;
            inv.setItem(slot, item);
        }

        return true;
    }
}

/**
 * Utility functions related to the dimension or the world for Dorios API.
 *
 * Includes block type checking and operations that depend on dimension context.
 */
export const dimension = {
    /**
     * Checks if the block at the given location matches the specified typeId.
     * 
     * @param {Dimension} dimension The dimension to check in.
     * @param {Vector3} location The location of the block.
     * @param {string} typeId The block typeId to test against (e.g., 'minecraft:stone').
     * @returns {boolean} True if the block matches the typeId, false otherwise.
     */
    isBlockType(dimension, location, typeId) {
        try {
            const block = dimension.getBlock(location);
            return block?.typeId === typeId;
        } catch {
            return false;
        }
    }
}

/**
 * Utility math-related functions for Dorios API.
 *
 * Includes scaling, Roman numeral conversion, distance calculation,
 * clamping, and directional vector handling.
 */
export const math = {
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
    }
}

/**
 * Registration utilities for Dorios API.
 *
 * Includes legacy registration helpers for custom block and item components.
 * These methods are deprecated in 2.0.0 and should be replaced with newer systems.
 */
export const register = {
    /**
        * Deprecated in 2.0.0
        * Registers a custom block component with given event handlers.
        * This function subscribes to the world initialization event
        * and registers the component in the block component registry.
        * 
        * @param {string} typeId The custom component's type identifier, e.g., 'utilitycraft:crusher'.
        * @param {Object} handlers An object containing event handler functions for the component.
        *                            Supported handlers: beforeOnPlayerPlace, onTick, onPlayerDestroy, etc.
        * 
        * @example
        * blockComponent('utilitycraft:crusher', {
        *   beforeOnPlayerPlace(e) { /* ... * / },
        *   onTick(e) { /* ... * / },
        *   onPlayerDestroy(e) { /* ... * / }
        * });
        */
    OldBlockComponent(typeId, handlers) {
        world.beforeEvents.worldInitialize.subscribe(eventData => {
            eventData.blockComponentRegistry.registerCustomComponent(typeId, handlers);
        });
    },

    /**
     * Deprecated in 2.0.0
     * Registers a custom item component with given event handlers.
     *
     * @param {string} typeId The unique identifier for the item component (e.g., "your_namespace:your_component").
     * @param {Object} handlers An object containing one or more methods like `onUse`, `onEquip`, `onHold`, etc.
     * 
     * @example
     * registerItemComponent("myaddon:cool_tool", {
     *   onUse(e) {
     *     const player = e.source;
     *     player.runCommandAsync("say Used the cool tool!");
     *   }
     * });
     */
    OldItemComponent(typeId, handlers) {
        world.beforeEvents.worldInitialize.subscribe(eventData => {
            eventData.itemComponentRegistry.registerCustomComponent(typeId, handlers);
        });
    },

    /**
     * Registers a custom item component.
     *
     * Should be called before the world starts (use in system.beforeEvents.startup).
     *
     * @param {string} identifier The identifier of the custom component (e.g. 'dorios:sword').
     * @param {Object} handlers An object containing handler functions (e.g. onUse, onHitEntity, etc.).
     */
    ItemComponent(identifier, handlers) {
        system.beforeEvents.startup.subscribe(e => {
            e.itemComponentRegistry.registerCustomComponent(identifier, handlers);
        });
    }

}

/**
 * General-purpose utility functions for Dorios API.
 *
 * Covers string formatting, delays, messaging, identifier parsing,
 * randomization, and block/item classification logic.
 */
export const utils = {
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
        player.onScreenDisplay.setActionBar(msg);
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
    },
}