import { world, ItemStack } from '@minecraft/server'

const blocks = {
    // ========== COBBLESTONE ==========
    "minecraft:cobblestone": { output: "minecraft:gravel", amount: 1, tier: 1 },
    "twm:compressed_cobblestone": { output: "twm:compressed_gravel", amount: 1, tier: 2 },
    "twm:double_compressed_cobblestone": { output: "twm:compressed_gravel_2", amount: 1, tier: 3 },
    "twm:triple_compressed_cobblestone": { output: "twm:compressed_gravel_3", amount: 1, tier: 4 },
    "twm:quadruple_compressed_cobblestone": { output: "twm:compressed_gravel_4", amount: 1, tier: 5 },

    // ========== GRAVEL ==========
    "minecraft:gravel": { output: "minecraft:dirt", amount: 1, tier: 1 },
    "twm:compressed_gravel": { output: "twm:compressed_dirt", amount: 1, tier: 2 },
    "twm:compressed_gravel_2": { output: "twm:compressed_dirt_2", amount: 1, tier: 3 },
    "twm:compressed_gravel_3": { output: "twm:compressed_dirt_3", amount: 1, tier: 4 },
    "twm:compressed_gravel_4": { output: "twm:compressed_dirt_4", amount: 1, tier: 5 },

    // ========== DIRT ==========
    "minecraft:dirt": { output: "minecraft:sand", amount: 1, tier: 1 },
    "twm:compressed_dirt": { output: "twm:compressed_sand", amount: 1, tier: 2 },
    "twm:compressed_dirt_2": { output: "twm:compressed_sand_2", amount: 1, tier: 3 },
    "twm:compressed_dirt_3": { output: "twm:compressed_sand_3", amount: 1, tier: 4 },
    "twm:compressed_dirt_4": { output: "twm:compressed_sand_4", amount: 1, tier: 5 },

    // ========== NETHERRACK ==========
    "minecraft:netherrack": { output: "twm:crushed_netherrack", amount: 1, tier: 1 },
    "twm:compressed_netherrack": { output: "twm:compressed_crushed_netherrack", amount: 1, tier: 2 },
    "twm:compressed_netherrack_2": { output: "twm:compressed_crushed_netherrack_2", amount: 1, tier: 3 },
    "twm:compressed_netherrack_3": { output: "twm:compressed_crushed_netherrack_3", amount: 1, tier: 4 },
    "twm:compressed_netherrack_4": { output: "twm:compressed_crushed_netherrack_4", amount: 1, tier: 5 },

    // ========== END STONE ==========
    "minecraft:end_stone": { output: "twm:crushed_endstone", amount: 1, tier: 1 },
    "twm:compressed_endstone": { output: "twm:compressed_crushed_endstone", amount: 1, tier: 2 },
    "twm:compressed_endstone_2": { output: "twm:compressed_crushed_endstone_2", amount: 1, tier: 3 },
    "twm:compressed_endstone_3": { output: "twm:compressed_crushed_endstone_3", amount: 1, tier: 4 },
    "twm:compressed_endstone_4": { output: "twm:compressed_crushed_endstone_4", amount: 1, tier: 5 },

    // ========== COBBLED DEEPSLATE ==========
    "minecraft:cobbled_deepslate": { output: "twm:crushed_cobbled_deepslate", amount: 1, tier: 1 },
    "twm:compressed_cobbled_deepslate": { output: "twm:compressed_crushed_cobbled_deepslate", amount: 1, tier: 2 },
    "twm:compressed_cobbled_deepslate_2": { output: "twm:compressed_crushed_cobbled_deepslate_2", amount: 1, tier: 3 },
    "twm:compressed_cobbled_deepslate_3": { output: "twm:compressed_crushed_cobbled_deepslate_3", amount: 1, tier: 4 },
    "twm:compressed_cobbled_deepslate_4": { output: "twm:compressed_crushed_cobbled_deepslate_4", amount: 1, tier: 5 },

    // ========== DEEPSLATE ==========
    "minecraft:deepslate": { output: "minecraft:cobbled_deepslate", amount: 1, tier: 1 },
    "twm:compressed_deepslate": { output: "twm:compressed_cobbled_deepslate", amount: 1, tier: 2 },
    "twm:compressed_deepslate_2": { output: "twm:compressed_cobbled_deepslate_2", amount: 1, tier: 3 },
    "twm:compressed_deepslate_3": { output: "twm:compressed_cobbled_deepslate_3", amount: 1, tier: 4 },
    "twm:compressed_deepslate_4": { output: "twm:compressed_cobbled_deepslate_4", amount: 1, tier: 5 }
};

const toolTiers = {
    "twm:wooden_hammer": 1,
    "twm:stone_hammer": 2,
    "twm:iron_hammer": 3,
    "twm:diamond_hammer": 4,
    "twm:netherite_hammer": 5
};

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('twm:hammer', {
        onMineBlock(e) {
            const { block, minedBlockPermutation, itemStack } = e

            let { x, y, z } = block.location
            x += 0.5, z += 0.5, y += 0.2

            const minedBlock = blocks[minedBlockPermutation.type.id]
            if (!minedBlock) return

            if (toolTiers[itemStack.typeId] < minedBlock.tier) return

            const closest = block.dimension.getEntities({ type: 'item', maxDistance: 3, location: { x, y, z } }).filter(item =>
                item?.getComponent('minecraft:item').itemStack.typeId == minedBlockPermutation.type.id
            )[0]

            if (!closest) return
            closest.kill()
            block.dimension.spawnItem(new ItemStack(`${minedBlock.output}`, minedBlock.amount), { x, y, z })
        }
    })
})