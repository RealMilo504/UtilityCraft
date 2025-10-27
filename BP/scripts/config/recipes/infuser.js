import { system } from "@minecraft/server";

/**
 * Infusing recipes for the Infuser machine.
 *
 * Uses a flat key format: "catalyst|input".
 * Each entry defines the output item and optional requirements.
 *
 * @constant
 * @type {InfuserRecipes}
 */
export const infuserRecipes = {
    "minecraft:redstone|minecraft:iron_ingot": {
        output: "utilitycraft:energized_iron_ingot",
        required: 4
    },
    "minecraft:redstone|utilitycraft:iron_dust": {
        output: "utilitycraft:energized_iron_dust",
        required: 4
    },
    "minecraft:redstone|utilitycraft:steel_plate": {
        output: "utilitycraft:chip",
        required: 2
    },
    "utilitycraft:gold_dust|utilitycraft:chip": {
        output: "utilitycraft:basic_chip",
        required: 2
    },
    "utilitycraft:energized_iron_dust|utilitycraft:basic_chip": {
        output: "utilitycraft:advanced_chip",
        required: 2
    },
    "utilitycraft:diamond_dust|utilitycraft:advanced_chip": {
        output: "utilitycraft:expert_chip",
        required: 2
    },
    "utilitycraft:netherite_dust|utilitycraft:expert_chip": {
        output: "utilitycraft:ultimate_chip",
        required: 2
    },
    "minecraft:coal|minecraft:iron_ingot": {
        output: "utilitycraft:steel_ingot",
        required: 1
    },
    "minecraft:coal|utilitycraft:iron_dust": {
        output: "utilitycraft:steel_dust",
        required: 1
    },
    "minecraft:charcoal|minecraft:iron_ingot": {
        output: "utilitycraft:steel_ingot",
        required: 1
    },
    "minecraft:charcoal|utilitycraft:iron_dust": {
        output: "utilitycraft:steel_dust",
        required: 1
    },
    "utilitycraft:coal_dust|minecraft:iron_ingot": {
        output: "utilitycraft:steel_ingot",
        required: 1
    },
    "utilitycraft:coal_dust|utilitycraft:iron_dust": {
        output: "utilitycraft:steel_dust",
        required: 1
    },
    "utilitycraft:charcoal_dust|minecraft:iron_ingot": {
        output: "utilitycraft:steel_ingot",
        required: 1
    },
    "utilitycraft:charcoal_dust|utilitycraft:iron_dust": {
        output: "utilitycraft:steel_dust",
        required: 1
    },
    "minecraft:blaze_powder|minecraft:sand": {
        output: "minecraft:soul_sand",
        required: 1
    },
    "minecraft:blaze_powder|minecraft:dirt": {
        output: "minecraft:soul_soil",
        required: 1
    },
    "minecraft:coal_block|minecraft:iron_block": {
        output: "utilitycraft:steel_block",
        required: 1
    },
    "minecraft:redstone_block|minecraft:iron_block": {
        output: "utilitycraft:energized_iron_block",
        required: 4
    },
    "utilitycraft:netherite_scrap_dust|minecraft:gold_ingot": {
        output: "minecraft:netherite_ingot",
        required: 4
    },
    "utilitycraft:netherite_scrap_dust|utilitycraft:gold_dust": {
        output: "utilitycraft:netherite_dust",
        required: 4
    },
    // Stone variants
    "minecraft:quartz|minecraft:cobblestone": {
        output: "minecraft:diorite",
        required: 1
    },
    "utilitycraft:flint|minecraft:cobblestone": {
        output: "minecraft:andesite",
        required: 1
    },
    "utilitycraft:dirt_handful|minecraft:cobblestone": {
        output: "minecraft:granite",
        required: 1
    },
    "minecraft:charcoal|minecraft:cobblestone": {
        output: "minecraft:blackstone",
        required: 1
    },
    "minecraft:coal|minecraft:cobblestone": {
        output: "minecraft:blackstone",
        required: 1
    },
    "utilitycraft:coal_dust|minecraft:cobblestone": {
        output: "minecraft:blackstone",
        required: 1
    },
    "utilitycraft:charcoal_dust|minecraft:cobblestone": {
        output: "minecraft:blackstone",
        required: 1
    },
    "minecraft:coal_block|utilitycraft:compressed_cobblestone": {
        output: "utilitycraft:compressed_blackstone",
        required: 1
    },
    "minecraft:blaze_powder|minecraft:cobblestone": {
        output: "minecraft:netherrack",
        required: 1
    },
    "utilitycraft:ender_pearl_dust|minecraft:cobblestone": {
        output: "minecraft:end_stone",
        required: 1
    },
    // Integrated Storage
    "minecraft:blaze_powder|ae2be:cetuz_quartz_crystal": {
        output: "ae2be:charged_certus_quartz_crystal",
        required: 1
    },
    "minecraft:redstone|ae2be:charged_certus_quartz_crystal": {
        output: "ae2be:fluix_crystal",
        required: 4
    },
    "ae2be:silicon|utilitycraft:iron_plate": {
        output: "ae2:silicon_press",
        required: 4
    },
    "ae2be:silicon|utilitycraft:gold_plate": {
        output: "ae2be:logic_processor_press",
        required: 4
    },
    "ae2be:silicon|utilitycraft:diamond_plate": {
        output: "ae2be:engineering_processor_press",
        required: 4
    },
    "ae2be:silicon|ae2be:charged_certus_quartz_crystal": {
        output: "ae2be:calculation_processor_press",
        required: 4
    }
    // Future recipes can be added here
};

import { system } from "@minecraft/server";

/**
 * Represents a solid fuel entry for the Furnator.
 *
 * @typedef {Object} SolidFuel
 * @property {string} id  The item identifier or keyword (e.g. "coal", "plank").
 * @property {number} de  Dorios Energy (DE) produced when consumed.
 */

/**
 * Solid fuels used by the Furnator generator.
 * Each entry defines the item ID (or pattern) and the energy produced (in DE).
 *
 * @constant
 * @type {SolidFuel[]}
 */
export const solidFuels = [
    { id: "compressed_charcoal_block_2", de: 8000000 },
    { id: "compressed_charcoal_block_3", de: 80000000 },
    { id: "compressed_charcoal_block_4", de: 800000000 },
    { id: "compressed_charcoal_block", de: 800000 },
    { id: "charcoal_block", de: 80000 },
    { id: "charcoal", de: 8000 },
    { id: "compressed_coal_block_3", de: 80000000 },
    { id: "compressed_coal_block_2", de: 8000000 },
    { id: "compressed_coal_block_4", de: 800000000 },
    { id: "compressed_coal_block", de: 800000 },
    { id: "coal_block", de: 80000 },
    { id: "coal", de: 8000 },
    { id: "plank", de: 1500 },
    { id: "stair", de: 1500 },
    { id: "fence", de: 1500 },
    { id: "stick", de: 500 },
    { id: "door", de: 1000 },
    { id: "ladder", de: 750 },
    { id: "scaffolding", de: 250 },
    { id: "log", de: 1500 },
    { id: "_wood", de: 1500 },
    { id: "stem", de: 1500 },
    { id: "hyphae", de: 1500 },
    { id: "sapling", de: 500 },
    { id: "dried_kelp_block", de: 20000 },
    { id: "lava_ball", de: 100000 },
    { id: "blaze_rod", de: 12000 },
    { id: "boat", de: 6000 },
    { id: "button", de: 500 },
    { id: "wooden", de: 1000 },
    { id: "banner", de: 1500 },
    { id: "chest", de: 3000 },
    { id: "leaves", de: 500 }
];

/**
 * ScriptEvent receiver: "utilitycraft:register_fuel"
 *
 * Allows other addons or scripts to dynamically add or replace solid fuels.
 * If a fuel with the same ID already exists, it will be replaced.
 *
 * Expected payload format (JSON):
 * ```json
 * {
 *   "custom_fuel_1": 50000,
 *   "minecraft:apple": 1000
 * }
 * ```
 *
 * Behavior:
 * - New fuels are added automatically if missing.
 * - Existing fuels are replaced and logged individually.
 * - Only a summary log is printed when finished.
 */
system.afterEvents.scriptEventReceive.subscribe(({ id, message }) => {
    if (id !== "utilitycraft:register_fuel") return;

    try {
        const payload = JSON.parse(message);
        if (!payload || typeof payload !== "object") return;

        let added = 0;
        let replaced = 0;

        for (const [fuelId, de] of Object.entries(payload)) {
            if (typeof de !== "number") continue;

            const existing = solidFuels.find(f => f.id === fuelId);
            if (existing) {
                existing.de = de;
                console.warn(`[UtilityCraft] Replaced existing fuel '${fuelId}' with ${de} DE.`);
                replaced++;
            } else {
                solidFuels.push({ id: fuelId, de });
                added++;
            }
        }

        console.warn(`[UtilityCraft] Registered ${added} new and replaced ${replaced} fuels.`);
    } catch (err) {
        console.warn("[UtilityCraft] Failed to parse fuel registration payload:", err);
    }
});

// ==================================================
// EXAMPLES – How to register custom Furnator fuels
// ==================================================
/*
import { system, world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
    // Add or replace solid fuels dynamically
    const newFuels = {
        "utilitycraft:bio_fuel": 12000,
        "minecraft:bamboo_block": 4000,
        // This one replaces an existing entry
        "minecraft:coal": 10000
    };

    // Send the event to the Furnator script
    system.sendScriptEvent("utilitycraft:register_fuel", JSON.stringify(newFuels));

    console.warn("[Addon] Custom Furnator fuels registered via system event.");
});

// You can also do this directly with a command inside Minecraft:
Command:
/scriptevent utilitycraft:register_fuel {"utilitycraft:bio_fuel":12000,"minecraft:coal":10000}
*/
