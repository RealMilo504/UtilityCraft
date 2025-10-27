import { world, ItemStack } from '@minecraft/server'

world.afterEvents.playerBreakBlock.subscribe(({ itemStackAfterBreak, player }) => {
    if (!itemStackAfterBreak) return
    if (!itemStackAfterBreak.typeId.startsWith('utilitycraft:') || itemStackAfterBreak.typeId.includes('mesh')) return
    if (!itemStackAfterBreak.getComponent('durability')) return
    if (itemStackAfterBreak.durability.damage()) {
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
    if (!itemStack.typeId.startsWith('utilitycraft:') || itemStack.typeId.includes('mesh')) return
    if (!itemStack.getComponent('durability')) return
    if (itemStack.durability.damage()) {
        player.setEquipment("Mainhand", itemStack)
    } else {
        player.setEquipment("Mainhand",)
        player.playSound('random.break')
    }
})

