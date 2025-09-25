import { ItemStack, Player } from '@minecraft/server'


/**
 * Extend Player prototype with custom methods.
 * New methods are grouped in DoriosAPI.player namespace,
 * then attached to Player.prototype for direct usage.
 */
const playerExtensions = {
    /**
     * Gives an item to the player.
     * - If inventory is full → spawns the item above the block.
     * - Else → adds the item directly to the player.
     * 
     * @param {string} itemId The item identifier (e.g. "minecraft:lava_bucket").
     */
    giveItem(itemId) {
        const { x, y, z } = this.location
        const pos = { x: x + 0.5, y: y + 1, z: z + 0.5 }

        const container = this.getComponent('inventory').container
        if (container.emptySlotsCount === 0) {
            this.dimension.spawnItem(new ItemStack(itemId, 1), pos)
        } else {
            container.addItem(new ItemStack(itemId, 1))
        }
    },

    /**
     * Checks if the player is currently in Creative mode.
     * 
     * @returns {boolean} true if the player is in Creative, false otherwise.
     */
    isInCreative() {
        return this.getGameMode().toLowerCase() === "creative";
    },

    /**
     * Checks if the player is currently in Survival mode.
     * 
     * @returns {boolean} true if the player is in Survival, false otherwise.
     */
    isInSurvival() {
        return this.getGameMode().toLowerCase() === "survival";
    }
}

// Attach all extensions to Player.prototype
Object.entries(playerExtensions).forEach(([name, fn]) => {
    if (!Player.prototype[name]) {
        Player.prototype[name] = fn
    }
})
