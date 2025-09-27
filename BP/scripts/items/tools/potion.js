DoriosAPI.register.itemComponent("potion", {
    /**
     * Handles the potion's use interaction.
     *
     * @param {import("@minecraft/server").ItemComponentUseEvent} event
     */
    onUse({ source }) {
        const target = source.getEntitiesFromViewDirection({ maxDistance: 3 })?.[0]?.entity;
        if (target?.typeId === "minecraft:zombie_villager_v2") {
            target.triggerEvent("villager_converted");
        }
    }
});
