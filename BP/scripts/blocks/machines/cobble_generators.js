import { world, ItemStack } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:cobble_generators', {
        onTick(e) {
            const { block, dimension } = e
            let { x, y, z } = block.location

            const facing = block.permutation.getState('minecraft:facing_direction');
            const facingOffsets = {
                up: [0, -1, 0], down: [0, 1, 0],
                north: [0, 0, 1], south: [0, 0, -1],
                west: [1, 0, 0], east: [-1, 0, 0]
            };

            if (facingOffsets[facing]) {
                [x, y, z] = [x + facingOffsets[facing][0], y + facingOffsets[facing][1], z + facingOffsets[facing][2]];
            }

            const e0 = block.permutation.getState('twm:e0');
            const e1 = block.permutation.getState('twm:e1');
            const quantity = (e1 * 10) + e0

            const nextBlock = block.dimension.getBlock({ x, y, z })
            const targetEnt = dimension.getEntitiesAtBlockLocation(nextBlock.location)[0]

            if (targetEnt) {
                // Simple Input: 1 Slot
                if (targetEnt.getComponent("minecraft:type_family")?.hasTypeFamily("dorios:simple_input")) {
                    const entityInv = targetEnt.getComponent('minecraft:inventory').container
                    const slotItem = entityInv.getItem(3);
                    if (slotItem && (slotItem.typeId != 'minecraft:cobblestone' || slotItem.amount > 63)) return;
                    entityInv.addItem(new ItemStack('cobblestone', (1 + quantity)))
                }
                // Drawer
                if (nextBlock.typeId.includes('dustveyn:storage_drawers')) {
                    if (!targetEnt.hasTag(`minecraft:cobblestone`)) return
                    const targetId = targetEnt.scoreboardIdentity
                    let capacity = world.scoreboard.getObjective("capacity").getScore(targetId)
                    let max_capacity = world.scoreboard.getObjective("max_capacity").getScore(targetId)
                    if (capacity < max_capacity) {
                        let amount = Math.min(1 + quantity, max_capacity - capacity)
                        targetEnt.runCommandAsync(`scoreboard players add @s capacity ${amount}`);
                    }
                }
                block.setPermutation(block.permutation.withState('twm:e0', 0))
                block.setPermutation(block.permutation.withState('twm:e1', 0))
                return
            }

            const chestInv = nextBlock.getComponent('minecraft:inventory')?.container
            if (chestInv) {
                chestInv.addItem(new ItemStack('cobblestone', (1 + quantity)))
                block.setPermutation(block.permutation.withState('twm:e0', 0))
                block.setPermutation(block.permutation.withState('twm:e1', 0))
                return
            }

            if (quantity < 64) {
                block.setPermutation(
                    block.permutation
                        .withState('twm:e0', e0 < 10 ? e0 + 1 : 0)
                        .withState('twm:e1', e0 < 10 ? e1 : e1 + 1)
                );
            }
        },
        onPlayerInteract(e) {
            const { block, player } = e;
            const e0 = block.permutation.getState('twm:e0');
            const e1 = block.permutation.getState('twm:e1');
            const quantity = (e1 * 10) + e0;
            if (quantity > 0 && !player.getComponent('equippable')?.getEquipment('Mainhand')) {
                player.getComponent('minecraft:inventory').container.addItem(new ItemStack('cobblestone', quantity));
                block.setPermutation(block.permutation.withState('twm:e0', 0).withState('twm:e1', 0));
            }
        }
    })
})