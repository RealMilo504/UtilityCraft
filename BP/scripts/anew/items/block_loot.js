import { ItemStack } from "@minecraft/server";

DoriosAPI.register.itemComponent("block_loot", {
    onMineBlock({ minedBlockPermutation, block }, { params }) {
        const {
            blockTypes = [],
            blockEndsWith = "leaves",
            item = "minecraft:stick",
            chance = 1,
            amount = 1
        } = params;

        const blockId = minedBlockPermutation.getItemStack(1).typeId;

        // Validate by suffix
        if (!blockId.endsWith(blockEndsWith)) return;

        // Validate by whitelist (if provided)
        if (blockTypes.length > 0 && !blockTypes.includes(blockId)) return;

        // Roll chance
        if (Math.random() > chance) return;

        // Resolve quantity
        const qty = Array.isArray(amount)
            ? DoriosAPI.utils.randomInterval(amount[0], amount[1])
            : amount;

        if (qty <= 0) return;

        const { x, y, z } = block.location;
        block.dimension.spawnItem(new ItemStack(item, qty), { x, y, z });
    }
});
