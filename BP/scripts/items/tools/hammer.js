import { world, ItemStack } from '@minecraft/server'

const blocks = {
    // ========== COBBLESTONE ==========
    "minecraft:cobblestone": { output: "minecraft:gravel", amount: 1, tier: 1 },
    "utilitycraft:compressed_cobblestone": { output: "utilitycraft:compressed_gravel", amount: 1, tier: 2 },
    "utilitycraft:double_compressed_cobblestone": { output: "utilitycraft:compressed_gravel_2", amount: 1, tier: 3 },
    "utilitycraft:triple_compressed_cobblestone": { output: "utilitycraft:compressed_gravel_3", amount: 1, tier: 4 },
    "utilitycraft:quadruple_compressed_cobblestone": { output: "utilitycraft:compressed_gravel_4", amount: 1, tier: 5 },

    // ========== GRAVEL ==========
    "minecraft:gravel": { output: "minecraft:dirt", amount: 1, tier: 1 },
    "utilitycraft:compressed_gravel": { output: "utilitycraft:compressed_dirt", amount: 1, tier: 2 },
    "utilitycraft:compressed_gravel_2": { output: "utilitycraft:compressed_dirt_2", amount: 1, tier: 3 },
    "utilitycraft:compressed_gravel_3": { output: "utilitycraft:compressed_dirt_3", amount: 1, tier: 4 },
    "utilitycraft:compressed_gravel_4": { output: "utilitycraft:compressed_dirt_4", amount: 1, tier: 5 },

    // ========== DIRT ==========
    "minecraft:dirt": { output: "minecraft:sand", amount: 1, tier: 1 },
    "utilitycraft:compressed_dirt": { output: "utilitycraft:compressed_sand", amount: 1, tier: 2 },
    "utilitycraft:compressed_dirt_2": { output: "utilitycraft:compressed_sand_2", amount: 1, tier: 3 },
    "utilitycraft:compressed_dirt_3": { output: "utilitycraft:compressed_sand_3", amount: 1, tier: 4 },
    "utilitycraft:compressed_dirt_4": { output: "utilitycraft:compressed_sand_4", amount: 1, tier: 5 },

    // ========== NETHERRACK ==========
    "minecraft:netherrack": { output: "utilitycraft:crushed_netherrack", amount: 1, tier: 1 },
    "utilitycraft:compressed_netherrack": { output: "utilitycraft:compressed_crushed_netherrack", amount: 1, tier: 2 },
    "utilitycraft:compressed_netherrack_2": { output: "utilitycraft:compressed_crushed_netherrack_2", amount: 1, tier: 3 },
    "utilitycraft:compressed_netherrack_3": { output: "utilitycraft:compressed_crushed_netherrack_3", amount: 1, tier: 4 },
    "utilitycraft:compressed_netherrack_4": { output: "utilitycraft:compressed_crushed_netherrack_4", amount: 1, tier: 5 },

    // ========== END STONE ==========
    "minecraft:end_stone": { output: "utilitycraft:crushed_endstone", amount: 1, tier: 1 },
    "utilitycraft:compressed_endstone": { output: "utilitycraft:compressed_crushed_endstone", amount: 1, tier: 2 },
    "utilitycraft:compressed_endstone_2": { output: "utilitycraft:compressed_crushed_endstone_2", amount: 1, tier: 3 },
    "utilitycraft:compressed_endstone_3": { output: "utilitycraft:compressed_crushed_endstone_3", amount: 1, tier: 4 },
    "utilitycraft:compressed_endstone_4": { output: "utilitycraft:compressed_crushed_endstone_4", amount: 1, tier: 5 },

    // ========== COBBLED DEEPSLATE ==========
    "minecraft:cobbled_deepslate": { output: "utilitycraft:crushed_cobbled_deepslate", amount: 1, tier: 1 },
    "utilitycraft:compressed_cobbled_deepslate": { output: "utilitycraft:compressed_crushed_cobbled_deepslate", amount: 1, tier: 2 },
    "utilitycraft:compressed_cobbled_deepslate_2": { output: "utilitycraft:compressed_crushed_cobbled_deepslate_2", amount: 1, tier: 3 },
    "utilitycraft:compressed_cobbled_deepslate_3": { output: "utilitycraft:compressed_crushed_cobbled_deepslate_3", amount: 1, tier: 4 },
    "utilitycraft:compressed_cobbled_deepslate_4": { output: "utilitycraft:compressed_crushed_cobbled_deepslate_4", amount: 1, tier: 5 },

    // ========== DEEPSLATE ==========
    "minecraft:deepslate": { output: "minecraft:cobbled_deepslate", amount: 1, tier: 1 },
    "utilitycraft:compressed_deepslate": { output: "utilitycraft:compressed_cobbled_deepslate", amount: 1, tier: 2 },
    "utilitycraft:compressed_deepslate_2": { output: "utilitycraft:compressed_cobbled_deepslate_2", amount: 1, tier: 3 },
    "utilitycraft:compressed_deepslate_3": { output: "utilitycraft:compressed_cobbled_deepslate_3", amount: 1, tier: 4 },
    "utilitycraft:compressed_deepslate_4": { output: "utilitycraft:compressed_cobbled_deepslate_4", amount: 1, tier: 5 }
};

const toolTiers = {
    "utilitycraft:wooden_hammer": 1,
    "utilitycraft:stone_hammer": 2,
    "utilitycraft:iron_hammer": 3,
    "utilitycraft:diamond_hammer": 4,
    "utilitycraft:netherite_hammer": 5
};

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('utilitycraft:hammer', {
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