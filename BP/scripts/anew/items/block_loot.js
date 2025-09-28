import { ItemStack } from "@minecraft/server";

DoriosAPI.register.itemComponent("block_loot", {
    onMineBlock({ minedBlockPermutation, block }, { params }) {
        // Normalize params → always an array
        const paramArray = Array.isArray(params) ? params : [params];

        const blockId = minedBlockPermutation.getItemStack(1).typeId;

        for (const cfg of paramArray) {
            const {
                blockTypes = [],
                blockEndsWith = "leaves",
                item = "minecraft:stick",
                chance = 1,
                amount = 1
            } = cfg;

            // Validate by suffix
            if (!blockId.endsWith(blockEndsWith)) continue;

            // Validate by whitelist (if provided)
            if (blockTypes.length > 0 && !blockTypes.includes(blockId)) continue;

            // Roll chance
            if (Math.random() > chance) continue;

            // Resolve quantity
            const qty = Array.isArray(amount)
                ? DoriosAPI.math.randomInterval(amount[0], amount[1])
                : amount;

            if (qty <= 0) continue;

            const { x, y, z } = block.location;
            block.dimension.spawnItem(new ItemStack(item, qty), { x, y, z });
        }
    }
});
