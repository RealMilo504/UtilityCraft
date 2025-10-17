import { system, ItemStack } from "@minecraft/server";

/**
 * Global pedestal configuration
 */
const pedestalSettings = {
    radius: 4,            // Radio de acción (4 = 9x9)
    cropsPerCycle: 16,    // Cuántos cultivos intenta procesar por ciclo
    baseChance: 0.25,     // Probabilidad base de crecimiento
};

/**
 * Modifiers based on crop tier (rarer = harder to grow)
 * Key = tier value (from permutation), Value = chance multiplier
 */
const cropTierChances = {
    0: 1.0,  // Normal crops
    1: 0.9,  // Slightly slower
    2: 0.75, // Noticeably slower
    3: 0.6,  // Hard to grow
    4: 0.4,  // Very slow growth (top-tier / rare)
};

/**
 * Returns a random position within a square area centered on the pedestal.
 */
function getRandomPosition(x, y, z, radius) {
    const dx = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
    const dz = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
    return { x: x + dx, y, z: z + dz };
}

/**
 * Attempts to grow a crop based on its type, tier, and chance.
 */
function tryGrowCrop(block, baseChance, globalMultiplier) {
    if (!block) return;

    const modded = block.permutation.getState("utilitycraft:age");
    const vanilla = block.permutation.getState("growth");

    const tier = block.permutation.getState("utilitycraft:tier") ?? 0;
    const tierMult = cropTierChances[tier] ?? 1;

    const finalChance = baseChance * globalMultiplier * tierMult;

    if (modded !== undefined && modded < 5) {
        if (Math.random() < finalChance) {
            block.setPermutation(block.permutation.withState("utilitycraft:age", modded + 1));
        }
    } else if (vanilla !== undefined && vanilla < 7) {
        if (Math.random() < finalChance) {
            block.setPermutation(block.permutation.withState("growth", vanilla + 1));
        }
    }
}

/**
 * Pedestal block logic
 */
DoriosAPI.register.blockComponent("pedestal", {
    /**
     * Handles the ticking of the pedestal
     * @param {import("@minecraft/server").BlockComponentTickEvent} e
     * @param {{ params: { multiplier: number } }} ctx
     */
    async onTick(e, { params }) {
        const { block } = e;
        const { multiplier = 1 } = params;

        if (block.permutation.getState("utilitycraft:hasItem") !== 1) return;

        const dim = block.dimension;
        const { radius, baseChance, cropsPerCycle } = pedestalSettings;
        const { x, y, z } = block.location;

        for (let i = 0; i < cropsPerCycle; i++) {
            const pos = getRandomPosition(x, y, z, radius);
            const crop = dim.getBlock(pos);
            tryGrowCrop(crop, baseChance, multiplier);

            await system.sleep(1);
        }
    },

    /**
     * Handles interaction to insert/remove the accelerator clock.
     * @param {import("@minecraft/server").BlockComponentPlayerInteractEvent} e
     */
    onPlayerInteract(e) {
        const { block, player } = e;
        let { x, y, z } = block.location;

        y += 1.2;
        x += 0.5;
        z += 0.5;

        const dim = block.dimension;
        const state = block.permutation.getState("utilitycraft:hasItem");
        const mainhand = player.getComponent("equippable")?.getEquipment("Mainhand");
        const itemId = mainhand?.typeId;

        if (state === 1) {
            const entity = dim.getEntities({
                type: "utilitycraft:accelerator_clock",
                maxDistance: 1,
                location: { x, y, z },
            })[0];

            if (entity) entity.remove();
            dim.spawnItem(new ItemStack("utilitycraft:accelerator_clock", 1), { x, y, z });
            block.setPermutation(block.permutation.withState("utilitycraft:hasItem", 0));
            return;
        }

        if (state === 0 && itemId === "utilitycraft:accelerator_clock") {
            const existing = dim.getEntities({
                type: "utilitycraft:accelerator_clock",
                maxDistance: 5,
                location: { x, y, z },
            })[0];

            if (existing) return;

            dim.spawnEntity("utilitycraft:accelerator_clock", { x, y, z });
            player.runCommandAsync("clear @s utilitycraft:accelerator_clock 0 1");
            block.setPermutation(block.permutation.withState("utilitycraft:hasItem", 1));
        }
    },

    /**
     * Drops the clock if the pedestal is destroyed.
     * @param {import("@minecraft/server").BlockComponentPlayerDestroyEvent} e
     */
    onPlayerDestroy(e) {
        const { block, destroyedBlockPermutation } = e;
        if (destroyedBlockPermutation.getState("utilitycraft:hasItem") === 1) {
            block.dimension.spawnItem(new ItemStack("utilitycraft:accelerator_clock", 1), block.location);
        }
    },
});
