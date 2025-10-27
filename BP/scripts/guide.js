import { world, system, ItemStack } from '@minecraft/server'

const BOOK_PREFIX = 'utilitycraft:utility_book'
const MAX_PAGE = 18

world.afterEvents.playerJoin.subscribe(() => {
    system.runTimeout(() => {
        const overworld = world.getDimension('overworld')
        overworld.runCommand(`give @a[tag =! guideUC] ${BOOK_PREFIX}_0`)
        overworld.runCommand('tag @a add guideUC')
        system.runTimeout(() => {
            overworld.runCommand(`give @a[tag =! guideUC] ${BOOK_PREFIX}_0`)
            overworld.runCommand('tag @a add guideUC')
        }, 250)
    }, 100)
})

world.afterEvents.itemUse.subscribe((event) => {
    const { source, itemStack } = event

    if (!source || !itemStack) return

    const typeId = itemStack.typeId ?? ''
    const shortName = typeId.includes(':') ? typeId.split(':')[1] : typeId

    if (!shortName.startsWith('utility_book')) return

    const info = bookinfo(typeId)
    if (!info) return

    const { identifier, page } = info
    const inventoryComponent = source.getComponent('minecraft:inventory')

    if (!inventoryComponent) return

    const slot = source.selectedSlotIndex
    const inventory = inventoryComponent.container
    const location = source.location

    if (!source.isSneaking && page < MAX_PAGE) {
        inventory.setItem(slot, new ItemStack(`${identifier}_${page + 1}`, 1))
        source.playSound('item.book.page_turn', location)
        return
    }

    if (source.isSneaking && page > 0) {
        inventory.setItem(slot, new ItemStack(`${identifier}_${page - 1}`, 1))
        source.playSound('item.book.page_turn', location)
    }
})

function bookinfo(bookId) {
    const lastUnderscoreIndex = bookId.lastIndexOf('_')

    if (lastUnderscoreIndex === -1) {
        return null
    }

    const identifier = bookId.slice(0, lastUnderscoreIndex)
    const page = Number.parseInt(bookId.slice(lastUnderscoreIndex + 1))

    if (Number.isNaN(page)) {
        return null
    }

    return { identifier, page }
}
