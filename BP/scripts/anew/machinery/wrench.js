import { world, ItemStack } from "@minecraft/server";

const FACING = ["up", "down", "north", "south", "east", "west"];
const CARDINAL = ["north", "south", "east", "west"];

// Nombres de entidades removibles
const REMOVABLE_ENTITIES = [
    "utilitycraft:tractor",
    "utilitycraft:drill"
];

// --- REGISTRO DEL COMPONENTE ---
DoriosAPI.register.itemComponent("wrench", {
    onUseOn(e) {
        const { source: player, itemStack, block } = e;
        // Si hay bloque apuntado y tiene dirección
        if (block && itemStack?.typeId === "utilitycraft:wrench") {
            try {
                const facingDir = block.permutation.getState("minecraft:facing_direction");
                if (facingDir !== undefined) {
                    const index = FACING.indexOf(facingDir);
                    const next = (index + 1) % FACING.length;
                    block.setPermutation(block.permutation.withState("minecraft:facing_direction", FACING[next]));
                    player.playSound("random.click");
                    return;
                }
            } catch { }

            try {
                const cardDir = block.permutation.getState("minecraft:cardinal_direction");
                if (cardDir !== undefined) {
                    const index = CARDINAL.indexOf(cardDir);
                    const next = (index + 1) % CARDINAL.length;
                    block.setPermutation(block.permutation.withState("minecraft:cardinal_direction", CARDINAL[next]));
                    player.playSound("random.click");
                    return;
                }
            } catch { }
        }
    },
});

world.afterEvents.playerInteractWithEntity.subscribe(({ player, target, itemStack }) => {
    if (!itemStack || itemStack.typeId != 'utilitycraft:wrench') return
    if (!player.isSneaking) return
    const dim = player.dimension
    world.sendMessage(`${REMOVABLE_ENTITIES.includes(target.typeId)}`)
    if (target && REMOVABLE_ENTITIES.includes(target.typeId)) {
        // --- DROPEAR INVENTARIO ---
        target.dropAllItems();
        // --- SPAWNEAR EL ITEM DEL MISMO ID ---
        dim.spawnItem(new ItemStack(target.typeId + '_placer', 1), target.location);
        // --- REMOVER ENTIDAD ---
        target.remove();
        player.playSound("random.anvil_land", { volume: 0.5 });
        return;
    }
})