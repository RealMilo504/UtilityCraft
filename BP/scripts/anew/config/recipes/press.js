/**
* Pressing and compression recipes for the Electro Press machine.
*
* Each key represents an input item identifier, and its value specifies
* the resulting output item, required input quantity, and output amount.
*
* @constant
* @type {SingleInputRecipes}
*/
export const pressRecipes = {
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