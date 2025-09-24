// Upgrades for Machines
export const acceptedUpgrades = [
    { upgrade: 'utilitycraft:energy', cap: 8, name: '§bEnergy' },
    { upgrade: 'utilitycraft:speed', cap: 8, name: '§aSpeed' },
    { upgrade: 'utilitycraft:range', cap: 4, name: '§9Range' },
    { upgrade: 'utilitycraft:quantity', cap: 4, name: '§3Quantity' },
    { upgrade: 'utilitycraft:filter', cap: 1, name: '§7Filter' }
]
// Machines with a different speed/energy cap (4)
export const diffCapMachines = ['utilitycraft:harvester', 'utilitycraft:block_placer', 'utilitycraft:block_breaker', 'utilitycraft:induction_anvil', 'utilitycraft:mechanic_upper', 'utilitycraft:mechanic_hopper', 'utilitycraft:mechanic_dropper', 'utilitycraft:mechanical_spawner', 'utilitycraft:item_exporter', 'utilitycraft:fluid_extractor']

const acceptedSoils = {
    'minecraft:dirt': { cost: 2, speed: 0.5 },
    'minecraft:grass_block': { cost: 1.5, speed: 1 },
    'utilitycraft:yellow_soil': { cost: 1, speed: 1 },
    'utilitycraft:red_soil': { cost: 0.75, speed: 2 },
    'utilitycraft:blue_soil': { cost: 0.5, speed: 4 },
    'utilitycraft:black_soil': { cost: 0.25, speed: 10 },
}

const meshMulti = {
    'utilitycraft:string_mesh': 0.75,
    'utilitycraft:flint_mesh': 1,
    'utilitycraft:iron_mesh': 1.25,
    'utilitycraft:golden_mesh': 1.5,
    'utilitycraft:emerald_mesh': 2,
    'utilitycraft:diamond_mesh': 3,
    'utilitycraft:netherite_mesh': 4
}

export const crushing = {
    // ========== COBBLESTONE ==========
    "minecraft:cobblestone": { output: "minecraft:gravel", amount: 1 },
    "utilitycraft:compressed_cobblestone": { output: "utilitycraft:compressed_gravel", amount: 1 },
    "utilitycraft:double_compressed_cobblestone": { output: "utilitycraft:compressed_gravel_2", amount: 1 },
    "utilitycraft:triple_compressed_cobblestone": { output: "utilitycraft:compressed_gravel_3", amount: 1 },
    "utilitycraft:quadruple_compressed_cobblestone": { output: "utilitycraft:compressed_gravel_4", amount: 1 },

    // ========== GRAVEL ==========
    "minecraft:gravel": { output: "minecraft:dirt", amount: 1 },
    "utilitycraft:compressed_gravel": { output: "utilitycraft:compressed_dirt", amount: 1 },
    "utilitycraft:compressed_gravel_2": { output: "utilitycraft:compressed_dirt_2", amount: 1 },
    "utilitycraft:compressed_gravel_3": { output: "utilitycraft:compressed_dirt_3", amount: 1 },
    "utilitycraft:compressed_gravel_4": { output: "utilitycraft:compressed_dirt_4", amount: 1 },

    // ========== DIRT ==========
    "minecraft:dirt": { output: "minecraft:sand", amount: 1 },
    "utilitycraft:compressed_dirt": { output: "utilitycraft:compressed_sand", amount: 1 },
    "utilitycraft:compressed_dirt_2": { output: "utilitycraft:compressed_sand_2", amount: 1 },
    "utilitycraft:compressed_dirt_3": { output: "utilitycraft:compressed_sand_3", amount: 1 },
    "utilitycraft:compressed_dirt_4": { output: "utilitycraft:compressed_sand_4", amount: 1 },

    // ========== NETHERRACK ==========
    "minecraft:netherrack": { output: "utilitycraft:crushed_netherrack", amount: 1 },
    "utilitycraft:compressed_netherrack": { output: "utilitycraft:compressed_crushed_netherrack", amount: 1 },
    "utilitycraft:compressed_netherrack_2": { output: "utilitycraft:compressed_crushed_netherrack_2", amount: 1 },
    "utilitycraft:compressed_netherrack_3": { output: "utilitycraft:compressed_crushed_netherrack_3", amount: 1 },
    "utilitycraft:compressed_netherrack_4": { output: "utilitycraft:compressed_crushed_netherrack_4", amount: 1 },

    // ========== END STONE ==========
    "minecraft:end_stone": { output: "utilitycraft:crushed_endstone", amount: 1 },
    "utilitycraft:compressed_endstone": { output: "utilitycraft:compressed_crushed_endstone", amount: 1 },
    "utilitycraft:compressed_endstone_2": { output: "utilitycraft:compressed_crushed_endstone_2", amount: 1 },
    "utilitycraft:compressed_endstone_3": { output: "utilitycraft:compressed_crushed_endstone_3", amount: 1 },
    "utilitycraft:compressed_endstone_4": { output: "utilitycraft:compressed_crushed_endstone_4", amount: 1 },

    // ========== COBBLED DEEPSLATE ==========
    "minecraft:cobbled_deepslate": { output: "utilitycraft:crushed_cobbled_deepslate", amount: 1 },
    "utilitycraft:compressed_cobbled_deepslate": { output: "utilitycraft:compressed_crushed_cobbled_deepslate", amount: 1 },
    "utilitycraft:compressed_cobbled_deepslate_2": { output: "utilitycraft:compressed_crushed_cobbled_deepslate_2", amount: 1 },
    "utilitycraft:compressed_cobbled_deepslate_3": { output: "utilitycraft:compressed_crushed_cobbled_deepslate_3", amount: 1 },
    "utilitycraft:compressed_cobbled_deepslate_4": { output: "utilitycraft:compressed_crushed_cobbled_deepslate_4", amount: 1 },

    // ========== DEEPSLATE ==========
    "minecraft:deepslate": { output: "minecraft:cobbled_deepslate", amount: 1 },
    "utilitycraft:compressed_deepslate": { output: "utilitycraft:compressed_cobbled_deepslate", amount: 1 },
    "utilitycraft:compressed_deepslate_2": { output: "utilitycraft:compressed_cobbled_deepslate_2", amount: 1 },
    "utilitycraft:compressed_deepslate_3": { output: "utilitycraft:compressed_cobbled_deepslate_3", amount: 1 },
    "utilitycraft:compressed_deepslate_4": { output: "utilitycraft:compressed_cobbled_deepslate_4", amount: 1 },

    // Normal Chunks
    "utilitycraft:copper_chunk": { output: "minecraft:raw_copper", amount: 1 },
    "utilitycraft:gold_chunk": { output: "minecraft:raw_gold", amount: 1 },
    "utilitycraft:iron_chunk": { output: "minecraft:raw_iron", amount: 1 },
    "utilitycraft:coal_chunk": { output: "minecraft:coal", amount: 1 },
    "utilitycraft:diamond_chunk": { output: "minecraft:diamond", amount: 1 },
    "utilitycraft:emerald_chunk": { output: "minecraft:emerald", amount: 1 },
    "utilitycraft:lapislazuli_chunk": { output: "minecraft:lapis_lazuli", amount: 3 },
    "utilitycraft:redstone_chunk": { output: "minecraft:redstone", amount: 4 },
    "utilitycraft:nether_quartz_chunk": { output: "minecraft:quartz", amount: 3 },
    "utilitycraft:nether_gold_chunk": { output: "minecraft:raw_gold", amount: 1 },

    // Deepslate Chunks
    "utilitycraft:deepslate_copper_chunk": { output: "minecraft:raw_copper", amount: 1 },
    "utilitycraft:deepslate_gold_chunk": { output: "minecraft:raw_gold", amount: 1 },
    "utilitycraft:deepslate_iron_chunk": { output: "minecraft:raw_iron", amount: 1 },
    "utilitycraft:deepslate_coal_chunk": { output: "minecraft:coal", amount: 1 },
    "utilitycraft:deepslate_diamond_chunk": { output: "minecraft:diamond", amount: 1 },
    "utilitycraft:deepslate_emerald_chunk": { output: "minecraft:emerald", amount: 1 },
    "utilitycraft:deepslate_lapislazuli_chunk": { output: "minecraft:lapis_lazuli", amount: 3 },
    "utilitycraft:deepslate_redstone_chunk": { output: "minecraft:redstone", amount: 4 },

    // Ingots
    'minecraft:netherite_ingot': { output: 'utilitycraft:netherite_dust', amount: 1 },
    'minecraft:iron_ingot': { output: 'utilitycraft:iron_dust', amount: 1 },
    'minecraft:gold_ingot': { output: 'utilitycraft:gold_dust', amount: 1 },
    'minecraft:copper_ingot': { output: 'utilitycraft:copper_dust', amount: 1 },
    'utilitycraft:energized_iron_ingot': { output: 'utilitycraft:energized_iron_dust', amount: 1 },
    'utilitycraft:steel_ingot': { output: 'utilitycraft:steel_dust', amount: 1 },
    'minecraft:netherite_scrap': { output: 'utilitycraft:netherite_scrap_dust', amount: 1 },
    'utilitycraft:ancient_debris_chunk': { output: 'utilitycraft:netherite_scrap_dust', amount: 1 },
    // Plates
    'utilitycraft:netherite_plate': { output: 'utilitycraft:netherite_dust', amount: 1 },
    'utilitycraft:iron_plate': { output: 'utilitycraft:iron_dust', amount: 1 },
    'utilitycraft:gold_plate': { output: 'utilitycraft:gold_dust', amount: 1 },
    'utilitycraft:copper_plate': { output: 'utilitycraft:copper_dust', amount: 1 },
    'utilitycraft:energized_iron_plate': { output: 'utilitycraft:energized_iron_dust', amount: 1 },
    'utilitycraft:steel_plate': { output: 'utilitycraft:steel_dust', amount: 1 },
    // Raw
    'utilitycraft:raw_energized_iron': { output: 'utilitycraft:energized_iron_dust', amount: 2 },
    'minecraft:raw_iron': { output: 'utilitycraft:iron_dust', amount: 2 },
    'minecraft:raw_gold': { output: 'utilitycraft:gold_dust', amount: 2 },
    'minecraft:raw_copper': { output: 'utilitycraft:copper_dust', amount: 2 },
    'utilitycraft:raw_steel': { output: 'utilitycraft:steel_dust', amount: 2 },
    'minecraft:coal': { output: 'utilitycraft:coal_dust', amount: 2 },
    'minecraft:charcoal': { output: 'utilitycraft:charcoal_dust', amount: 2 },
    // Gems
    'minecraft:emerald': { output: 'utilitycraft:emerald_dust', amount: 2 },
    'minecraft:diamond': { output: 'utilitycraft:diamond_dust', amount: 2 },
    'minecraft:quartz': { output: 'utilitycraft:quartz_dust', amount: 2 },
    'minecraft:amethyst_shard': { output: 'utilitycraft:amethyst_dust', amount: 2 },
    'minecraft:ender_pearl': { output: 'utilitycraft:ender_pearl_dust', amount: 2 },
    'minecraft:obsidian': { output: 'utilitycraft:obsidian_dust', amount: 4 },
    'minecraft:crying_obsidian': { output: 'utilitycraft:crying_obsidian_dust', amount: 4 },
    // Blocks/Random
    'minecraft:kelp': { output: 'utilitycraft:crushed_kelp', amount: 1 },
    'minecraft:blue_ice': { output: 'minecraft:packed_ice', amount: 9 },
    'minecraft:packed_ice': { output: 'minecraft:ice', amount: 9 },
    'minecraft:nether_wart_block': { output: 'minecraft:nether_wart', amount: 4 },
    'minecraft:magma_block': { output: 'minecraft:magma_cream', amount: 4 },
    'minecraft:slime_black': { output: 'minecraft:slime_ball', amount: 9 },
    'minecraft:bone': { output: 'minecraft:bone_meal', amount: 3 },
    'minecraft:bone_block': { output: 'minecraft:bone_meal', amount: 9 },
    'minecraft:blaze_rod': { output: 'minecraft:blaze_powder', amount: 2 },
    // Wool
    "minecraft:black_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:blue_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:brown_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:cyan_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:gray_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:green_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:light_blue_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:light_gray_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:lime_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:magenta_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:orange_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:pink_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:purple_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:red_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:white_wool": { output: "minecraft:string", amount: 4 },
    "minecraft:yellow_wool": { output: "minecraft:string", amount: 4 },
    // Integrated
    "ae2be:certus_quartz_crystal": { output: "ae2be:certus_quartz_dust", amount: 1 },
    "ae2be:charged_certus_quartz_crystal": { output: "ae2be:certus_quartz_dust", amount: 1 },
    "ae2be:fluix_crystal": { output: "ae2be:fluix_dust", amount: 1 },
    "ae2be:sky_stone": { output: "ae2be:sky_stone_dust", amount: 1 }
}

export const sieving = {
    'minecraft:gravel': [
        { item: 'minecraft:flint', amount: 1, prob: 20 },
        { item: 'utilitycraft:iron_chunk', amount: 1, prob: 20 },
        { item: 'utilitycraft:coal_chunk', amount: 1, prob: 30 },
        { item: 'utilitycraft:gold_chunk', amount: 1, prob: 10 },
        { item: 'utilitycraft:lapislazuli_chunk', amount: 1, prob: 2 },
        { item: 'utilitycraft:emerald_chunk', amount: 1, prob: 2 },
        { item: 'utilitycraft:diamond_chunk', amount: 1, prob: 1.5 }
    ],
    'minecraft:dirt': [
        { item: 'minecraft:carrot', amount: 1, prob: 10 },
        { item: 'minecraft:potato', amount: 1, prob: 10 },
        { item: 'minecraft:wheat_seeds', amount: 1, prob: 10 },
        { item: 'minecraft:pumpkin_seeds', amount: 1, prob: 10 },
        { item: 'minecraft:beetroot_seeds', amount: 1, prob: 10 },
        { item: 'minecraft:melon_seeds', amount: 1, prob: 10 },
        { item: 'minecraft:sugar_cane', amount: 1, prob: 10 },
        { item: 'minecraft:bamboo', amount: 1, prob: 10 },
        { item: 'minecraft:acacia_sapling', amount: 1, prob: 10 },
        { item: 'minecraft:birch_sapling', amount: 1, prob: 10 },
        { item: 'minecraft:dark_oak_sapling', amount: 1, prob: 10 },
        { item: 'minecraft:jungle_sapling', amount: 1, prob: 10 },
        { item: 'minecraft:oak_sapling', amount: 1, prob: 10 },
        { item: 'minecraft:pale_oak_sapling', amount: 1, prob: 10 },
        { item: 'minecraft:spruce_sapling', amount: 1, prob: 10 },
        { item: 'minecraft:cherry_sapling', amount: 1, prob: 10 }
    ],
    'minecraft:grass': [
        { item: 'minecraft:red_flower', amount: 1, prob: 20.0 },
        { item: 'minecraft:yellow_flower', amount: 1, prob: 20.0 },
        { item: 'minecraft:double_plant', amount: 1, prob: 20.0 },
        { item: 'minecraft:torchflower', amount: 1, prob: 20.0 },
        { item: 'minecraft:pitcher_plant', amount: 1, prob: 20.0 },
        { item: 'minecraft:pink_petals', amount: 1, prob: 20.0 }
    ],
    'utilitycraft:crushed_netherrack': [
        { item: 'utilitycraft:nether_quartz_chunk', amount: 1, prob: 33.0 },
        { item: 'minecraft:gold_nugget', amount: 1, prob: 20 },
        { item: 'utilitycraft:nether_gold_chunk', amount: 1, prob: 33 },
        { item: 'utilitycraft:ancient_debris_chunk', amount: 1, prob: 2.5 }
    ],
    'minecraft:sand': [
        { item: 'minecraft:prismarine_shard', amount: 1, prob: 10 },
        { item: 'minecraft:prismarine_crystals', amount: 1, prob: 10 },
        { item: 'utilitycraft:copper_chunk', amount: 1, prob: 25 },
        { item: 'utilitycraft:redstone_chunk', amount: 1, prob: 20 },
        { item: 'minecraft:bone_meal', amount: 1, prob: 25 },
        { item: 'minecraft:gunpowder', amount: 1, prob: 12 },
        { item: 'minecraft:glowstone_dust', amount: 1, prob: 8 },
        { item: 'minecraft:blaze_powder', amount: 1, prob: 10 },
        { item: 'minecraft:cactus', amount: 1, prob: 10 },
        { item: 'minecraft:kelp', amount: 1, prob: 10 },
        { item: 'minecraft:clay_ball', amount: 1, prob: 10 },
        { item: 'minecraft:cocoa_beans', amount: 1, prob: 1 },
        { item: 'minecraft:heart_of_the_sea', amount: 1, prob: 0.1 },
        { item: 'minecraft:conduit', amount: 1, prob: 0.1 },
        // Integrated Storage
        { item: 'ae2be:certus_quartz_crystal', amount: 1, prob: 17 },
        { item: 'ae2be:charged_certus_quartz_crystal', amount: 1, prob: 1 }
    ],
    'minecraft:soul_sand': [
        { item: 'utilitycraft:nether_quartz_chunk', amount: 1, prob: 33.0 },
        { item: 'utilitycraft:nether_quartz_chunk', amount: 3, prob: 10.0 },
        { item: 'minecraft:bone', amount: 1, prob: 15 },
        { item: 'minecraft:ghast_tear', amount: 1, prob: 8 },
        { item: 'minecraft:nether_wart', amount: 1, prob: 12 },
        { item: 'minecraft:warped_fungus', amount: 1, prob: 10 },
        { item: 'minecraft:crimson_fungus', amount: 1, prob: 10 }
    ],
    'utilitycraft:crushed_endstone': [
        { item: 'minecraft:chorus_flower', amount: 1, prob: 1 },
        { item: 'minecraft:chorus_fruit', amount: 1, prob: 8.0 },
        { item: 'minecraft:ender_pearl', amount: 1, prob: 16 }
    ],
    'utilitycraft:crushed_cobbled_deepslate': [
        { item: 'minecraft:echo_shard', amount: 1, prob: 5 },
        { item: 'minecraft:sculk_catalyst', amount: 1, prob: 0.5 },
        { item: 'minecraft:amethyst_shard', amount: 1, prob: 1 },
        { item: 'utilitycraft:deepslate_diamond_chunk', amount: 1, prob: 5 },
        { item: 'utilitycraft:deepslate_emerald_chunk', amount: 1, prob: 5 },
        { item: 'utilitycraft:deepslate_gold_chunk', amount: 1, prob: 20 },
        { item: 'utilitycraft:deepslate_iron_chunk', amount: 1, prob: 25 },
        { item: 'utilitycraft:deepslate_lapislazuli_chunk', amount: 1, prob: 15 },
        { item: 'utilitycraft:deepslate_coal_chunk', amount: 1, prob: 30 }
    ],
    //Compressed
    'utilitycraft:compressed_gravel': [
        { item: 'minecraft:flint', amount: 9, prob: 20 },
        { item: 'utilitycraft:iron_chunk', amount: 9, prob: 20 },
        { item: 'utilitycraft:coal_chunk', amount: 9, prob: 30 },
        { item: 'utilitycraft:gold_chunk', amount: 9, prob: 10 },
        { item: 'utilitycraft:lapislazuli_chunk', amount: 9, prob: 2 },
        { item: 'utilitycraft:emerald_chunk', amount: 9, prob: 2 },
        { item: 'utilitycraft:diamond_chunk', amount: 9, prob: 1.5 }
    ],
    'utilitycraft:compressed_dirt': [
        { item: 'minecraft:carrot', amount: 9, prob: 10 },
        { item: 'minecraft:potato', amount: 9, prob: 10 },
        { item: 'minecraft:wheat_seeds', amount: 9, prob: 10 },
        { item: 'minecraft:pumpkin_seeds', amount: 9, prob: 10 },
        { item: 'minecraft:beetroot_seeds', amount: 9, prob: 10 },
        { item: 'minecraft:melon_seeds', amount: 9, prob: 10 },
        { item: 'minecraft:sugar_cane', amount: 9, prob: 10 },
        { item: 'minecraft:bamboo', amount: 9, prob: 10 },
        { item: 'minecraft:sapling', amount: 9, prob: 10.0 },
        { item: 'minecraft:cherry_sapling', amount: 9, prob: 10.0 }
    ],
    'utilitycraft:compressed_sand': [
        { item: 'minecraft:prismarine_shard', amount: 9, prob: 10 },
        { item: 'minecraft:prismarine_crystals', amount: 9, prob: 10 },
        { item: 'utilitycraft:copper_chunk', amount: 9, prob: 25 },
        { item: 'minecraft:bone_meal', amount: 9, prob: 25 },
        { item: 'utilitycraft:redstone_chunk', amount: 9, prob: 20 },
        { item: 'minecraft:gunpowder', amount: 9, prob: 12 },
        { item: 'minecraft:glowstone_dust', amount: 9, prob: 8 },
        { item: 'minecraft:blaze_powder', amount: 9, prob: 10 },
        { item: 'minecraft:cactus', amount: 9, prob: 10 },
        { item: 'minecraft:kelp', amount: 9, prob: 10 },
        { item: 'minecraft:cocoa_beans', amount: 9, prob: 8 },
        { item: 'minecraft:clay_ball', amount: 9, prob: 10 },
        { item: 'minecraft:heart_of_the_sea', amount: 9, prob: 0.1 },
        { item: 'minecraft:conduit', amount: 9, prob: 0.1 },
        // Integrated Storage
        { item: 'ae2be:certus_quartz_crystal', amount: 9, prob: 17 },
        { item: 'ae2be:charged_certus_quartz_crystal', amount: 9, prob: 1 }
    ],
    'utilitycraft:compressed_crushed_netherrack': [
        { item: 'utilitycraft:nether_quartz_chunk', amount: 9, prob: 33.0 },
        { item: 'minecraft:gold_nugget', amount: 9, prob: 20 },
        { item: 'utilitycraft:nether_gold_chunk', amount: 9, prob: 33 },
        { item: 'utilitycraft:ancient_debris_chunk', amount: 9, prob: 2.5 }
    ],
    'utilitycraft:compressed_crushed_cobbled_deepslate': [
        { item: 'minecraft:echo_shard', amount: 9, prob: 5 },
        { item: 'minecraft:sculk_catalyst', amount: 9, prob: 0.5 },
        { item: 'minecraft:amethyst_shard', amount: 9, prob: 1 },
        { item: 'utilitycraft:deepslate_diamond_chunk', amount: 9, prob: 5 },
        { item: 'utilitycraft:deepslate_emerald_chunk', amount: 9, prob: 5 },
        { item: 'utilitycraft:deepslate_gold_chunk', amount: 9, prob: 20 },
        { item: 'utilitycraft:deepslate_iron_chunk', amount: 9, prob: 25 },
        { item: 'utilitycraft:deepslate_lapislazuli_chunk', amount: 9, prob: 15 },
        { item: 'utilitycraft:deepslate_coal_chunk', amount: 9, prob: 30 }
    ],
    'utilitycraft:compressed_crushed_endstone': [
        { item: 'minecraft:chorus_flower', amount: 9, prob: 1 },
        { item: 'minecraft:chorus_fruit', amount: 9, prob: 8.0 },
        { item: 'minecraft:ender_pearl', amount: 9, prob: 16 }
    ]
}

export const pressing = {
    "minecraft:netherite_ingot": { output: "utilitycraft:netherite_plate", required: 1 },
    "minecraft:iron_ingot": { output: "utilitycraft:iron_plate", required: 1 },
    "minecraft:gold_ingot": { output: "utilitycraft:gold_plate", required: 1 },
    "minecraft:copper_ingot": { output: "utilitycraft:copper_plate", required: 1 },
    "utilitycraft:energized_iron_ingot": { output: "utilitycraft:energized_iron_plate", required: 1 },
    "utilitycraft:steel_ingot": { output: "utilitycraft:steel_plate", required: 1 },

    // Compress
    "minecraft:cobblestone": { output: "utilitycraft:compressed_cobblestone", required: 9 },
    "utilitycraft:compressed_cobblestone": { output: "utilitycraft:double_compressed_cobblestone", required: 9 },
    "utilitycraft:double_compressed_cobblestone": { output: "utilitycraft:triple_compressed_cobblestone", required: 9 },
    "utilitycraft:triple_compressed_cobblestone": { output: "utilitycraft:quadruple_compressed_cobblestone", required: 9 },
    "utilitycraft:quadruple_compressed_cobblestone": { output: "utilitycraft:quintuple_compressed_cobblestone", required: 9 },
    "utilitycraft:quintuple_compressed_cobblestone": { output: "utilitycraft:sextuple_compressed_cobblestone", required: 9 },
    "utilitycraft:sextuple_compressed_cobblestone": { output: "utilitycraft:septuple_compressed_cobblestone", required: 9 },
    "utilitycraft:septuple_compressed_cobblestone": { output: "utilitycraft:octuple_compressed_cobblestone", required: 9 },
    "utilitycraft:octuple_compressed_cobblestone": { output: "utilitycraft:nonuple_compressed_cobblestone", required: 9 },
    "minecraft:gravel": { output: "utilitycraft:compressed_gravel", required: 9 },
    "minecraft:sand": { output: "utilitycraft:compressed_sand", required: 9 },
    "minecraft:dirt": { output: "utilitycraft:compressed_dirt", required: 9 },
    "minecraft:netherrack": { output: "utilitycraft:compressed_netherrack", required: 9 },
    "minecraft:diamond_block": { output: "utilitycraft:compressed_diamond_block", required: 9 },
    "minecraft:iron_block": { output: "utilitycraft:compressed_iron_block", required: 9 },
    "minecraft:coal_block": { output: "utilitycraft:compressed_coal_block", required: 9 },

    // Extra
    "minecraft:packed_ice": { output: "minecraft:blue_ice", required: 9 },
    "minecraft:ice": { output: "minecraft:packed_ice", required: 9 },
    "minecraft:string": { output: "minecraft:wool", required: 4 },
    "minecraft:nether_wart": { output: "minecraft:nether_wart_block", required: 4 },
    "minecraft:magma_cream": { output: "minecraft:magma_block", required: 4 },
    "minecraft:slime_ball": { output: "minecraft:slime_block", required: 4 },
    "minecraft:stone": { output: "minecraft:deepslate", required: 4 },
    "minecraft:bone_meal": { output: "minecraft:bone_block", required: 9 },
    "minecraft:blaze_powder": { output: "minecraft:blaze_rod", required: 2 }
}

export const smelting = {
    // UtilityCraft
    "utilitycraft:raw_steel": {
        output: "utilitycraft:steel_ingot"
    },
    "utilitycraft:raw_energized_iron": {
        output: "utilitycraft:energized_iron_ingot"
    },
    "utilitycraft:iron_dust": {
        output: "minecraft:iron_ingot"
    },
    "utilitycraft:copper_dust": {
        output: "minecraft:copper_ingot"
    },
    "utilitycraft:gold_dust": {
        output: "minecraft:gold_ingot"
    },
    "utilitycraft:netherite_dust": {
        output: "minecraft:netherite_ingot"
    },
    "utilitycraft:netherite_scrap_dust": {
        output: "minecraft:netherite_scrap"
    },
    "utilitycraft:steel_dust": {
        output: "utilitycraft:steel_ingot"
    },
    "utilitycraft:energized_iron_dust": {
        output: "utilitycraft:energized_iron_ingot"
    },
    "utilitycraft:raw_steel_block": {
        output: "utilitycraft:steel_block"
    },
    "utilitycraft:raw_energized_iron_block": {
        output: "utilitycraft:energized_iron_block"
    },
    "utilitycraft:raw_leather": {
        output: "minecraft:leather"
    },
    'utilitycraft:crushed_kelp': {
        output: "minecraft:slime_ball"
    },
    // Compressed    
    "utilitycraft:compressed_sand": {
        output: "utilitycraft:compressed_glass"
    },
    // Utility Useful Recipes
    "minecraft:raw_iron_block": {
        output: "minecraft:iron_block"
    },
    "minecraft:raw_gold_block": {
        output: "minecraft:gold_block"
    },
    "minecraft:raw_copper_block": {
        output: "minecraft:copper_block"
    },
    // IS
    "ae2be:certus_quartz_dust": {
        output: "ae2be:silicon"
    },
    // Minecraft Vanilla
    "minecraft:porkchop": {
        output: "minecraft:cooked_porkchop"
    },
    "minecraft:beef": {
        output: "minecraft:cooked_beef"
    },
    "minecraft:chicken": {
        output: "minecraft:cooked_chicken"
    },
    "minecraft:cod": {
        output: "minecraft:cooked_cod"
    },
    "minecraft:salmon": {
        output: "minecraft:cooked_salmon"
    },
    "minecraft:potato": {
        output: "minecraft:baked_potato"
    },
    "minecraft:mutton": {
        output: "minecraft:cooked_mutton"
    },
    "minecraft:rabbit": {
        output: "minecraft:cooked_rabbit"
    },
    "minecraft:kelp": {
        output: "minecraft:dried_kelp"
    },
    "minecraft:rotten_flesh": {
        output: "strat:coagulated_blood"
    },
    "artifacts:everlasting_beef": {
        output: "artifacts:eternal_steak"
    },
    "bg:draconium_dust": {
        output: "bg:draconium_ingot"
    },
    "auxillium:amberine_ore": {
        output: "auxillium:amberine"
    },
    "auxillium:nether_amberine_ore": {
        output: "auxillium:amberine"
    },
    "auxillium:deepslate_amberine_ore": {
        output: "auxillium:amberine"
    },
    "auxillium:aurorus_ore": {
        output: "auxillium:aurorus"
    },
    "auxillium:deepslate_aurorus_ore": {
        output: "auxillium:aurorus"
    },
    "auxillium:auxillium_ore": {
        output: "auxillium:auxillium"
    },
    "auxillium:deepslate_auxillium_ore": {
        output: "auxillium:aurxillium"
    },
    "auxillium:cosmium_ore": {
        output: "auxillium:cosmium"
    },
    "auxillium:deepslate_cosmium_ore": {
        output: "auxillium:cosmium"
    },
    "auxillium:necrite_ore": {
        output: "auxillium:necrite"
    },
    "strat:raw_ardite": {
        output: "strat:ardite_ingot"
    },
    "strat:raw_aluminium": {
        output: "strat:aluminium_ingot"
    },
    "strat:aluminium_ore": {
        output: "strat:aluminium_ingot"
    },
    "strat:raw_cobalt": {
        output: "strat:cobalt_ingot"
    },
    "strat:cobalt_ore": {
        output: "strat:cobalt_ingot"
    },
    "strat:grout": {
        output: "strat:seared_brick"
    },
    "strat:nether_grout": {
        output: "strat:seared_brick"
    },
    "minecraft:raw_iron": {
        output: "minecraft:iron_ingot"
    },
    "minecraft:raw_gold": {
        output: "minecraft:gold_ingot"
    },
    "minecraft:raw_copper": {
        output: "minecraft:copper_ingot"
    },
    "minecraft:copper_ore": {
        output: "minecraft:copper_ingot"
    },
    "minecraft:iron_ore": {
        output: "minecraft:iron_ingot"
    },
    "minecraft:gold_ore": {
        output: "minecraft:gold_ingot"
    },
    "minecraft:diamond_ore": {
        output: "minecraft:diamond"
    },
    "minecraft:lapis_ore": {
        output: "minecraft:lapis_lazuli"
    },
    "minecraft:redstone_ore": {
        output: "minecraft:redstone"
    },
    "minecraft:coal_ore": {
        output: "minecraft:coal"
    },
    "minecraft:emerald_ore": {
        output: "minecraft:emerald"
    },
    "minecraft:deepslate_copper_ore": {
        output: "minecraft:copper_ingot"
    },
    "minecraft:deepslate_iron_ore": {
        output: "minecraft:iron_ingot"
    },
    "minecraft:deepslate_gold_ore": {
        output: "minecraft:gold_ingot"
    },
    "minecraft:deepslate_diamond_ore": {
        output: "minecraft:diamond"
    },
    "minecraft:deepslate_lapis_ore": {
        output: "minecraft:lapis_lazuli"
    },
    "minecraft:deepslate_redstone_ore": {
        output: "minecraft:redstone"
    },
    "minecraft:deepslate_coal_ore": {
        output: "minecraft:coal"
    },
    "minecraft:deepslate_emerald_ore": {
        output: "minecraft:emerald"
    },
    "minecraft:quartz_ore": {
        output: "minecraft:quartz"
    },
    "minecraft:ancient_debris": {
        output: "minecraft:netherite_scrap"
    },
    "minecraft:nether_gold_ore": {
        output: "minecraft:gold_ingot"
    },
    "minecraft:deepslate_emerald_ore": {
        output: "minecraft:emerald"
    },
    "bg:draconium_dust": {
        output: "bg:draconium_ingot"
    },
    "auxillium:amberine_ore": {
        output: "auxillium:amberine"
    },
    "auxillium:nether_amberine_ore": {
        output: "auxillium:amberine"
    },
    "auxillium:deepslate_amberine_ore": {
        output: "auxillium:amberine"
    },
    "auxillium:aurorus_ore": {
        output: "auxillium:aurorus"
    },
    "auxillium:deepslate_aurorus_ore": {
        output: "auxillium:aurorus"
    },
    "auxillium:auxillium_ore": {
        output: "auxillium:auxillium"
    },
    "auxillium:deepslate_auxillium_ore": {
        output: "auxillium:aurxillium"
    },
    "auxillium:cosmium_ore": {
        output: "auxillium:cosmium"
    },
    "auxillium:deepslate_cosmium_ore": {
        output: "auxillium:cosmium"
    },
    "auxillium:necrite_ore": {
        output: "auxillium:necrite"
    },
    "minecraft:rotten_flesh": {
        output: "strat:coagulated_blood"
    },
    "artifacts:everlasting_beef": {
        output: "artifacts:eternal_steak"
    },
    "strat:raw_ardite": {
        output: "strat:ardite_ingot"
    },
    "strat:raw_aluminium": {
        output: "strat:aluminium_ingot"
    },
    "strat:aluminium_ore": {
        output: "strat:aluminium_ingot"
    },
    "strat:raw_cobalt": {
        output: "strat:cobalt_ingot"
    },
    "strat:cobalt_ore": {
        output: "strat:cobalt_ingot"
    },
    "strat:grout": {
        output: "strat:seared_brick"
    },
    "strat:nether_grout": {
        output: "strat:seared_brick"
    },
    "minecraft:raw_iron": {
        output: "minecraft:iron_ingot"
    },
    "minecraft:raw_gold": {
        output: "minecraft:gold_ingot"
    },
    "minecraft:raw_copper": {
        output: "minecraft:copper_ingot"
    },
    "minecraft:copper_ore": {
        output: "minecraft:copper_ingot"
    },
    "minecraft:iron_ore": {
        output: "minecraft:iron_ingot"
    },
    "minecraft:gold_ore": {
        output: "minecraft:gold_ingot"
    },
    "minecraft:diamond_ore": {
        output: "minecraft:diamond"
    },
    "minecraft:lapis_ore": {
        output: "minecraft:lapis_lazuli"
    },
    "minecraft:redstone_ore": {
        output: "minecraft:redstone"
    },
    "minecraft:coal_ore": {
        output: "minecraft:coal"
    },
    "minecraft:emerald_ore": {
        output: "minecraft:emerald"
    },
    "minecraft:deepslate_copper_ore": {
        output: "minecraft:copper_ingot"
    },
    "minecraft:deepslate_iron_ore": {
        output: "minecraft:iron_ingot"
    },
    "minecraft:deepslate_gold_ore": {
        output: "minecraft:gold_ingot"
    },
    "minecraft:deepslate_diamond_ore": {
        output: "minecraft:diamond"
    },
    "minecraft:deepslate_lapis_ore": {
        output: "minecraft:lapis_lazuli"
    },
    "minecraft:deepslate_redstone_ore": {
        output: "minecraft:redstone"
    },
    "minecraft:deepslate_coal_ore": {
        output: "minecraft:coal"
    },
    "minecraft:deepslate_emerald_ore": {
        output: "minecraft:emerald"
    },
    "minecraft:quartz_ore": {
        output: "minecraft:quartz"
    },
    "minecraft:ancient_debris": {
        output: "minecraft:netherite_scrap"
    },
    "minecraft:nether_gold_ore": {
        output: "minecraft:gold_ingot"
    },
    "minecraft:deepslate_emerald_ore": {
        output: "minecraft:emerald"
    },
    "minecraft:porkchop": {
        output: "minecraft:cooked_porkchop"
    },
    "minecraft:beef": {
        output: "minecraft:cooked_beef"
    },
    "minecraft:chicken": {
        output: "minecraft:cooked_chicken"
    },
    "minecraft:cod": {
        output: "minecraft:cooked_cod"
    },
    "minecraft:salmon": {
        output: "minecraft:cooked_salmon"
    },
    "minecraft:potato": {
        output: "minecraft:baked_potato"
    },
    "minecraft:mutton": {
        output: "minecraft:cooked_mutton"
    },
    "minecraft:rabbit": {
        output: "minecraft:cooked_rabbit"
    },
    "minecraft:kelp": {
        output: "minecraft:dried_kelp"
    },
    "minecraft:sand": {
        output: "minecraft:glass"
    },
    "minecraft:cobblestone": {
        output: "minecraft:stone"
    },
    "minecraft:sandstone": {
        output: "minecraft:smooth_sandstone"
    },
    "minecraft:red_sandstone": {
        output: "minecraft:smooth_red_sandstone"
    },
    "minecraft:stone": {
        output: "minecraft:smooth_stone"
    },
    "minecraft:quartz_block": {
        output: "minecraft:quartz_block"
    },
    "minecraft:clay_ball": {
        output: "minecraft:brick"
    },
    "minecraft:netherrack": {
        output: "minecraft:netherbrick"
    },
    "minecraft:nether_brick": {
        output: "minecraft:cracked_nether_bricks"
    },
    "minecraft:basalt": {
        output: "minecraft:smooth_basalt"
    },
    "minecraft:clay": {
        output: "minecraft:hardened_clay"
    },
    "minecraft:stonebrick": {
        output: "minecraft:stonebrick"
    },
    "minecraft:polished_blackstone_bricks": {
        output: "minecraft:cracked_polished_blackstone_bricks"
    },
    "minecraft:coobled_deepslate": {
        output: "minecraft:deepslate"
    },
    "minecraft:deepslate_bricks": {
        output: "minecraft:cracked_deepslate_bricks"
    },
    "minecraft:deepslate_tiles": {
        output: "minecraft:cracked_deepslate_tiles"
    },
    "minecraft:cactus": {
        output: "minecraft:green_dye"
    },
    "minecraft:oak_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:spruce_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:birch_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:jungle_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:acacia_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:dark_oak_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:cherry_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:mangrove_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:stripped_oak_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:stripped_spruce_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:stripped_birch_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:stripped_jungle_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:stripped_acacia_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:stripped_dark_oak_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:stripped_cherry_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:stripped_mangrove_log": {
        output: "minecraft:charcoal"
    },
    "minecraft:wood": {
        output: "minecraft:charcoal"
    },
    "minecraft:chorus_fruit": {
        output: "minecraft:popped_chorus_fruit"
    },
    "minecraft:sea_pickle": {
        output: "minecraft:lime_dye"
    },
}

export const infusing = {
    'minecraft:redstone': {
        'minecraft:iron_ingot': {
            output: 'utilitycraft:energized_iron_ingot', required: 4
        },
        'utilitycraft:iron_dust': {
            output: 'utilitycraft:energized_iron_dust', required: 4
        },
        'utilitycraft:steel_plate': {
            output: 'utilitycraft:chip', required: 2
        }
    },
    'utilitycraft:gold_dust': {
        'utilitycraft:chip': {
            output: 'utilitycraft:basic_chip', required: 2
        }
    },
    'utilitycraft:energized_iron_dust': {
        'utilitycraft:basic_chip': {
            output: 'utilitycraft:advanced_chip', required: 2
        }
    },
    'utilitycraft:diamond_dust': {
        'utilitycraft:advanced_chip': {
            output: 'utilitycraft:expert_chip', required: 2
        }
    },
    'utilitycraft:netherite_dust': {
        'utilitycraft:expert_chip': {
            output: 'utilitycraft:ultimate_chip', required: 2
        }
    },
    'minecraft:coal': {
        'minecraft:iron_ingot': {
            output: 'utilitycraft:steel_ingot', required: 1
        },
        'utilitycraft:iron_dust': {
            output: 'utilitycraft:steel_dust', required: 1
        },
        'minecraft:cobblestone': {
            output: 'minecraft:blackstone', required: 1
        }
    },
    'minecraft:charcoal': {
        'minecraft:iron_ingot': {
            output: 'utilitycraft:steel_ingot', required: 1
        },
        'utilitycraft:iron_dust': {
            output: 'utilitycraft:steel_dust', required: 1
        },
        'minecraft:cobblestone': {
            output: 'minecraft:blackstone', required: 1
        }
    },
    'utilitycraft:coal_dust': {
        'minecraft:iron_ingot': {
            output: 'utilitycraft:steel_ingot', required: 1
        },
        'utilitycraft:iron_dust': {
            output: 'utilitycraft:steel_dust', required: 1
        },
        'minecraft:cobblestone': {
            output: 'minecraft:blackstone', required: 1
        }
    },
    'utilitycraft:charcoal_dust': {
        'minecraft:iron_ingot': {
            output: 'utilitycraft:steel_ingot', required: 1
        },
        'utilitycraft:iron_dust': {
            output: 'utilitycraft:steel_dust', required: 1
        },
        'minecraft:cobblestone': {
            output: 'minecraft:blackstone', required: 1
        }
    },
    'minecraft:blaze_powder': {
        'minecraft:cobblestone': {
            output: 'minecraft:netherrack', required: 1
        },
        'minecraft:sand': {
            output: 'minecraft:soul_sand', required: 1
        },
        'minecraft:dirt': {
            output: 'minecraft:soul_soil', required: 1
        }
    },
    'utilitycraft:ender_pearl_dust': {
        'minecraft:cobblestone': {
            output: 'minecraft:end_stone', required: 1
        }
    },
    "minecraft:coal_block": {
        'minecraft:iron_block': {
            output: 'utilitycraft:steel_block', required: 1
        },
        'utilitycraft:compressed_cobblestone': {
            output: 'utilitycraft:compressed_blackstone', required: 1
        }
    },
    "minecraft:redstone_block": {
        'minecraft:iron_block': {
            output: 'utilitycraft:energized_iron_block', required: 4
        }
    },
    "utilitycraft:netherite_scrap_dust": {
        'minecraft:gold_ingot': {
            output: 'minecraft:netherite_ingot', required: 4
        },
        'utilitycraft:gold_dust': {
            output: 'utilitycraft:netherite_dust', required: 4
        }
    }
}

export const melting = {
    'minecraft:cobblestone': {
        type: 'lava', amount: 250
    },
    'minecraft:stone': {
        type: 'lava', amount: 250
    },
    'minecraft:diorite': {
        type: 'lava', amount: 250
    },
    'minecraft:granite': {
        type: 'lava', amount: 250
    },
    'minecraft:blackstone': {
        type: 'lava', amount: 250
    },
    'minecraft:netherrack': {
        type: 'lava', amount: 1000
    },
    'minecraft:magma': {
        type: 'lava', amount: 1000
    },
    'minecraft:magma_cream': {
        type: 'lava', amount: 250
    }
}

export const growing = {
    'minecraft:acacia_sapling': {
        cost: 8000,
        drops: [
            { item: 'minecraft:acacia_log', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:acacia_leaves', min: 0, max: 4, prob: 100 },
            { item: 'minecraft:stick', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:acacia_sapling', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:apple_tree_sapling': {
        cost: 8000,
        drops: [
            { item: 'minecraft:log', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:leaves', min: 0, max: 4, prob: 100 },
            { item: 'minecraft:stick', min: 6, max: 10, prob: 100 },
            { item: 'utilitycraft:apple_sapling', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:apple', min: 1, max: 4, prob: 100 },
            { item: 'minecraft:enchanted_golden_apple', min: 1, max: 1, prob: 0.0001 },
            { item: 'minecraft:golden_apple', min: 1, max: 1, prob: 0.1 }
        ]
    },
    'minecraft:bamboo': {
        cost: 8000,
        drops: [
            { item: 'minecraft:bamboo', min: 4, max: 8, prob: 100 }
        ]
    },
    'minecraft:beetroot_seeds': {
        cost: 8000,
        drops: [
            { item: 'minecraft:beetroot', min: 2, max: 4, prob: 100 },
            { item: 'minecraft:beetroot_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:birch_sapling': {
        cost: 8000,
        drops: [
            { item: 'minecraft:birch_log', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:birch_leaves', min: 0, max: 4, prob: 100 },
            { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
            { item: 'minecraft:birch_sapling', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:cactus': {
        cost: 8000,
        drops: [
            { item: 'minecraft:cactus', min: 2, max: 4, prob: 100 }
        ]
    },
    'minecraft:carrot': {
        cost: 8000,
        drops: [
            { item: 'minecraft:carrot', min: 2, max: 4, prob: 100 },
            { item: 'minecraft:golden_carrot', min: 1, max: 1, prob: 0.1 }
        ]
    },
    'minecraft:cherry_sapling': {
        cost: 8000,
        drops: [
            { item: 'minecraft:cherry_log', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:cherry_leaves', min: 0, max: 4, prob: 100 },
            { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
            { item: 'minecraft:cherry_sapling', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:chorus_flower': {
        cost: 8000,
        drops: [
            { item: 'minecraft:chorus_fruit', min: 1, max: 2, prob: 100 },
            { item: 'minecraft:chorus_flower', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:crimson_fungus': {
        cost: 8000,
        drops: [
            { item: 'minecraft:crimson_stem', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:nether_wart_block', min: 0, max: 4, prob: 100 },
            { item: 'minecraft:shroomlight', min: 1, max: 4, prob: 100 },
            { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
            { item: 'minecraft:crimson_fungus', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:dark_oak_sapling': {
        cost: 8000,
        drops: [
            { item: 'minecraft:dark_oak_log', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:dark_oak_leaves', min: 0, max: 4, prob: 100 },
            { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
            { item: 'minecraft:dark_oak_sapling', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:jungle_sapling': {
        cost: 8000,
        drops: [
            { item: 'minecraft:jungle_log', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:jungle_leaves', min: 0, max: 4, prob: 100 },
            { item: 'minecraft:cocoa_beans', min: 1, max: 4, prob: 100 },
            { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
            { item: 'minecraft:jungle_sapling', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:kelp': {
        cost: 8000,
        drops: [
            { item: 'minecraft:kelp', min: 4, max: 8, prob: 100 }
        ]
    },
    'minecraft:mangrove_propagule': {
        cost: 8000,
        drops: [
            { item: 'minecraft:mangrove_log', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:mangrove_leaves', min: 0, max: 4, prob: 100 },
            { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
            { item: 'minecraft:mangrove_propagule', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:melon_seeds': {
        cost: 8000,
        drops: [
            { item: 'minecraft:melon_slice', min: 2, max: 4, prob: 100 },
            { item: 'minecraft:melon_block', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:red_mushroom': {
        cost: 8000,
        drops: [
            { item: 'minecraft:red_mushroom', min: 2, max: 4, prob: 100 }
        ]
    },
    'minecraft:brown_mushroom': {
        cost: 8000,
        drops: [
            { item: 'minecraft:brown_mushroom', min: 2, max: 4, prob: 100 }
        ]
    },
    'minecraft:nether_wart': {
        cost: 8000,
        drops: [
            { item: 'minecraft:nether_wart', min: 4, max: 8, prob: 100 }
        ]
    },
    'minecraft:oak_sapling': {
        cost: 8000,
        drops: [
            { item: 'minecraft:log', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:leaves', min: 0, max: 4, prob: 100 },
            { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
            { item: 'minecraft:oak_sapling', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:pale_oak_sapling': {
        cost: 8000,
        drops: [
            { item: 'minecraft:pale_oak_log', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:pale_oak_leaves', min: 0, max: 4, prob: 100 },
            { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
            { item: 'minecraft:pale_oak_sapling', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:potato': {
        cost: 8000,
        drops: [
            { item: 'minecraft:potato', min: 2, max: 4, prob: 100 },
            { item: 'minecraft:poisonous_potato', min: 1, max: 1, prob: 10 }
        ]
    },
    'minecraft:pumpkin_seeds': {
        cost: 8000,
        drops: [
            { item: 'minecraft:pumpkin', min: 2, max: 4, prob: 100 },
            { item: 'minecraft:pumpkin_pie', min: 1, max: 1, prob: 0.1 }
        ]
    },
    'minecraft:spruce_sapling': {
        cost: 8000,
        drops: [
            { item: 'minecraft:spruce_log', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:spruce_leaves', min: 0, max: 4, prob: 100 },
            { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
            { item: 'minecraft:spruce_sapling', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:sugar_cane': {
        cost: 8000,
        drops: [
            { item: 'minecraft:sugar_cane', min: 4, max: 8, prob: 100 }
        ]
    },
    'minecraft:sweet_berries': {
        cost: 8000,
        drops: [
            { item: 'minecraft:sweet_berries', min: 2, max: 4, prob: 100 }
        ]
    },
    'minecraft:warped_fungus': {
        cost: 8000,
        drops: [
            { item: 'minecraft:warped_stem', min: 6, max: 10, prob: 100 },
            { item: 'minecraft:warped_wart_block', min: 0, max: 4, prob: 100 },
            { item: 'minecraft:shroomlight', min: 1, max: 4, prob: 100 },
            { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
            { item: 'minecraft:warped_fungus', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:wheat_seeds': {
        cost: 8000,
        drops: [
            { item: 'minecraft:wheat', min: 2, max: 4, prob: 100 },
            { item: 'minecraft:wheat_seeds', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:bread', min: 1, max: 1, prob: 0.1 }
        ]
    },
    'utilitycraft:coal_seeds': {
        cost: 64000,
        drops: [
            { item: 'minecraft:coal', min: 2, max: 4, prob: 100 },
            { item: 'utilitycraft:coal_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:copper_seeds': {
        cost: 64000,
        drops: [
            { item: 'minecraft:raw_copper', min: 2, max: 4, prob: 100 },
            { item: 'utilitycraft:copper_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:dyes_seeds': {
        cost: 64000,
        drops: [
            { item: 'minecraft:black_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:blue_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:brown_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:cyan_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:gray_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:green_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:light_blue_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:light_gray_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:lime_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:magenta_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:orange_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:pink_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:purple_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:red_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:white_dye', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:yellow_dye', min: 1, max: 1, prob: 5 },
            { item: 'utilitycraft:dyes_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:glass_seeds': {
        cost: 64000,
        drops: [
            { item: 'minecraft:glass', min: 8, max: 16, prob: 100 },
            { item: 'utilitycraft:glass_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:gunpowder_seeds': {
        cost: 64000,
        drops: [
            { item: 'minecraft:gunpowder', min: 4, max: 8, prob: 100 },
            { item: 'utilitycraft:gunpowder_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:iron_seeds': {
        cost: 64000,
        drops: [
            { item: 'minecraft:raw_iron', min: 1, max: 3, prob: 100 },
            { item: 'utilitycraft:iron_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:leather_seeds': {
        cost: 64000,
        drops: [
            { item: 'minecraft:leather', min: 4, max: 8, prob: 100 },
            { item: 'utilitycraft:leather_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:prismarine_crystals_seeds': {
        cost: 64000,
        drops: [
            { item: 'minecraft:prismarine_crystals', min: 8, max: 12, prob: 100 },
            { item: 'utilitycraft:prismarine_crystals_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:prismarine_shards_seeds': {
        cost: 64000,
        drops: [
            { item: 'minecraft:prismarine_shard', min: 8, max: 12, prob: 100 },
            { item: 'utilitycraft:prismarine_shards_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:water_seeds': {
        cost: 64000,
        drops: [
            { item: 'utilitycraft:water_ball', min: 1, max: 2, prob: 100 },
            { item: 'utilitycraft:water_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:wool_seeds': {
        cost: 64000,
        drops: [
            { item: 'minecraft:wool', min: 2, max: 4, prob: 100 },
            { item: 'utilitycraft:wool_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:ghast_seeds': {
        cost: 128000,
        drops: [
            { item: 'minecraft:ghast_tear', min: 1, max: 2, prob: 100 },
            { item: 'utilitycraft:ghast_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:glowstone_seeds': {
        cost: 128000,
        drops: [
            { item: 'minecraft:glowstone_dust', min: 2, max: 4, prob: 100 },
            { item: 'utilitycraft:glowstone_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:gold_seeds': {
        cost: 128000,
        drops: [
            { item: 'minecraft:raw_gold', min: 1, max: 3, prob: 100 },
            { item: 'utilitycraft:gold_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:honey_seeds': {
        cost: 128000,
        drops: [
            { item: 'utilitycraft:honey_ball', min: 1, max: 2, prob: 100 },
            { item: 'utilitycraft:honey_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:lapis_seeds': {
        cost: 128000,
        drops: [
            { item: 'minecraft:lapis_lazuli', min: 4, max: 9, prob: 100 },
            { item: 'utilitycraft:lapis_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:lava_seeds': {
        cost: 128000,
        drops: [
            { item: 'utilitycraft:lava_ball', min: 1, max: 2, prob: 100 },
            { item: 'utilitycraft:lava_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:quartz_seeds': {
        cost: 128000,
        drops: [
            { item: 'minecraft:quartz', min: 4, max: 8, prob: 100 },
            { item: 'utilitycraft:quartz_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:redstone_seeds': {
        cost: 128000,
        drops: [
            { item: 'minecraft:redstone', min: 3, max: 8, prob: 100 },
            { item: 'utilitycraft:redstone_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:slime_seeds': {
        cost: 128000,
        drops: [
            { item: 'minecraft:slime_ball', min: 1, max: 3, prob: 100 },
            { item: 'utilitycraft:slime_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:amethyst_seeds': {
        cost: 512000,
        drops: [
            { item: 'minecraft:amethyst_shard', min: 2, max: 4, prob: 100 },
            { item: 'utilitycraft:amethyst_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:blaze_seeds': {
        cost: 512000,
        drops: [
            { item: 'minecraft:blaze_rod', min: 1, max: 2, prob: 100 },
            { item: 'utilitycraft:blaze_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:diamond_seeds': {
        cost: 512000,
        drops: [
            { item: 'minecraft:diamond', min: 1, max: 1, prob: 100 },
            { item: 'utilitycraft:diamond_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:emerald_seeds': {
        cost: 512000,
        drops: [
            { item: 'minecraft:emerald', min: 1, max: 1, prob: 100 },
            { item: 'utilitycraft:emerald_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:enderpearl_seeds': {
        cost: 512000,
        drops: [
            { item: 'minecraft:ender_pearl', min: 1, max: 1, prob: 100 },
            { item: 'utilitycraft:enderpearl_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:obsidian_seeds': {
        cost: 512000,
        drops: [
            { item: 'minecraft:obsidian', min: 1, max: 2, prob: 100 },
            { item: 'utilitycraft:obsidian_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:netherite_seeds': {
        cost: 1024000,
        drops: [
            { item: 'minecraft:netherite_scrap', min: 1, max: 1, prob: 100 },
            { item: 'utilitycraft:netherite_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:nether_star_seeds': {
        cost: 1024000,
        drops: [
            { item: 'minecraft:nether_star', min: 1, max: 1, prob: 100 },
            { item: 'utilitycraft:nether_star_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:shulker_seeds': {
        cost: 1024000,
        drops: [
            { item: 'minecraft:shulker_shell', min: 1, max: 1, prob: 100 },
            { item: 'utilitycraft:shulker_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:totem_seeds': {
        cost: 1024000,
        drops: [
            { item: 'minecraft:totem_of_undying', min: 1, max: 1, prob: 100 },
            { item: 'utilitycraft:totem_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'utilitycraft:wither_seeds': {
        cost: 1024000,
        drops: [
            { item: 'minecraft:wither_skeleton_skull', min: 1, max: 1, prob: 100 },
            { item: 'utilitycraft:wither_seeds', min: 1, max: 1, prob: 5 }
        ]
    },
    'minecraft:poppy': {
        cost: 64000,
        drops: [
            { item: 'minecraft:dandelion', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:poppy', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:blue_orchid', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:allium', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:azure_bluet', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:red_tulip', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:orange_tulip', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:white_tulip', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:pink_tulip', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:oxeye_daisy', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:cornflower', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:lily_of_the_valley', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:sunflower', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:lilac', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:rose_bush', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:peony', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:pitcher_plant', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:torchflower', min: 1, max: 1, prob: 5 },
            { item: 'minecraft:cactus_flower', min: 1, max: 1, prob: 5 }
        ]
    },
    "minecraft:glow_berries": {
        cost: 8000,
        drops: [
            { item: 'minecraft:glow_berries', min: 1, max: 16, prob: 100 }
        ]
    }
}

export const crafting = {
    "steel_ingot,iron_ingot,steel_ingot,gold_ingot,redstone_block,gold_ingot,steel_ingot,iron_ingot,steel_ingot": {
        output: "utilitycraft:machine_case",
        amount: 1
    },
    // Batteries
    "basic_chip,redstone,basic_chip,redstone,redstone_block,redstone,basic_chip,gold_dust,basic_chip": {
        output: "utilitycraft:basic_battery",
        amount: 1
    },
    "advanced_chip,basic_battery,advanced_chip,basic_battery,redstone_block,basic_battery,advanced_chip,energized_iron_dust,advanced_chip": {
        output: "utilitycraft:advanced_battery",
        amount: 1
    },
    "expert_chip,advanced_battery,expert_chip,advanced_battery,redstone_block,advanced_battery,expert_chip,diamond_dust,expert_chip": {
        output: "utilitycraft:expert_battery",
        amount: 1
    },
    "ultimate_chip,expert_battery,ultimate_chip,expert_battery,redstone_block,expert_battery,ultimate_chip,netherite_dust,ultimate_chip": {
        output: "utilitycraft:ultimate_battery",
        amount: 1
    },
    // Furnators
    "steel_ingot,basic_chip,steel_ingot,basic_chip,blast_furnace,basic_chip,iron_ingot,redstone_block,iron_ingot": {
        output: "utilitycraft:basic_furnator",
        amount: 1
    },
    "steel_plate,advanced_chip,steel_plate,advanced_chip,basic_furnator,advanced_chip,energized_iron_plate,redstone_block,energized_iron_plate": {
        output: "utilitycraft:advanced_furnator",
        amount: 1
    },
    "steel_plate,expert_chip,steel_plate,expert_chip,advanced_furnator,expert_chip,diamond_dust,redstone_block,diamond_dust": {
        output: "utilitycraft:expert_furnator",
        amount: 1
    },
    "steel_plate,ultimate_chip,steel_plate,ultimate_chip,expert_furnator,ultimate_chip,netherite_plate,redstone_block,netherite_plate": {
        output: "utilitycraft:ultimate_furnator",
        amount: 1
    },
    // Magmators
    "gold_plate,basic_fluid_tank,gold_plate,basic_chip,furnace,basic_chip,steel_plate,basic_chip,steel_plate": {
        output: "utilitycraft:basic_magmator",
        amount: 1
    },
    "energized_iron_plate,advanced_fluid_tank,energized_iron_plate,advanced_chip,basic_magmator,advanced_chip,steel_plate,advanced_chip,steel_plate": {
        output: "utilitycraft:advanced_magmator",
        amount: 1
    },
    "diamond_dust,expert_fluid_tank,diamond_dust,expert_chip,advanced_magmator,expert_chip,steel_plate,expert_chip,steel_plate": {
        output: "utilitycraft:expert_magmator",
        amount: 1
    },
    "netherite_plate,ultimate_fluid_tank,netherite_plate,ultimate_chip,expert_magmator,ultimate_chip,netherite_plate,ultimate_chip,netherite_plate": {
        output: "utilitycraft:ultimate_magmator",
        amount: 1
    },
    // Solar Panels
    "steel_ingot,basic_chip,steel_ingot,basic_chip,gold_ingot,basic_chip,gold_ingot,redstone_block,gold_ingot": {
        output: "utilitycraft:basic_solar_panel",
        amount: 1
    },
    "steel_plate,advanced_chip,steel_plate,advanced_chip,basic_solar_panel,advanced_chip,energized_iron_plate,redstone_block,energized_iron_plate": {
        output: "utilitycraft:advanced_solar_panel",
        amount: 1
    },
    "steel_plate,expert_chip,steel_plate,expert_chip,advanced_solar_panel,expert_chip,diamond_dust,redstone_block,diamond_dust": {
        output: "utilitycraft:expert_solar_panel",
        amount: 1
    },
    "steel_plate,ultimate_chip,steel_plate,ultimate_chip,expert_solar_panel,ultimate_chip,netherite_plate,redstone_block,netherite_plate": {
        output: "utilitycraft:ultimate_solar_panel",
        amount: 1
    },
    // Thermo Generator
    "copper_block,copper_plate,copper_block,basic_chip,basic_fluid_tank,basic_chip,gold_plate,copper_block,gold_plate": {
        output: "utilitycraft:basic_thermo_generator",
        amount: 1
    },
    "copper_block,advanced_fluid_tank,copper_block,advanced_chip,basic_thermo_generator,advanced_chip,energized_iron_plate,copper_block,energized_iron_plate": {
        output: "utilitycraft:advanced_thermo_generator",
        amount: 1
    },
    "copper_block,expert_fluid_tank,copper_block,expert_chip,advanced_thermo_generator,expert_chip,diamond_dust,copper_block,diamond_dust": {
        output: "utilitycraft:expert_thermo_generator",
        amount: 1
    },
    "copper_block,ultimate_fluid_tank,copper_block,ultimate_chip,expert_thermo_generator,ultimate_chip,netherite_plate,copper_block,netherite_plate": {
        output: "utilitycraft:ultimate_thermo_generator",
        amount: 1
    },
    // Tanks
    "gold_plate,glass,gold_plate,glass,basic_chip,glass,gold_plate,glass,gold_plate": {
        output: "utilitycraft:basic_fluid_tank",
        amount: 1
    },
    "energized_iron_ingot,basic_fluid_tank,energized_iron_ingot,basic_fluid_tank,advanced_chip,basic_fluid_tank,energized_iron_ingot,glass,energized_iron_ingot": {
        output: "utilitycraft:advanced_fluid_tank",
        amount: 1
    },
    "diamond_dust,advanced_fluid_tank,diamond_dust,advanced_fluid_tank,expert_chip,advanced_fluid_tank,diamond_dust,glass,diamond_dust": {
        output: "utilitycraft:expert_fluid_tank",
        amount: 1
    },
    "netherite_dust,expert_fluid_tank,netherite_dust,expert_fluid_tank,ultimate_chip,expert_fluid_tank,netherite_dust,glass,netherite_dust": {
        output: "utilitycraft:ultimate_fluid_tank",
        amount: 1
    },
    "steel_ingot,iron_bars,hopper,steel_ingot,iron_bars,hopper": {
        output: "utilitycraft:xp_drain",
        amount: 1
    },
    "steel_ingot,dropper,lever,iron_ingot,steel_ingot,dropper,lever,iron_ingot": {
        output: "utilitycraft:xp_spout",
        amount: 1
    },
    // Machines
    "iron_plate,expert_chip,iron_plate,expert_chip,machine_case,expert_chip,steel_plate,crafter,steel_plate": {
        output: "utilitycraft:assembler",
        amount: 1
    },
    "redstone,sieve,redstone,chip,machine_case,chip,redstone,gold_block,redstone": {
        output: "utilitycraft:autosieve",
        amount: 1
    },
    "redstone,iron_pickaxe,redstone,chip,machine_case,chip,redstone,iron_plate,redstone": {
        output: "utilitycraft:block_breaker",
        amount: 1
    },
    "redstone,dropper,redstone,chip,machine_case,chip,redstone,iron_plate,redstone": {
        output: "utilitycraft:block_placer",
        amount: 1
    },
    "redstone,iron_hammer,redstone,chip,machine_case,chip,redstone,gold_ingot,redstone": {
        output: "utilitycraft:crusher",
        amount: 1
    },
    "iron_plate,expert_chip,iron_plate,expert_chip,machine_case,expert_chip,steel_plate,blueprint_paper,steel_plate": {
        output: "utilitycraft:digitizer",
        amount: 1
    },
    "redstone,piston,redstone,chip,machine_case,chip,redstone,compressed_cobblestone,redstone": {
        output: "utilitycraft:electro_press",
        amount: 1
    },
    "gold_plate,iron_hoe,gold_plate,advanced_chip,machine_case,advanced_chip,gold_plate,redstone_block,gold_plate": {
        output: "utilitycraft:harvester",
        amount: 1
    },
    "gold_plate,blast_furnace,gold_plate,basic_chip,machine_case,basic_chip,gold_plate,redstone_block,gold_plate": {
        output: "utilitycraft:incinerator",
        amount: 1
    },
    "gold_plate,anvil,gold_plate,advanced_chip,machine_case,advanced_chip,gold_plate,redstone_block,gold_plate": {
        output: "utilitycraft:induction_anvil",
        amount: 1
    },
    "redstone,lapis_lazuli,redstone,basic_chip,machine_case,basic_chip,redstone,redstone_block,redstone": {
        output: "utilitycraft:infuser",
        amount: 1
    },
    "gold_plate,copper_plate,gold_plate,advanced_chip,machine_case,advanced_chip,redstone_block,netherite_plate,redstone_block": {
        output: "utilitycraft:magmatic_chamber",
        amount: 1
    },
    "gold_plate,amethyst_shard,gold_plate,expert_chip,machine_case,expert_chip,gold_plate,redstone_block,gold_plate": {
        output: "utilitycraft:seed_synthesizer",
        amount: 1
    },
    "ender_eye,echo_shard,ender_eye,expert_chip,machine_case,expert_chip,lapis_block,diamond_dust,lapis_block": {
        output: "utilitycraft:waycenter",
        amount: 1
    },
    "steel_plate,emerald_dust,steel_plate,expert_chip,machine_case,expert_chip,steel_plate,lapis_block,steel_plate": {
        output: "utilitycraft:xp_condenser",
        amount: 1
    },
    // Item Transport
    "redstone,asphalt,redstone,air,air,air,air,air,air": {
        output: "utilitycraft:conveyor_horizontal",
        amount: 4
    },
    "air,air,redstone,air,asphalt,air,redstone,air,air": {
        output: "utilitycraft:conveyor_inclined",
        amount: 4
    },
    "steel_ingot,air,steel_ingot,steel_ingot,dropper,steel_ingot,air,steel_ingot,air": {
        output: "utilitycraft:mechanic_dropper",
        amount: 1
    },
    "steel_ingot,air,steel_ingot,steel_ingot,hopper,steel_ingot,air,steel_ingot,air": {
        output: "utilitycraft:mechanic_hopper",
        amount: 1
    },
    "mechanic_upper,air,air,air,air,air,air,air,air": {
        output: "utilitycraft:mechanic_hopper",
        amount: 1
    },
    "mechanic_hopper,air,air,air,air,air,air,air,air": {
        output: "utilitycraft:mechanic_upper",
        amount: 1
    },
    "steel_nugget,steel_nugget,steel_nugget,glass,chest,glass,steel_nugget,steel_nugget,steel_nugget": {
        output: "utilitycraft:item_conduit",
        amount: 8
    },
    "air,item_conduit,air,item_conduit,hopper,item_conduit,air,item_conduit,air": {
        output: "utilitycraft:item_exporter",
        amount: 1
    },
    // Cables
    "air,fluid_pipe,air,fluid_pipe,hopper,fluid_pipe,air,fluid_pipe,air": {
        output: "utilitycraft:fluid_extractor",
        amount: 1
    },
    "steel_nugget,steel_nugget,steel_nugget,glass,bucket,glass,steel_nugget,steel_nugget,steel_nugget": {
        output: "utilitycraft:fluid_pipe",
        amount: 8
    },
    "gold_ingot,hopper,gold_ingot,glass,dispenser,glass,steel_ingot,gold_ingot,steel_ingot": {
        output: "utilitycraft:fluid_pump",
        amount: 1
    },
    "steel_nugget,redstone,steel_nugget,copper_nugget,copper_nugget,copper_nugget,steel_nugget,redstone,steel_nugget": {
        output: "utilitycraft:energy_cable",
        amount: 8
    },
    // Upgrades
    "steel_ingot,iron_ingot,steel_ingot,redstone,gold_ingot,redstone,steel_ingot,redstone,steel_ingot": {
        output: "utilitycraft:base_upgrade",
        amount: 1
    },
    "redstone,comparator,redstone,steel_ingot,base_upgrade,steel_ingot,redstone,hopper,redstone": {
        output: "utilitycraft:filter_upgrade",
        amount: 1
    },
    "steel_plate,diamond_dust,steel_plate,diamond_dust,base_upgrade,diamond_dust,steel_plate,redstone_block,steel_plate": {
        output: "utilitycraft:energy_upgrade",
        amount: 1
    },
    "steel_ingot,cyan_dye,steel_ingot,lapis_block,base_upgrade,lapis_block,steel_ingot,spawner_core,steel_ingot": {
        output: "utilitycraft:quantity_upgrade",
        amount: 1
    },
    "steel_plate,blue_dye,steel_plate,redstone,base_upgrade,redstone,steel_plate,gold_ingot,steel_plate": {
        output: "utilitycraft:range_upgrade",
        amount: 1
    },
    "steel_plate,emerald_dust,steel_plate,redstone_block,base_upgrade,redstone_block,steel_plate,emerald_block,steel_plate": {
        output: "utilitycraft:speed_upgrade",
        amount: 1
    },
    // Other Stuff
    "air,ender_eye,air,steel_plate,expert_chip,steel_plate,air,air,air": {
        output: "utilitycraft:waycarpet",
        amount: 1
    },
    "lapis_lazuli,ender_pearl_dust,lapis_lazuli,ender_pearl_dust,base_upgrade,ender_pearl_dust,lapis_lazuli,ender_pearl_dust,lapis_lazuli": {
        output: "utilitycraft:way_chip",
        amount: 1
    },
    "lapis_lazuli,soul_soil,lapis_lazuli,soul_sand,glass_bottle,soul_sand,lapis_lazuli,soul_soil,lapis_lazuli": {
        output: "utilitycraft:essence_vessel",
        amount: 1
    },
    "crying_obsidian,diamond,crying_obsidian,iron_bars,spawner_core,iron_bars,crying_obsidian,iron_bars,crying_obsidian": {
        output: "utilitycraft:mechanical_spawner",
        amount: 1
    },
    "redstone_block,soul_sand,redstone_block,soul_sand,diamond_block,soul_sand,redstone_block,soul_sand,redstone_block": {
        output: "utilitycraft:spawner_core",
        amount: 1
    },
    "obsidian,ender_eye,obsidian,obsidian,chest,obsidian,air,obsidian,": {
        output: "utilitycraft:ender_hopper",
        amount: 1
    },
    "iron_ingot,redstone,iron_ingot,steel_ingot,machine_case,steel_ingot,iron_ingot,redstone,iron_ingot": {
        output: "utilitycraft:fan",
        amount: 1
    },
    "air,iron_ingot,air,iron_sword,redstone_block,iron_sword,cobblestone,cobblestone,cobblestone": {
        output: "utilitycraft:mob_grinder",
        amount: 1
    },
    "experience_bottle,experience_bottle,experience_bottle,experience_bottle,ender_eye,experience_bottle,experience_bottle,experience_bottle,experience_bottle": {
        output: "utilitycraft:xp_magnet",
        amount: 1
    },
    // Utility Table
    "diamond,diamond_sword,diamond,string,diamond_paxel,diamond_hoe,stick,string,diamond": {
        output: "utilitycraft:diamond_aiot",
        amount: 1
    },
    "gold_ingot,golden_sword,gold_ingot,string,golden_paxel,golden_hoe,stick,string,gold_ingot": {
        output: "utilitycraft:golden_aiot",
        amount: 1
    },
    "iron_ingot,iron_sword,iron_ingot,string,iron_paxel,iron_hoe,stick,string,iron_ingot": {
        output: "utilitycraft:iron_aiot",
        amount: 1
    },
    "cobblestone,stone_sword,cobblestone,string,stone_paxel,stone_hoe,stick,string,cobblestone": {
        output: "utilitycraft:stone_aiot",
        amount: 1
    },
    "air,iron_ingot,iron_block,repeater,amethyst_block,iron_ingot,redstone_block,repeater,air": {
        output: "utilitycraft:drill",
        amount: 1
    },
    "air,diamond,diamond_block,repeater,drill,diamond,redstone_block,repeater,air": {
        output: "utilitycraft:heavy_drill",
        amount: 1
    },
    "cobblestone,stone,cobblestone,cobblestone,stick,cobblestone,air,stick,air": {
        output: "utilitycraft:stone_hammer",
        amount: 1
    },
    "iron_ingot,iron_block,iron_ingot,iron_ingot,stick,iron_ingot,air,stick,air": {
        output: "utilitycraft:iron_hammer",
        amount: 1
    },
    "diamond,diamond_block,diamond,diamond,stick,diamond,air,stick,air": {
        output: "utilitycraft:diamond_hammer",
        amount: 1
    }
}

// Machines Config, you can modify machine stats here

export const crusher = { energyCost: 800, rateSpeedBase: 20, energyCap: 64000, entity: 'utilitycraft:machine_general', nameTag: 'entity.utilitycraft:crusher.name', recipes: crushing }

export const autosieve = { energyCost: 2000, rateSpeedBase: 50, energyCap: 160000, entity: 'utilitycraft:machine3x3', nameTag: 'entity.utilitycraft:autosieve.name', recipes: sieving, mesh: meshMulti }

export const incinerator = { energyCost: 800, rateSpeedBase: 20, energyCap: 64000, entity: 'utilitycraft:machine_general', nameTag: 'entity.utilitycraft:incinerator.name', recipes: smelting }

export const blockPlacer = { energyCost: 800, energyCap: 64000, entity: 'utilitycraft:machine1x1', nameTag: 'entity.utilitycraft:block_placer.name' }

export const blockBreaker = { energyCost: 800, energyCap: 64000, entity: 'utilitycraft:basic_machine', nameTag: 'entity.utilitycraft:block_breaker.name', }

export const harvester = { energyCost: 800, energyCap: 64000, entity: 'utilitycraft:basic_machine', nameTag: 'entity.utilitycraft:harvester.name' }

export const electroPress = { energyCost: 800, rateSpeedBase: 20, energyCap: 64000, entity: 'utilitycraft:machine_general', nameTag: 'entity.utilitycraft:electro_press.name', recipes: pressing }

export const infuser = { energyCost: 800, rateSpeedBase: 20, energyCap: 64000, entity: 'utilitycraft:infuser', nameTag: 'entity.utilitycraft:infuser.name', recipes: infusing }

export const magmaticChamber = { energyCost: 8000, rateSpeedBase: 200, energyCap: 640000, entity: 'utilitycraft:magmatic_chamber', nameTag: 'entity.utilitycraft:magmatic_chamber.name', recipes: melting, liquidCap: 16000 }

export const seedSynthesizer = { rateSpeedBase: 160, energyCap: 512000, entity: 'utilitycraft:machine3x3', nameTag: 'entity.utilitycraft:seed_synthesizer.name', recipes: growing, soils: acceptedSoils }

export const assembler = { energyCost: 1600, rateSpeedBase: 20, energyCap: 256000, entity: 'utilitycraft:assembler', nameTag: 'entity.utilitycraft:assembler.name' }

export const digitizer = { energyCost: 100, rateSpeedBase: 5, energyCap: 8000, entity: 'utilitycraft:machine3x3', nameTag: 'entity.utilitycraft:digitizer.name', recipes: crafting }

export const inductionAnvil = { rateSpeedBase: 5, energyCap: 16000, entity: 'utilitycraft:machine1x1', nameTag: 'entity.utilitycraft:induction_anvil.name' }
