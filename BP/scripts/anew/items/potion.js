DoriosAPI.register.itemComponent("potion", {
    onUse({ source }) {
        const target = source.getEntitiesFromViewDirection({ maxDistance: 3 })?.[0]?.entity;
        if (target?.typeId === "minecraft:zombie_villager_v2") {
            target.triggerEvent("villager_converted");
            if (!source.isInCreative()) {
                source.setEquipment("Mainhand",)
            }
        }
    }
});
