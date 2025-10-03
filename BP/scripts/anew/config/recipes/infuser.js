
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
    "minecraft:coal|minecraft:cobblestone": {
        output: "minecraft:blackstone",
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
    "minecraft:charcoal|minecraft:cobblestone": {
        output: "minecraft:blackstone",
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
    "utilitycraft:coal_dust|minecraft:cobblestone": {
        output: "minecraft:blackstone",
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
    "utilitycraft:charcoal_dust|minecraft:cobblestone": {
        output: "minecraft:blackstone",
        required: 1
    },
    "minecraft:blaze_powder|minecraft:cobblestone": {
        output: "minecraft:netherrack",
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
    "utilitycraft:ender_pearl_dust|minecraft:cobblestone": {
        output: "minecraft:end_stone",
        required: 1
    },
    "minecraft:coal_block|minecraft:iron_block": {
        output: "utilitycraft:steel_block",
        required: 1
    },
    "minecraft:coal_block|utilitycraft:compressed_cobblestone": {
        output: "utilitycraft:compressed_blackstone",
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
    }
};
