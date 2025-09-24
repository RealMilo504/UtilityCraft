import { world, ItemStack, ItemEnchantableComponent } from '@minecraft/server'

const digDrops = [
    { drop: 'utilitycraft:gravel_fragments', min: 1, max: 2, prob: 50 },
    { drop: 'utilitycraft:stone_pebble', min: 1, max: 2, prob: 50 },
    { drop: 'utilitycraft:dirt_handful', min: 1, max: 1, prob: 20 },
    { drop: 'utilitycraft:andesite_pebble', min: 1, max: 1, prob: 20 },
    { drop: 'utilitycraft:diorite_pebble', min: 1, max: 1, prob: 20 },
    { drop: 'utilitycraft:granite_pebble', min: 1, max: 1, prob: 20 },
    { drop: 'minecraft:bone_meal', min: 1, max: 1, prob: 10 }
]

function itemDrops(drop, block) {
    const roll = Math.random() * 100
    let { x, y, z } = block.location
    x += 0.5; y += 1; z += 0.5
    if (roll <= drop.prob) {
        let numDrops = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min;
        block.dimension.spawnItem(new ItemStack(drop.drop, numDrops), { x, y, z })
    }
}

world.beforeEvents.worldInitialize.subscribe(e => {
    e.itemComponentRegistry.registerCustomComponent('utilitycraft:dig_pebble', {
        onUseOn(e) {
            const { block, source, itemStack } = e
            let blockId = block.typeId
            if (!source.isSneaking) return;
            if (blockId != 'minecraft:dirt' && blockId != 'minecraft:grass_block') return
            digDrops.forEach(drop => {
                itemDrops(drop, block)
            })
            const durability = itemStack.getComponent('minecraft:durability')
            const inventory = source.getComponent("minecraft:inventory").container
            const ench = itemStack.getComponent(ItemEnchantableComponent.componentId)
            let unbreaking = 0
            if (ench == undefined) {
                unbreaking = ench.getEnchantment("unbreaking").level
            }
            if (!source.matches({ gameMode: 'creative' })) {
                if ((Math.ceil(Math.random() * 100)) <= (100 / (unbreaking + 1))) {
                    if (durability.damage + 1 <= durability.maxDurability) {
                        durability.damage += 1, inventory.setItem(source.selectedSlotIndex, itemStack)
                    } else {
                        inventory.setItem(source.selectedSlotIndex, undefined), source.playSound('random.break')
                    }
                }
            }
        }
    })
})