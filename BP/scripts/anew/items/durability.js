import { world, ItemStack } from '@minecraft/server'

world.afterEvents.playerBreakBlock.subscribe(({ itemStackAfterBreak, player }) => {
    if (!itemStackAfterBreak.typeId.startsWith('utilitycraft:')) return
    if (itemStackAfterBreak.durability.damage(1, 1)) {
        player.setEquipment("Mainhand", itemStackAfterBreak)
    } else {
        player.setEquipment("Mainhand",)
        player.playSound('random.break')
    }
})

world.afterEvents.entityHitEntity.subscribe(({ hitEntity }) => {
    if (hitEntity.typeId != 'minecraft:player') return
    const player = hitEntity
    /** @type {ItemStack} */
    const itemStack = hitEntity.getEquipment("Mainhand")
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
