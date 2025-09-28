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

            const amount = DoriosAPI.math.randomInterval(drop.min, drop.max);
            block.dimension.spawnItem(new ItemStack(drop.drop, amount), location);
        }

        if (source.isInCreative()) return;
        if (itemStack.durability.damage(1, 1)) {
            source.setEquipment("Mainhand", itemStack)
        } else {
            source.setEquipment("Mainhand",)
            source.playSound('random.break')
        }
    }
});

