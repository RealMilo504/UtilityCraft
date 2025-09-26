import { world } from '@minecraft/server'

world.afterEvents.playerBreakBlock.subscribe(({ itemStackAfterBreak, player }) => {
    itemStackAfterBreak.durability.damage(1, 1)
    player.setEquipment("Mainhand", itemStackAfterBreak)
})

// DoriosAPI.register.itemComponent('durability', {
//     onMineBlock({ itemStack, source }) {
//         itemStack.durability.damage(1, 1)
//         source.setEquipment("Mainhand", itemStack)
//     }
// })