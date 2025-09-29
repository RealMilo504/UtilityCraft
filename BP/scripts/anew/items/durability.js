import { world, ItemStack } from '@minecraft/server'

world.afterEvents.playerBreakBlock.subscribe(({ itemStackAfterBreak, player }) => {
    if (!itemStackAfterBreak) return
    if (!itemStackAfterBreak.typeId.startsWith('utilitycraft:')) return
    if (!itemStackAfterBreak.hasComponent('durability')) return
    if (itemStackAfterBreak.durability.damage(1, 1)) {
        player.setEquipment("Mainhand", itemStackAfterBreak)
    } else {
        player.setEquipment("Mainhand",)
        player.playSound('random.break')
    }
})

world.afterEvents.entityHitEntity.subscribe(({ damagingEntity }) => {
    if (damagingEntity.typeId != 'minecraft:player') return
    const player = damagingEntity
    /** @type {ItemStack} */
    const itemStack = player.getEquipment("Mainhand")
    if (!itemStack) return
    if (!itemStack.typeId.startsWith('utilitycraft:')) return
    if (!itemStack.hasComponent('durability')) return
    if (itemStack.durability.damage(1, 1)) {
        player.setEquipment("Mainhand", itemStack)
    } else {
        player.setEquipment("Mainhand",)
        player.playSound('random.break')
    }
})

// DoriosAPI.register.itemComponent('durability', {
//     onMineBlock({ itemStack, source }) {
//         itemStack.durability.damage(1, 1)
//         source.setEquipment("Mainhand", itemStack)
//     }
// })
