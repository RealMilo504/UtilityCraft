import { world, ItemStack } from '@minecraft/server'

const spawnerEntities = [
    'minecraft:blaze',
    'minecraft:chicken',
    'minecraft:cow',
    'minecraft:creeper',
    'minecraft:enderman',
    'minecraft:hoglin',
    'minecraft:magma_cube',
    'minecraft:mooshroom',
    'minecraft:pig',
    'minecraft:sheep',
    'minecraft:skeleton',
    'minecraft:slime',
    'minecraft:spider',
    'minecraft:wither_skeleton',
    'minecraft:zombie'
]

DoriosAPI.register.itemComponent("essence", {
    onUse(e) {
        const { source } = e
        const equippable = source.getComponent("equippable")

        const target = source.getEntitiesFromViewDirection({ maxDistance: 2 })?.[0]?.entity
        if (!target) return

        if (spawnerEntities.includes(target.typeId)) {
            const essenceItem = new ItemStack("utilitycraft:essence_vessel", 1)
            essenceItem.setLore([
                `§r§7  Mob: ${DoriosAPI.utils.formatIdToText(target.typeId)}`,
                "§r§7  0 %"
            ])

            target.remove()
            equippable.setEquipment("Mainhand", essenceItem)
        }
    }
})

world.afterEvents.entityDie.subscribe(e => {
    const { deadEntity, damageSource } = e

    if (!damageSource.damagingEntity || damageSource.damagingEntity.typeId !== "minecraft:player") return

    const player = damageSource.damagingEntity
    const equippable = player.getComponent("equippable")
    const offHand = equippable.getEquipment("Offhand")

    if (!offHand || offHand.typeId !== "utilitycraft:essence_vessel") return

    // Expected mob type from essence vessel lore
    const expectedMob = offHand.getLore()[0].split(": ")[1]
    if (expectedMob !== DoriosAPI.utils.formatIdToText(deadEntity.typeId)) return

    // Parse kills from lore and increment
    let kills = parseInt(offHand.getLore()[1].split("§r§7  ")[1].split(" %")[0])
    kills += Math.floor(Math.random() * 5) + 1

    // Vessel is now complete → transform into actual essence item
    if (kills > 99) {
        const newEssence = new ItemStack(mobName(offHand.getLore()[0]))
        player.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${newEssence.typeId} 1`)
        return
    }

    // Update lore and show progress
    player.runCommand(`title @s actionbar ${kills}%`)
    offHand.setLore([
        `${offHand.getLore()[0]}`,
        `§r§7  ${kills} %`
    ])
    equippable.setEquipment("Offhand", offHand)
})

/**
 * Converts lore line into proper essence item identifier.
 * Example: "§r§7  Mob: Iron Golem" → "utilitycraft:iron_golem_essence"
 *
 * @param {string} str Lore string with mob name
 * @returns {string} Identifier of the mob essence item
 */
function mobName(str) {
    let res = str.split('§r§7  ')[1].toLowerCase()
    res = res.split(' ')
    let len = res.length
    if (len === 2) return 'utilitycraft:' + res[1] + '_essence'
    let longRes = 'utilitycraft:' + res[1]
    for (let i = 2; i < len; i++) {
        longRes += '_' + res[i]
    }
    return longRes + '_essence'
}
