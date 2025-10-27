/**
* @typedef {Object} LiquidRecipe
* @global
* @property {string} liquid The resulting liquid type (e.g. "lava", "water").
* @property {number} amount The produced liquid amount in millibuckets (mB).
*/

/** @type {Record<string, LiquidRecipe>} */
export const melterRecipes = {
    "minecraft:cobblestone": { liquid: "lava", amount: 250 },
    "minecraft:stone": { liquid: "lava", amount: 250 },
    "minecraft:diorite": { liquid: "lava", amount: 250 },
    "minecraft:granite": { liquid: "lava", amount: 250 },
    "minecraft:blackstone": { liquid: "lava", amount: 250 },
    "minecraft:netherrack": { liquid: "lava", amount: 1000 },
    "minecraft:magma": { liquid: "lava", amount: 1000 },
    "minecraft:magma_cream": { liquid: "lava", amount: 250 }
};
