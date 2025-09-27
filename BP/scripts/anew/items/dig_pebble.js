import { ItemStack, ItemEnchantableComponent } from "@minecraft/server";

const digDrops = [
    { drop: "utilitycraft:gravel_fragments", min: 1, max: 2, prob: 50 },
    { drop: "utilitycraft:stone_pebble", min: 1, max: 2, prob: 50 },
    { drop: "utilitycraft:dirt_handful", min: 1, max: 1, prob: 20 },
    { drop: "utilitycraft:andesite_pebble", min: 1, max: 1, prob: 20 },
    { drop: "utilitycraft:diorite_pebble", min: 1, max: 1, prob: 20 },
    { drop: "utilitycraft:granite_pebble", min: 1, max: 1, prob: 20 },
    { drop: "minecraft:bone_meal", min: 1, max: 1, prob: 10 }
];

DoriosAPI.register.itemComponent("dig_pebble", {
    onUseOn({ block, source, itemStack }) {
        if (!source?.isSneaking) return;
        if (!block) return;

        const blockId = block.typeId;
        if (blockId !== "minecraft:dirt" && blockId !== "minecraft:grass_block") return;

        const location = {
            x: block.location.x + 0.5,
            y: block.location.y + 1,
            z: block.location.z + 0.5
        };

        for (const drop of digDrops) {
            if (Math.random() * 100 > drop.prob) continue;

            const amount = DoriosAPI.utils.randomInterval(drop.min, drop.max);
            block.dimension.spawnItem(new ItemStack(drop.drop, amount), location);
        }

        if (source.matches?.({ gameMode: "creative" })) return;

        const durability = itemStack.getComponent("minecraft:durability");
        if (!durability) return;

        const inventory = source.getComponent("minecraft:inventory")?.container;
        const ench = itemStack.getComponent(ItemEnchantableComponent.componentId);
        const unbreaking = ench?.getEnchantment?.("unbreaking")?.level ?? 0;

        const shouldDamage = Math.ceil(Math.random() * 100) <= (100 / (unbreaking + 1));
        if (!shouldDamage) return;

        if (durability.damage + 1 <= durability.maxDurability) {
            durability.damage += 1;
            inventory?.setItem(source.selectedSlotIndex, itemStack);
            return;
        }

        inventory?.setItem(source.selectedSlotIndex, undefined);
        source.playSound?.("random.break");
    }
});

