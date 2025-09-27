import { ItemStack } from "@minecraft/server";
import { crusherRecipes } from "../config/recipes/crusher.js";

DoriosAPI.register.itemComponent("hammer", {
    onMineBlock({ block, minedBlockPermutation }, { params }) {
        let { x, y, z } = block.location;
        x += 0.5;
        z += 0.5;
        y += 0.2;

        // Get recipe for the mined block
        const recipe = crusherRecipes[minedBlockPermutation.type.id];
        if (!recipe) return;

        // Check if tool tier is sufficient
        const hammerTier = params?.tier ?? 0
        if (hammerTier < recipe.tier) return;

        // Find the mined item entity near the block
        const closest = block.dimension.getEntities({
            type: "item",
            maxDistance: 3,
            location: { x, y, z }
        }).find(entity =>
            entity?.getComponent("minecraft:item")?.itemStack.typeId === minedBlockPermutation.type.id
        );

        if (!closest) return;

        // Remove original drop and spawn the crusher result
        closest.remove();
        block.dimension.spawnItem(new ItemStack(recipe.output, recipe.amount), { x, y, z });
    }
});
