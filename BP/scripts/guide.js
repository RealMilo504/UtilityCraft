import { world, system, ItemStack } from '@minecraft/server'

world.afterEvents.playerJoin.subscribe(eventData => {
    system.runTimeout(() => {
        world.getDimension('overworld').runCommand(`give @a[tag =! guideUC] twm:utility_book_0`)
        world.getDimension('overworld').runCommand(`tag @a add guideUC`)
        system.runTimeout(() => {
            world.getDimension('overworld').runCommand(`give @a[tag =! guideUC] twm:utility_book_0`)
            world.getDimension('overworld').runCommand(`tag @a add guideUC`)
        }, 250);
    }, 100);
})

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('twm:utility_book', {
        onUse(e) {
            const { itemStack, source } = e
            const book = itemStack.typeId
            const { identifier, page } = bookinfo(book)
            const slot = source.selectedSlotIndex
            const playerInv = source.getComponent('minecraft:inventory').container
            const location = source.location
            if (!source.isSneaking && page < 18) {
                playerInv.setItem(slot, new ItemStack(`${identifier}_${page + 1}`, 1))
                world.playSound("item.book.page_turn", location)

            }
            if (source.isSneaking && page > 0) {
                playerInv.setItem(slot, new ItemStack(`${identifier}_${page - 1}`, 1))
                world.playSound("item.book.page_turn", location)
            }
        }
    })
})

function bookinfo(book) {
    const lastUnderscoreIndex = book.lastIndexOf('_');

    const identifier = book.slice(0, lastUnderscoreIndex);
    const page = parseInt(book.slice(lastUnderscoreIndex + 1));

    return { identifier, page };
}