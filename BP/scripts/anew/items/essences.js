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

        // Check what the player is looking at
        const target = source.getEntitiesFromViewDirection({ maxDistance: 2 })?.[0]?.entity
        if (!target) return

        if (spawnerEntities.includes(target.typeId)) {
            const essenceItem = new ItemStack("utilitycraft:essence_vessel", 1)
            essenceItem.setLore([
                `§r§7  Mob: ${DoriosAPI.utils.capitalize(target.typeId)}`,
                "§r§7  0 %"
            ])

            target.remove()
            equippable.setEquipment("Mainhand", essenceItem)
        }
    }
})
