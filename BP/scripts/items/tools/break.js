import { world, ItemEnchantableComponent } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('utilitycraft:break', {
        onMineBlock(e) {
            const { itemStack, source } = e
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
