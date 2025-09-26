import { system } from "@minecraft/server";

/**
 * Base sieving drop table.
 * 
 * Each block ID maps to an array of possible drops.
 * A drop must define:
 *   - item   {string}  The item identifier
 *   - amount {number}  Quantity (default = 1)
 *   - chance {number}  Drop probability (0.0 – 1.0, default = 0.1)
 */
export const sieveDrops = {
    'minecraft:gravel': [
        { item: 'minecraft:flint', amount: 1, chance: 0.20 },
        { item: 'utilitycraft:iron_chunk', amount: 1, chance: 0.20 },
        { item: 'utilitycraft:coal_chunk', amount: 1, chance: 0.30 },
        { item: 'utilitycraft:gold_chunk', amount: 1, chance: 0.10 },
        { item: 'utilitycraft:lapislazuli_chunk', amount: 1, chance: 0.2 },
        { item: 'utilitycraft:emerald_chunk', amount: 1, chance: 0.2 },
        { item: 'utilitycraft:diamond_chunk', amount: 1, chance: 0.15 }
    ],
    'minecraft:dirt': [
        { item: 'minecraft:carrot', amount: 1, chance: 0.10 },
        { item: 'minecraft:potato', amount: 1, chance: 0.10 },
        { item: 'minecraft:wheat_seeds', amount: 1, chance: 0.10 },
        { item: 'minecraft:pumpkin_seeds', amount: 1, chance: 0.10 },
        { item: 'minecraft:beetroot_seeds', amount: 1, chance: 0.10 },
        { item: 'minecraft:melon_seeds', amount: 1, chance: 0.10 },
        { item: 'minecraft:sugar_cane', amount: 1, chance: 0.10 },
        { item: 'minecraft:bamboo', amount: 1, chance: 0.10 },
        { item: 'minecraft:acacia_sapling', amount: 1, chance: 0.10 },
        { item: 'minecraft:birch_sapling', amount: 1, chance: 0.10 },
        { item: 'minecraft:dark_oak_sapling', amount: 1, chance: 0.10 },
        { item: 'minecraft:jungle_sapling', amount: 1, chance: 0.10 },
        { item: 'minecraft:oak_sapling', amount: 1, chance: 0.10 },
        { item: 'minecraft:pale_oak_sapling', amount: 1, chance: 0.10 },
        { item: 'minecraft:spruce_sapling', amount: 1, chance: 0.10 },
        { item: 'minecraft:cherry_sapling', amount: 1, chance: 0.10 }
    ],
    'minecraft:grass': [
        { item: 'minecraft:red_flower', amount: 1, chance: 0.20 },
        { item: 'minecraft:yellow_flower', amount: 1, chance: 0.20 },
        { item: 'minecraft:double_plant', amount: 1, chance: 0.20 },
        { item: 'minecraft:torchflower', amount: 1, chance: 0.20 },
        { item: 'minecraft:pitcher_plant', amount: 1, chance: 0.20 },
        { item: 'minecraft:pink_petals', amount: 1, chance: 0.20 }
    ],
    'utilitycraft:crushed_netherrack': [
        { item: 'utilitycraft:nether_quartz_chunk', amount: 1, chance: 0.33 },
        { item: 'minecraft:gold_nugget', amount: 1, chance: 0.20 },
        { item: 'utilitycraft:nether_gold_chunk', amount: 1, chance: 0.33 },
        { item: 'utilitycraft:ancient_debris_chunk', amount: 1, chance: 0.25 }
    ],
    'minecraft:sand': [
        { item: 'minecraft:prismarine_shard', amount: 1, chance: 0.10 },
        { item: 'minecraft:prismarine_crystals', amount: 1, chance: 0.10 },
        { item: 'utilitycraft:copper_chunk', amount: 1, chance: 0.25 },
        { item: 'utilitycraft:redstone_chunk', amount: 1, chance: 0.20 },
        { item: 'minecraft:bone_meal', amount: 1, chance: 0.25 },
        { item: 'minecraft:gunpowder', amount: 1, chance: 0.12 },
        { item: 'minecraft:glowstone_dust', amount: 1, chance: 0.8 },
        { item: 'minecraft:blaze_powder', amount: 1, chance: 0.10 },
        { item: 'minecraft:cactus', amount: 1, chance: 0.10 },
        { item: 'minecraft:kelp', amount: 1, chance: 0.10 },
        { item: 'minecraft:clay_ball', amount: 1, chance: 0.10 },
        { item: 'minecraft:cocoa_beans', amount: 1, chance: 0.1 },
        { item: 'minecraft:heart_of_the_sea', amount: 1, chance: 0.01 },
        { item: 'minecraft:conduit', amount: 1, chance: 0.01 },
        // Integrated Storage
        { item: 'ae2be:certus_quartz_crystal', amount: 1, chance: 0.17 },
        { item: 'ae2be:charged_certus_quartz_crystal', amount: 1, chance: 0.1 }
    ],
    'minecraft:soul_sand': [
        { item: 'utilitycraft:nether_quartz_chunk', amount: 1, chance: 0.33 },
        { item: 'utilitycraft:nether_quartz_chunk', amount: 3, chance: 0.10 },
        { item: 'minecraft:bone', amount: 1, chance: 0.15 },
        { item: 'minecraft:ghast_tear', amount: 1, chance: 0.8 },
        { item: 'minecraft:nether_wart', amount: 1, chance: 0.12 },
        { item: 'minecraft:warped_fungus', amount: 1, chance: 0.10 },
        { item: 'minecraft:crimson_fungus', amount: 1, chance: 0.10 }
    ],
    'utilitycraft:crushed_endstone': [
        { item: 'minecraft:chorus_flower', amount: 1, chance: 0.1 },
        { item: 'minecraft:chorus_fruit', amount: 1, chance: 0.80 },
        { item: 'minecraft:ender_pearl', amount: 1, chance: 0.16 }
    ],
    'utilitycraft:crushed_cobbled_deepslate': [
        { item: 'minecraft:echo_shard', amount: 1, chance: 0.5 },
        { item: 'minecraft:sculk_catalyst', amount: 1, chance: 0.05 },
        { item: 'minecraft:amethyst_shard', amount: 1, chance: 0.1 },
        { item: 'utilitycraft:deepslate_diamond_chunk', amount: 1, chance: 0.5 },
        { item: 'utilitycraft:deepslate_emerald_chunk', amount: 1, chance: 0.5 },
        { item: 'utilitycraft:deepslate_gold_chunk', amount: 1, chance: 0.20 },
        { item: 'utilitycraft:deepslate_iron_chunk', amount: 1, chance: 0.25 },
        { item: 'utilitycraft:deepslate_lapislazuli_chunk', amount: 1, chance: 0.15 },
        { item: 'utilitycraft:deepslate_coal_chunk', amount: 1, chance: 0.30 }
    ],
    //Compressed
    'utilitycraft:compressed_gravel': [
        { item: 'minecraft:flint', amount: 9, chance: 0.20 },
        { item: 'utilitycraft:iron_chunk', amount: 9, chance: 0.20 },
        { item: 'utilitycraft:coal_chunk', amount: 9, chance: 0.30 },
        { item: 'utilitycraft:gold_chunk', amount: 9, chance: 0.10 },
        { item: 'utilitycraft:lapislazuli_chunk', amount: 9, chance: 0.2 },
        { item: 'utilitycraft:emerald_chunk', amount: 9, chance: 0.2 },
        { item: 'utilitycraft:diamond_chunk', amount: 9, chance: 0.15 }
    ],
    'utilitycraft:compressed_dirt': [
        { item: 'minecraft:carrot', amount: 9, chance: 0.10 },
        { item: 'minecraft:potato', amount: 9, chance: 0.10 },
        { item: 'minecraft:wheat_seeds', amount: 9, chance: 0.10 },
        { item: 'minecraft:pumpkin_seeds', amount: 9, chance: 0.10 },
        { item: 'minecraft:beetroot_seeds', amount: 9, chance: 0.10 },
        { item: 'minecraft:melon_seeds', amount: 9, chance: 0.10 },
        { item: 'minecraft:sugar_cane', amount: 9, chance: 0.10 },
        { item: 'minecraft:bamboo', amount: 9, chance: 0.10 },
        { item: 'minecraft:sapling', amount: 9, chance: 0.10 },
        { item: 'minecraft:cherry_sapling', amount: 9, chance: 0.10 }
    ],
    'utilitycraft:compressed_sand': [
        { item: 'minecraft:prismarine_shard', amount: 9, chance: 0.10 },
        { item: 'minecraft:prismarine_crystals', amount: 9, chance: 0.10 },
        { item: 'utilitycraft:copper_chunk', amount: 9, chance: 0.25 },
        { item: 'minecraft:bone_meal', amount: 9, chance: 0.25 },
        { item: 'utilitycraft:redstone_chunk', amount: 9, chance: 0.20 },
        { item: 'minecraft:gunpowder', amount: 9, chance: 0.12 },
        { item: 'minecraft:glowstone_dust', amount: 9, chance: 0.8 },
        { item: 'minecraft:blaze_powder', amount: 9, chance: 0.10 },
        { item: 'minecraft:cactus', amount: 9, chance: 0.10 },
        { item: 'minecraft:kelp', amount: 9, chance: 0.10 },
        { item: 'minecraft:cocoa_beans', amount: 9, chance: 0.8 },
        { item: 'minecraft:clay_ball', amount: 9, chance: 0.10 },
        { item: 'minecraft:heart_of_the_sea', amount: 9, chance: 0.01 },
        { item: 'minecraft:conduit', amount: 9, chance: 0.01 },
        // Integrated Storage
        { item: 'ae2be:certus_quartz_crystal', amount: 9, chance: 0.17 },
        { item: 'ae2be:charged_certus_quartz_crystal', amount: 9, chance: 0.1 }
    ],
    'utilitycraft:compressed_crushed_netherrack': [
        { item: 'utilitycraft:nether_quartz_chunk', amount: 9, chance: 0.33 },
        { item: 'minecraft:gold_nugget', amount: 9, chance: 0.20 },
        { item: 'utilitycraft:nether_gold_chunk', amount: 9, chance: 0.33 },
        { item: 'utilitycraft:ancient_debris_chunk', amount: 9, chance: 0.25 }
    ],
    'utilitycraft:compressed_crushed_cobbled_deepslate': [
        { item: 'minecraft:echo_shard', amount: 9, chance: 0.5 },
        { item: 'minecraft:sculk_catalyst', amount: 9, chance: 0.05 },
        { item: 'minecraft:amethyst_shard', amount: 9, chance: 0.1 },
        { item: 'utilitycraft:deepslate_diamond_chunk', amount: 9, chance: 0.5 },
        { item: 'utilitycraft:deepslate_emerald_chunk', amount: 9, chance: 0.5 },
        { item: 'utilitycraft:deepslate_gold_chunk', amount: 9, chance: 0.20 },
        { item: 'utilitycraft:deepslate_iron_chunk', amount: 9, chance: 0.25 },
        { item: 'utilitycraft:deepslate_lapislazuli_chunk', amount: 9, chance: 0.15 },
        { item: 'utilitycraft:deepslate_coal_chunk', amount: 9, chance: 0.30 }
    ],
    'utilitycraft:compressed_crushed_endstone': [
        { item: 'minecraft:chorus_flower', amount: 9, chance: 0.1 },
        { item: 'minecraft:chorus_fruit', amount: 9, chance: 0.80 },
        { item: 'minecraft:ender_pearl', amount: 9, chance: 0.16 }
    ]
}

export const meshMulti = {
    'utilitycraft:string_mesh': 0.75,
    'utilitycraft:flint_mesh': 1,
    'utilitycraft:iron_mesh': 1.25,
    'utilitycraft:golden_mesh': 1.5,
    'utilitycraft:emerald_mesh': 2,
    'utilitycraft:diamond_mesh': 3,
    'utilitycraft:netherite_mesh': 4
}

/**
 * ScriptEvent receiver: "utilitycraft:register_sieve_drop"
 * 
 * Allows other addons or scripts to **add new drops to existing blocks only**.
 * 
 * Expected payload format (JSON):
 * 
 * {
 *   "minecraft:gravel": [
 *     { "item": "minecraft:string", "amount": 1, "chance": 0.05 }
 *   ],
 *   "minecraft:dirt": [
 *     { "item": "minecraft:apple", "amount": 1, "chance": 0.10 }
 *   ]
 * }
 * 
 * - If a block ID is not already defined in `sieveDrops`, the entry is skipped.
 * - If an invalid format is detected, a warning is printed and ignored.
 */
system.afterEvents.scriptEventReceive.subscribe(({ id, message }) => {
    if (id !== "utilitycraft:register_sieve_drop") return;

    try {
        const payload = JSON.parse(message);

        if (!payload || typeof payload !== "object") {
            console.warn("[UtilityCraft] Invalid payload format:", message);
            return;
        }

        for (const [blockId, drops] of Object.entries(payload)) {
            if (!sieveDrops[blockId]) {
                console.warn(`[UtilityCraft] Block '${blockId}' not registered. Cannot add new blocks.`);
                continue;
            }

            if (!Array.isArray(drops)) {
                console.warn(`[UtilityCraft] Drops for '${blockId}' must be an array.`);
                continue;
            }

            for (const drop of drops) {
                if (!drop.item || typeof drop.item !== "string") {
                    console.warn(`[UtilityCraft] Invalid drop for '${blockId}':`, drop);
                    continue;
                }

                // Ensure safe defaults
                const safeDrop = {
                    item: drop.item,
                    amount: drop.amount ?? 1,
                    chance: drop.chance ?? 0.1
                };

                sieveDrops[blockId].push(safeDrop);
                console.warn(`[UtilityCraft] Added drop to '${blockId}':`, safeDrop);
            }
        }
    } catch (err) {
        console.warn("[UtilityCraft] JSON parse failed:", err, message);
    }
});
