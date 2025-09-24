import { world, ItemStack } from '@minecraft/server'
import { growing } from '../machinery/machines_config.js';
const cropData = {
    'twm:coal_crop': { seed: 'twm:coal_seeds', loot: 'bountiful_crops/coalLoot/coal_crop' },
    'twm:copper_crop': { seed: 'twm:copper_seeds', loot: 'bountiful_crops/copperLoot/copper_crop' },
    'twm:dyes_crop': { seed: 'twm:dyes_seeds', loot: 'bountiful_crops/dyesLoot/dyes_crop' },
    'twm:glass_crop': { seed: 'twm:glass_seeds', loot: 'bountiful_crops/glassLoot/glass_crop' },
    'twm:gunpowder_crop': { seed: 'twm:gunpowder_seeds', loot: 'bountiful_crops/gunpowderLoot/gunpowder_crop' },
    'twm:iron_crop': { seed: 'twm:iron_seeds', loot: 'bountiful_crops/ironLoot/iron_crop' },
    'twm:leather_crop': { seed: 'twm:leather_seeds', loot: 'bountiful_crops/leatherLoot/leather_crop' },
    'twm:prismarine_crystal_crop': { seed: 'twm:prismarine_crystals_seeds', loot: 'bountiful_crops/prismarineCRLoot/prismarine_crystals_crop' },
    'twm:prismarine_shards_crop': { seed: 'twm:prismarine_shards_seeds', loot: 'bountiful_crops/prismarineSHLoot/prismarine_shards_crop' },
    'twm:water_crop': { seed: 'twm:water_seeds', loot: 'bountiful_crops/waterLoot/water_crop' },
    'twm:wool_crop': { seed: 'twm:wool_seeds', loot: 'bountiful_crops/woolLoot/wool_crop' },
    'twm:ghast_crop': { seed: 'twm:ghast_seeds', loot: 'bountiful_crops/ghastLoot/ghast_tear_crop' },
    'twm:glowstone_crop': { seed: 'twm:glowstone_seeds', loot: 'bountiful_crops/glowstoneLoot/glowstone_crop' },
    'twm:gold_crop': { seed: 'twm:gold_seeds', loot: 'bountiful_crops/goldLoot/gold_crop' },
    'twm:honey_crop': { seed: 'twm:honey_seeds', loot: 'bountiful_crops/honeyLoot/honey_crop' },
    'twm:lapis_crop': { seed: 'twm:lapis_seeds', loot: 'bountiful_crops/lapisLoot/lapis_crop' },
    'twm:lava_crop': { seed: 'twm:lava_seeds', loot: 'bountiful_crops/lavaLoot/lava_crop' },
    'twm:quartz_crop': { seed: 'twm:quartz_seeds', loot: 'bountiful_crops/quartzLoot/quartz_crop' },
    'twm:redstone_crop': { seed: 'twm:redstone_seeds', loot: 'bountiful_crops/redstoneLoot/redstone_crop' },
    'twm:slime_crop': { seed: 'twm:slime_seeds', loot: 'bountiful_crops/slimeLoot/slime_crop' },
    'twm:amethyst_crop': { seed: 'twm:amethyst_seeds', loot: 'bountiful_crops/amethystLoot/amethyst_crop' },
    'twm:blaze_crop': { seed: 'twm:blaze_seeds', loot: 'bountiful_crops/blazeLoot/blaze_crop' },
    'twm:diamond_crop': { seed: 'twm:diamond_seeds', loot: 'bountiful_crops/diamondLoot/diamond_crop' },
    'twm:emerald_crop': { seed: 'twm:emerald_seeds', loot: 'bountiful_crops/emeraldLoot/emerald_crop' },
    'twm:enderpearl_crop': { seed: 'twm:enderpearl_seeds', loot: 'bountiful_crops/enderpearlLoot/enderpearl_crop' },
    'twm:obsidian_crop': { seed: 'twm:obsidian_seeds', loot: 'bountiful_crops/obsidianLoot/obsidian_crop' },
    'twm:netherite_crop': { seed: 'twm:netherite_seeds', loot: 'bountiful_crops/netheriteLoot/netherite_crop' },
    'twm:netherstar_crop': { seed: 'twm:nether_star_seeds', loot: 'bountiful_crops/netherstarLoot/netherstar_crop' },
    'twm:shulker_crop': { seed: 'twm:shulker_seeds', loot: 'bountiful_crops/shulkerLoot/shulker_crop' },
    'twm:totem_crop': { seed: 'twm:totem_seeds', loot: 'bountiful_crops/totemLoot/totem_crop' },
    'twm:wither_crop': { seed: 'twm:wither_seeds', loot: 'bountiful_crops/witherLoot/wither_crop' }
}

function randomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:grow', {
        onTick(e) {
            const age = e.block.permutation.getState('twm:age')
            if (age < 5) {
                e.block.setPermutation(e.block.permutation.withState('twm:age', age + 1))
            }
        },
        onPlayerInteract(e) {
            const { block, player } = e

            const blockId = block.typeId
            const crop = cropData[blockId]
            if (!crop) return

            let mainhand = player.getComponent('equippable').getEquipment('Mainhand')



            const age = block.permutation.getState('twm:age')
            if (age === 5) {
                if (!mainhand || !mainhand.getComponent('minecraft:enchantable')?.getEnchantment('minecraft:fortune')) {
                    const { x, y, z } = block.location
                    block.dimension.runCommand(`loot spawn ${x} ${y} ${z} loot "${crop.loot}"`)
                    block.dimension.playSound('dig.grass', block.location)
                    block.setPermutation(block.permutation.withState('twm:age', 0))
                } else {
                    let fortuneLevel = mainhand.getComponent('minecraft:enchantable').getEnchantment('minecraft:fortune').level
                    // let drops = growing[cropData[blockId].seed].drops
                    drops.forEach(drop => {
                        let item = drop.item
                        const randomChance = Math.random() * 100
                        if (randomChance <= drop.prob) {
                            if (item.endsWith('_seeds')) {
                                block.dimension.spawnItem(new ItemStack(item, 1), block.location)
                            } else {
                                block.dimension.spawnItem(new ItemStack(item, randomInterval(drop.min, drop.max * fortuneLevel)), block.location)
                            }
                        }
                        block.dimension.playSound('dig.grass', block.location)
                        block.setPermutation(block.permutation.withState('twm:age', 0))
                    })
                }
            }
        },
        onPlayerDestroy(e) {
            const blockId = e.destroyedBlockPermutation.type.id
            const crop = cropData[blockId]

            if (!crop) return

            const { x, y, z } = e.block.location
            const age = e.destroyedBlockPermutation.getState('twm:age')
            if (age === 5) {
                e.block.dimension.spawnItem(new ItemStack(crop.seed, 1), { x, y, z })
            }
        }
    })
})
