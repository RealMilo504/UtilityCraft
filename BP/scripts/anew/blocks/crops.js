import { ItemStack } from "@minecraft/server"
import { cropsDrops } from "../config/crops_drops.js"

/**
 * Crop data: defines seed item and loot table for each custom crop.
 */
const cropData = {
    'utilitycraft:coal_crop': { seed: 'utilitycraft:coal_seeds', loot: 'bountiful_crops/coalLoot/coal_crop' },
    'utilitycraft:copper_crop': { seed: 'utilitycraft:copper_seeds', loot: 'bountiful_crops/copperLoot/copper_crop' },
    'utilitycraft:dyes_crop': { seed: 'utilitycraft:dyes_seeds', loot: 'bountiful_crops/dyesLoot/dyes_crop' },
    'utilitycraft:glass_crop': { seed: 'utilitycraft:glass_seeds', loot: 'bountiful_crops/glassLoot/glass_crop' },
    'utilitycraft:gunpowder_crop': { seed: 'utilitycraft:gunpowder_seeds', loot: 'bountiful_crops/gunpowderLoot/gunpowder_crop' },
    'utilitycraft:iron_crop': { seed: 'utilitycraft:iron_seeds', loot: 'bountiful_crops/ironLoot/iron_crop' },
    'utilitycraft:leather_crop': { seed: 'utilitycraft:leather_seeds', loot: 'bountiful_crops/leatherLoot/leather_crop' },
    'utilitycraft:prismarine_crystal_crop': { seed: 'utilitycraft:prismarine_crystals_seeds', loot: 'bountiful_crops/prismarineCRLoot/prismarine_crystals_crop' },
    'utilitycraft:prismarine_shards_crop': { seed: 'utilitycraft:prismarine_shards_seeds', loot: 'bountiful_crops/prismarineSHLoot/prismarine_shards_crop' },
    'utilitycraft:water_crop': { seed: 'utilitycraft:water_seeds', loot: 'bountiful_crops/waterLoot/water_crop' },
    'utilitycraft:wool_crop': { seed: 'utilitycraft:wool_seeds', loot: 'bountiful_crops/woolLoot/wool_crop' },
    'utilitycraft:ghast_crop': { seed: 'utilitycraft:ghast_seeds', loot: 'bountiful_crops/ghastLoot/ghast_tear_crop' },
    'utilitycraft:glowstone_crop': { seed: 'utilitycraft:glowstone_seeds', loot: 'bountiful_crops/glowstoneLoot/glowstone_crop' },
    'utilitycraft:gold_crop': { seed: 'utilitycraft:gold_seeds', loot: 'bountiful_crops/goldLoot/gold_crop' },
    'utilitycraft:honey_crop': { seed: 'utilitycraft:honey_seeds', loot: 'bountiful_crops/honeyLoot/honey_crop' },
    'utilitycraft:lapis_crop': { seed: 'utilitycraft:lapis_seeds', loot: 'bountiful_crops/lapisLoot/lapis_crop' },
    'utilitycraft:lava_crop': { seed: 'utilitycraft:lava_seeds', loot: 'bountiful_crops/lavaLoot/lava_crop' },
    'utilitycraft:quartz_crop': { seed: 'utilitycraft:quartz_seeds', loot: 'bountiful_crops/quartzLoot/quartz_crop' },
    'utilitycraft:redstone_crop': { seed: 'utilitycraft:redstone_seeds', loot: 'bountiful_crops/redstoneLoot/redstone_crop' },
    'utilitycraft:slime_crop': { seed: 'utilitycraft:slime_seeds', loot: 'bountiful_crops/slimeLoot/slime_crop' },
    'utilitycraft:amethyst_crop': { seed: 'utilitycraft:amethyst_seeds', loot: 'bountiful_crops/amethystLoot/amethyst_crop' },
    'utilitycraft:blaze_crop': { seed: 'utilitycraft:blaze_seeds', loot: 'bountiful_crops/blazeLoot/blaze_crop' },
    'utilitycraft:diamond_crop': { seed: 'utilitycraft:diamond_seeds', loot: 'bountiful_crops/diamondLoot/diamond_crop' },
    'utilitycraft:emerald_crop': { seed: 'utilitycraft:emerald_seeds', loot: 'bountiful_crops/emeraldLoot/emerald_crop' },
    'utilitycraft:enderpearl_crop': { seed: 'utilitycraft:enderpearl_seeds', loot: 'bountiful_crops/enderpearlLoot/enderpearl_crop' },
    'utilitycraft:obsidian_crop': { seed: 'utilitycraft:obsidian_seeds', loot: 'bountiful_crops/obsidianLoot/obsidian_crop' },
    'utilitycraft:netherite_crop': { seed: 'utilitycraft:netherite_seeds', loot: 'bountiful_crops/netheriteLoot/netherite_crop' },
    'utilitycraft:netherstar_crop': { seed: 'utilitycraft:nether_star_seeds', loot: 'bountiful_crops/netherstarLoot/netherstar_crop' },
    'utilitycraft:shulker_crop': { seed: 'utilitycraft:shulker_seeds', loot: 'bountiful_crops/shulkerLoot/shulker_crop' },
    'utilitycraft:totem_crop': { seed: 'utilitycraft:totem_seeds', loot: 'bountiful_crops/totemLoot/totem_crop' },
    'utilitycraft:wither_crop': { seed: 'utilitycraft:wither_seeds', loot: 'bountiful_crops/witherLoot/wither_crop' }
}


DoriosAPI.register.blockComponent("crop", {
    onTick({ block }) {
        const age = block.getState("utilitycraft:age")
        if (age < 5) {
            block.setState("utilitycraft:age", age + 1)
        }
    },

    onPlayerInteract({ block, player }) {
        const blockId = block.typeId
        const crop = cropData[blockId]
        if (!crop) return

        const mainHand = player.getComponent("equippable").getEquipment("Mainhand")
        const age = block.getState("utilitycraft:age")

        // Fully grown crop
        if (age === 5) {
            const enchantable = mainHand?.getComponent("minecraft:enchantable")
            const fortune = enchantable?.getEnchantment("minecraft:fortune")

            if (!fortune) {
                const { x, y, z } = block.location
                block.dimension.runCommand(`loot spawn ${x} ${y} ${z} loot "${crop.loot}"`)
            } else {
                const drops = cropsDrops[crop.seed]?.drops ?? []
                const fortuneLevel = fortune.level

                drops.forEach(drop => {
                    const randomChance = Math.random() * 100
                    if (randomChance <= drop.prob) {
                        if (drop.item.endsWith("_seeds")) {
                            player.giveItem(drop.item, block)
                        } else {
                            const amount = DoriosAPI.utils.randomInterval(drop.min, drop.max * fortuneLevel)
                            block.dimension.spawnItem(new ItemStack(drop.item, amount), block.location)
                        }
                    }
                })
            }

            block.dimension.playSound("dig.grass", block.location)
            block.setState("utilitycraft:age", 0)
        }
    },

    onPlayerDestroy({ destroyedBlockPermutation, block }) {
        const blockId = destroyedBlockPermutation.type.id
        const crop = cropData[blockId]
        if (!crop) return

        const { x, y, z } = block.location
        const age = destroyedBlockPermutation.getState("utilitycraft:age")
        if (age === 5) {
            block.dimension.spawnItem(new ItemStack(crop.seed, 1), { x, y, z })
        }
    }
})
