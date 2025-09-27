import { ItemStack } from "@minecraft/server";

const ORE_PREFIXES = [
    "deepslate_",
    "nether_",
    "end_"
];

const EXCEPTIONS = {
    "minecraft:ancient_debris": "minecraft:netherite_scrap",
    "minecraft:cobblestone": "minecraft:stone",
    "minecraft:cobbled_deepslate": "minecraft:deepslate"
};

function normalizeOreName(name) {
    for (const prefix of ORE_PREFIXES) {
        if (name.startsWith(prefix)) {
            return name.slice(prefix.length);
        }
    }

    return name;
}

function getSmeltedId(rawId) {
    const exception = EXCEPTIONS[rawId];
    if (exception) return exception;

    if (!rawId.includes(":")) return;

    const [namespace, name] = rawId.split(":");

    if (name.startsWith("raw_") && !name.includes("block")) {
        return `${namespace}:${name.replace(/^raw_/, "")}_ingot`;
    }

    if (name.startsWith("raw_") && name.endsWith("_block")) {
        return `${namespace}:${name.replace(/^raw_/, "")}`;
    }

    if (name.endsWith("_ore")) {
        let base = name.slice(0, -4);
        base = normalizeOreName(base);
        return `${namespace}:${base}_ingot`;
    }
}

DoriosAPI.register.itemComponent("smelting", {
    onMineBlock({ block, minedBlockPermutation }) {
        const smeltId = getSmeltedId(minedBlockPermutation.type.id);
        if (!smeltId) return;

        const { x, y, z } = block.location;
        const center = { x: x + 0.5, y: y + 0.2, z: z + 0.5 };

        const drops = block.dimension.getEntities({
            type: "item",
            maxDistance: 2,
            location: center
        });

        for (const entity of drops) {
            const itemComp = entity.getComponent("minecraft:item");
            const stack = itemComp?.itemStack;
            if (!stack) continue;

            if (getSmeltedId(stack.typeId) !== smeltId) continue;

            const amount = stack.amount;
            entity.remove();
            block.dimension.spawnItem(new ItemStack(smeltId, amount), center);
        }
    }
});
