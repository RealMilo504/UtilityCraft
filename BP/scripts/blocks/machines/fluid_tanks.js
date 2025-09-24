import { world, ItemStack, system } from '@minecraft/server'
import { LiquidManager } from '../../machinery/managers.js'
import * as doriosAPI from '../../doriosAPI.js'

const tankCaps = {
    'twm:basic_fluid_tank': 8000,
    'twm:advanced_fluid_tank': 32000,
    'twm:expert_fluid_tank': 128000,
    'twm:ultimate_fluid_tank': 512000
};

const acceptedItems = [
    { id: 'minecraft:lava_bucket', value: 1000, liquid: 'lava', result: 'bucket' },
    { id: 'minecraft:water_bucket', value: 1000, liquid: 'water', result: 'bucket' },
    { id: 'minecraft:milk_bucket', value: 1000, liquid: 'milk', result: 'bucket' },
    { id: 'twm:lava_ball', value: 1000, liquid: 'lava', result: 'air' },
    { id: 'twm:water_ball', value: 1000, liquid: 'water', result: 'air' },
    { id: 'minecraft:experience_bottle', value: 8, liquid: 'xp', result: 'glass_bottle' }
];

function capitalizeWords(input) {
    return input.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent("twm:fluid_tanks", {
        onPlayerInteract(e) {
            const { block, player } = e;
            const tankCap = tankCaps[block.typeId] || 8000;
            const hasLiquid = block.permutation.getState("twm:hasliquid");
            const pos = block.location;
            const mainhand = player.getComponent("equippable").getEquipment("Mainhand");

            if (!mainhand) {
                if (!hasLiquid) {
                    player.onScreenDisplay.setActionBar("Empty");
                    return;
                }
                const tank = block.dimension.getEntitiesAtBlockLocation(pos)[0];
                if (!tank) return;

                const liquid = new LiquidManager(tank, null, 0);
                const type = liquid.type;
                const amount = liquid.get();
                const percent = Math.floor((amount / tankCap) * 10000) / 100;
                player.onScreenDisplay.setActionBar(`${capitalizeWords(type)}: ${amount}mB  Capacity: ${percent}% of ${tankCap}mB`);
                return;
            }

            const item = acceptedItems.find(x => mainhand.typeId === x.id);
            if (item) {
                const tank = LiquidManager.addLiquidToTank(block, item.liquid, item.value);
                if (player.getGameMode() !== "creative") {
                    doriosAPI.entities.changeItemAmount(player, player.selectedSlotIndex, -1)
                    if (item.result !== "air") {
                        doriosAPI.entities.addItem(player, item.result, 1)
                    }
                }
                if (!tank) {
                    const percent = Math.floor((item.value / tankCap) * 10000) / 100;
                    player.onScreenDisplay.setActionBar(`${capitalizeWords(item.liquid)}: ${item.value}mB  Capacity: ${percent}% of ${tankCap}mB`);
                    return
                }

            }

            const tank = block.dimension.getEntitiesAtBlockLocation(pos)[0]
            if (!tank) return;

            const liquid = new LiquidManager(tank, null, 0);
            const type = liquid.type;

            // Extraction
            if (mainhand.typeId === "minecraft:bucket" && liquid.get() >= 1000 && ["lava", "water", "milk"].includes(type)) {
                liquid.add(-1000);
                doriosAPI.entities.changeItemAmount(player, player.selectedSlotIndex, -1)
                doriosAPI.entities.addItem(player, `${type}_bucket`, 1)
            }
            if (mainhand.typeId === "minecraft:glass_bottle" && liquid.get() >= 8 && type === "xp") {
                liquid.add(-8);
                doriosAPI.entities.changeItemAmount(player, player.selectedSlotIndex, -1)
                doriosAPI.entities.addItem(player, 'experience_bottle', 1)
            }

            if (liquid.get() <= 0) {
                tank.remove();
                block.setPermutation(block.permutation.withState("twm:hasliquid", false));
                return;
            }

            tank.getComponent("minecraft:health")?.setCurrentValue(liquid.get());
            const percent = Math.floor((liquid.get() / tankCap) * 10000) / 100;
            player.onScreenDisplay.setActionBar(`${capitalizeWords(type)}: ${liquid.get()}mB  Capacity: ${percent}% of ${tankCap}mB`);
        },

        onPlayerDestroy(e) {
            const { block, player, destroyedBlockPermutation } = e;
            const pos = block.location;
            const cap = tankCaps[destroyedBlockPermutation.type.id] || 8000;
            if (!destroyedBlockPermutation.getState("twm:hasliquid")) return;

            const tank = block.dimension.getEntitiesAtBlockLocation(pos)[0];
            if (!tank) return;

            const liquid = new LiquidManager(tank, null, 0);
            const amount = liquid.get();
            const type = liquid.getType();

            if (amount <= 0) return;

            const tankItem = new ItemStack(destroyedBlockPermutation.type.id, 1);
            const percent = Math.floor((amount / cap) * 10000) / 100;
            tankItem.setLore([
                `§r§7  Liquid: ${capitalizeWords(type)}`,
                `§r§7  Amount: ${amount}mB`,
                `§r§7  Capacity: ${percent}% of ${cap}mB`
            ]);
            tank.remove();

            system.run(() => {
                if (player.getGameMode() !== "creative") {
                    const drop = block.dimension.getEntities({ type: "item", maxDistance: 2, location: pos })[0];
                    drop?.kill();
                }
                block.dimension.spawnItem(tankItem, { x: pos.x + 0.5, y: pos.y, z: pos.z + 0.5 });
            });
        },

        beforeOnPlayerPlace(e) {
            const { player, block, permutationToPlace } = e;
            const lore = player.getComponent("equippable").getEquipment("Mainhand")?.getLore();
            if (!lore?.length) return;

            const cap = tankCaps[permutationToPlace.type.id] || 8000;
            const type = lore[0].split(": ")[1].toLowerCase().replace(/ /g, "_");
            const amount = parseInt(lore[1].split(": ")[1]);

            system.run(() => {
                const tank = block.dimension.spawnEntity(`twm:fluid_tank_${type}`, {
                    x: block.location.x + 0.5,
                    y: block.location.y,
                    z: block.location.z + 0.5
                });

                tank.runCommandAsync(`scoreboard players set @s liquid_0 ${amount}`);
                tank.runCommandAsync(`scoreboard players set @s liquidCap_0 ${cap}`);
                tank.addTag(`liquid0Type:${type}`);
                block.setPermutation(block.permutation.withState("twm:hasliquid", true));
                const tier = permutationToPlace.type.id.split('_')[0]
                tank.triggerEvent(tier)
                tank.getComponent("minecraft:health")?.setCurrentValue(amount);
                system.run(() => {
                    tank.getComponent("minecraft:health")?.setCurrentValue(amount);
                })
            });
        }
    });
});