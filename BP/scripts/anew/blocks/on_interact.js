import { world, ItemStack, Block, Player } from '@minecraft/server'

/**
 * List of interactable block IDs mapped to custom behavior.
 * Each entry has a `handler` that will run when the player interacts.
 *
 * @type {Record<string, Function>}
 */
const interactHandlers = {
    /**
     * Drill Placer interaction handler.
     * - Replaces the placer block with air.
     * - Spawns a `utilitycraft:drill` entity at the same position.
     * - Plays an anvil landing sound for feedback.
     *
     * @param {Block} block The interacted block
     * @param {Player} player The player who interacted
     */
    'utilitycraft:drill_placer': (block, player) => {
        const { x, y, z } = block.location
        block.dimension.setBlockType({ x, y, z }, 'air')
        block.dimension.spawnEntity('utilitycraft:drill', { x, y, z })
        player.playSound('random.anvil_land')
    },

    /**
     * Tractor Placer interaction handler.
     * - Replaces the placer block with air.
     * - Spawns a `utilitycraft:tractor` entity at the same position.
     * - Plays an anvil landing sound for feedback.
     *
     * @param {Block} block The interacted block
     * @param {Player} player The player who interacted
     */
    'utilitycraft:tractor_placer': (block, player) => {
        const { x, y, z } = block.location
        block.dimension.setBlockType({ x, y, z }, 'air')
        block.dimension.spawnEntity('utilitycraft:tractor', { x, y, z })
        player.playSound('random.anvil_land')
    },

    /**
     * Sink interaction handler.
     * - If holding an empty bucket → gives the player a water bucket.
     * - If holding a water bucket → replaces it with an empty bucket.
     * - Plays cauldron sounds depending on the action.
     *
     * @param {Block} block The interacted block
     * @param {Player} player The player who interacted
     */
    'utilitycraft:sink': (block, player) => {
        const equipment = player.getComponent('equippable')
        const heldItem = equipment.getEquipment('Mainhand')

        if (!heldItem) return

        if (heldItem.typeId === 'minecraft:bucket') {
            player.dimension.spawnItem(new ItemStack('minecraft:water_bucket', 1), player.location)
            player.runCommand('clear @s bucket 0 1')
            player.playSound('cauldron.fillwater')
        } else if (heldItem.typeId === 'minecraft:water_bucket') {
            equipment.setEquipment('Mainhand', new ItemStack('minecraft:bucket', 1))
            player.playSound('cauldron.takewater')
        }
    },

    /**
     * Pedestal interaction handler.
     * - If pedestal has an item → removes the accelerator clock and spawns it as an item.
     * - If pedestal is empty and player holds an accelerator clock → places it on the pedestal.
     * - Uses a custom block state `utilitycraft:hasItem` to track pedestal contents.
     *
     * @param {Block} block The interacted block
     * @param {Player} player The player who interacted
     */
    'utilitycraft:pedestal': (block, player) => {
        let { x, y, z } = block.location
        y += 1.2
        x += 0.5
        z += 0.5

        const state = block.permutation.getState('utilitycraft:hasItem')
        const dimension = block.dimension
        const invSlot = player.getComponent('equippable').getEquipment('Mainhand')

        // Remove item from pedestal
        if (state === 1) {
            const clockEntity = dimension.getEntities({
                type: 'utilitycraft:accelerator_clock',
                maxDistance: 1,
                location: { x, y, z }
            })[0]

            if (clockEntity) clockEntity.addTag('despawn')

            dimension.spawnItem(new ItemStack('utilitycraft:accelerator_clock', 1), { x, y, z })
            block.setPermutation(block.permutation.withState('utilitycraft:hasItem', 0))
        }

        // Add item to pedestal
        if (invSlot && state === 0) {
            if (invSlot.typeId === 'utilitycraft:accelerator_clock') {
                const existsNearby = dimension.getEntities({
                    type: 'utilitycraft:accelerator_clock',
                    maxDistance: 5,
                    location: { x, y, z }
                })[0]

                if (existsNearby) return

                dimension.spawnEntity('utilitycraft:accelerator_clock', { x, y, z })
                player.runCommandAsync('clear @s utilitycraft:accelerator_clock 0 1')
                block.setPermutation(block.permutation.withState('utilitycraft:hasItem', 1))
            }
        }
    }
}

world.afterEvents.playerInteractWithBlock.subscribe(({ block, player }) => {
    const handler = interactHandlers[block.typeId]
    if (handler) {
        handler(block, player)
    }
})
