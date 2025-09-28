import { ItemStack, world } from '@minecraft/server'



/**
 * Bonsai Block Component
 * ----------------------
 * This component powers UtilityCraft's Bonsai automation block.
 * - Players can insert/remove soils and saplings.
 * - Soils adjust growth speed and loot multiplier.
 * - Saplings spawn bonsai entities that grow and drop resources.
 * - Harvested drops are pushed into inventories below or nearby containers.
 * 
 * States used:
 * - utilitycraft:soil        (string: soil ID or 'empty')
 * - utilitycraft:hasBonsai   (boolean)
 * - utilitycraft:isFarm      (boolean, farmed with hoe for growth bonus)
 * - utilitycraft:isSlimed    (boolean, slows growth when true)
 */


/** Growth base time (in ticks) */
const BASETIMEGROWTH = 60

/** Soils hash map (ID → modifiers) */
const soils = {
    "minecraft:dirt": {},
    "minecraft:grass_block": { bonus: 10 },
    "minecraft:sand": {},
    "minecraft:red_sand": { bonus: 10 },
    "minecraft:crimson_nylium": {},
    "minecraft:warped_nylium": {},
    "minecraft:soul_sand": {},
    "minecraft:end_stone": {},
    "utilitycraft:yellow_soil": { bonus: 15 },
    "utilitycraft:red_soil": { bonus: 30 },
    "utilitycraft:blue_soil": { bonus: 30, multi: 2 },
    "utilitycraft:black_soil": { bonus: 50, multi: 4 }
}

/** Special soils cannot be farmed and apply stronger bonuses */
const specialSoils = [
    "utilitycraft:yellow_soil",
    "utilitycraft:red_soil",
    "utilitycraft:blue_soil",
    "utilitycraft:black_soil"
]

/**
 * Sapling → Bonsai entity definitions
 * Each entry defines: sapling item, valid soils, entity spawned, and loot table.
 */
const bonsaiItems = [
    { sapling: 'minecraft:acacia_sapling', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:acacia_tree', loot: 'acacia' },
    { sapling: 'utilitycraft:apple_sapling', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:apple_tree', loot: 'apple_tree' },
    { sapling: 'minecraft:bamboo', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:bamboo', loot: 'bamboo' },
    { sapling: 'minecraft:beetroot_seeds', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:beetroot', loot: 'beetroot' },
    { sapling: 'minecraft:birch_sapling', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:birch_tree', loot: 'birch' },
    { sapling: 'minecraft:cactus', allowed: ['sand', 'red_sand'], entity: 'utilitycraft:cactus', loot: 'cactus' },
    { sapling: 'minecraft:carrot', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:carrot', loot: 'carrot' },
    { sapling: 'minecraft:cherry_sapling', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:cherry_tree', loot: 'cherry' },
    { sapling: 'minecraft:chorus_fruit', allowed: ['end_stone'], entity: 'utilitycraft:chorus_fruit', loot: 'chorus_fruit' },
    { sapling: 'minecraft:crimson_fungus', allowed: ['crimson_nylium'], entity: 'utilitycraft:crimson_tree', loot: 'crimson' },
    { sapling: 'minecraft:dark_oak_sapling', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:darkoak_tree', loot: 'darkoak' },
    { sapling: 'minecraft:jungle_sapling', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:jungle_tree', loot: 'jungle' },
    { sapling: 'minecraft:kelp', allowed: ['sand', 'red_sand', 'dirt', 'grass_block'], entity: 'utilitycraft:kelp', loot: 'kelp' },
    { sapling: 'minecraft:mangrove_propagule', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:mangrove_tree', loot: 'mangrove' },
    { sapling: 'minecraft:melon_seeds', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:melon', loot: 'melon' },
    { sapling: 'minecraft:red_mushroom', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:mushroom', loot: 'mushroom' },
    { sapling: 'minecraft:brown_mushroom', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:mushroom', loot: 'mushroom' },
    { sapling: 'minecraft:nether_wart', allowed: ['soul_sand'], entity: 'utilitycraft:nether_wart', loot: 'nether_wart' },
    { sapling: 'minecraft:oak_sapling', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:oak_tree', loot: 'oak' },
    { sapling: 'minecraft:pale_oak_sapling', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:pale_oak_tree', loot: 'pale_oak' },
    { sapling: 'minecraft:potato', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:potato', loot: 'potato' },
    { sapling: 'minecraft:pumpkin_seeds', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:pumpkin', loot: 'pumpkin' },
    { sapling: 'minecraft:spruce_sapling', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:spruce_tree', loot: 'spruce' },
    { sapling: 'minecraft:sugar_cane', allowed: ['dirt', 'grass_block', 'sand', 'red_sand'], entity: 'utilitycraft:sugarcane', loot: 'sugar_cane' },
    { sapling: 'minecraft:sweet_berries', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:sweet_berries', loot: 'sweet_berries' },
    { sapling: 'minecraft:warped_fungus', allowed: ['warped_nylium'], entity: 'utilitycraft:warped_tree', loot: 'warped' },
    { sapling: 'minecraft:wheat_seeds', allowed: ['dirt', 'grass_block'], entity: 'utilitycraft:wheat', loot: 'wheat' }
]
/**
 * Loot table definitions (unchanged, keyed by loot ID).
 * Example:
 * bonsaiDrops['acacia'] → list of drop objects.
 */
const bonsaiDrops = {
    'acacia': [
        { item: 'minecraft:acacia_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:leaves2', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:acacia_sapling', min: 1, max: 1, prob: 25 }
    ],
    'apple_tree': [
        { item: 'minecraft:log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'utilitycraft:apple_sapling', min: 1, max: 1, prob: 25 },
        { item: 'minecraft:apple', min: 1, max: 4, prob: 100 },
        { item: 'minecraft:enchanted_golden_apple', min: 1, max: 1, prob: 0.0001 },
        { item: 'minecraft:golden_apple', min: 1, max: 1, prob: 0.1 }
    ],
    'bamboo': [
        { item: 'minecraft:bamboo', min: 6, max: 12, prob: 100 }
    ],
    'beetroot': [
        { item: 'minecraft:beetroot', min: 2, max: 4, prob: 100 }
    ],
    'birch': [
        { item: 'minecraft:birch_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:birch_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:birch_sapling', min: 1, max: 1, prob: 25 }
    ],
    'cactus': [
        { item: 'minecraft:cactus', min: 2, max: 4, prob: 100 }
    ],
    'carrot': [
        { item: 'minecraft:carrot', min: 2, max: 4, prob: 100 },
        { item: 'minecraft:golden_carrot', min: 1, max: 1, prob: 0.1 }
    ],
    'cherry': [
        { item: 'minecraft:cherry_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:cherry_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:cherry_sapling', min: 1, max: 1, prob: 25 }
    ],
    'chorus_fruit': [
        { item: 'minecraft:chorus_fruit', min: 1, max: 2, prob: 100 }
    ],
    'crimson': [
        { item: 'minecraft:crimson_stem', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:nether_wart_block', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:shroomlight', min: 1, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:crimson_fungus', min: 1, max: 1, prob: 25 }
    ],
    'darkoak': [
        { item: 'minecraft:dark_oak_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:dark_oak_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:dark_oak_sapling', min: 1, max: 1, prob: 25 }
    ],
    'jungle': [
        { item: 'minecraft:jungle_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:jungle_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:cocoa_beans', min: 1, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:jungle_sapling', min: 1, max: 1, prob: 25 }
    ],
    'kelp': [
        { item: 'minecraft:kelp', min: 4, max: 8, prob: 100 }
    ],
    'mangrove': [
        { item: 'minecraft:mangrove_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:mangrove_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:mangrove_propagule', min: 1, max: 1, prob: 25 }
    ],
    'melon': [
        { item: 'minecraft:melon_slice', min: 2, max: 4, prob: 100 },
        { item: 'minecraft:melon_block', min: 1, max: 1, prob: 10 }
    ],
    'mushroom': [
        { item: 'minecraft:red_mushroom', min: 2, max: 4, prob: 100 },
        { item: 'minecraft:brown_mushroom', min: 2, max: 4, prob: 100 }
    ],
    'nether_wart': [
        { item: 'minecraft:nether_wart', min: 2, max: 4, prob: 100 }
    ],
    'oak': [
        { item: 'minecraft:log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:oak_sapling', min: 1, max: 1, prob: 25 }
    ],
    'pale_oak': [
        { item: 'minecraft:pale_oak_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:pale_oak_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:pale_oak_sapling', min: 1, max: 1, prob: 25 }
    ],
    'potato': [
        { item: 'minecraft:potato', min: 2, max: 4, prob: 100 },
        { item: 'minecraft:poisonous_potato', min: 1, max: 1, prob: 10 }
    ],
    'pumpkin': [
        { item: 'minecraft:pumpkin', min: 2, max: 4, prob: 100 },
        { item: 'minecraft:pumpkin_pie', min: 1, max: 1, prob: 0.1 }
    ],
    'spruce': [
        { item: 'minecraft:spruce_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:spruce_leaves', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:spruce_sapling', min: 1, max: 1, prob: 25 }
    ],
    'sugar_cane': [
        { item: 'minecraft:sugar_cane', min: 4, max: 8, prob: 100 }
    ],
    'sweet_berries': [
        { item: 'minecraft:sweet_berries', min: 2, max: 4, prob: 100 }
    ],
    'warped': [
        { item: 'minecraft:warped_stem', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:warped_wart_block', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:shroomlight', min: 1, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:warped_fungus', min: 1, max: 1, prob: 25 }
    ],
    'wheat': [
        { item: 'minecraft:wheat', min: 2, max: 4, prob: 100 },
        { item: 'minecraft:bread', min: 1, max: 1, prob: 0.1 }
    ]

}

DoriosAPI.register.blockComponent('bonsai', {
    /**
     * Handles player interaction (planting, removing, farming, shearing).
     */
    onPlayerInteract({ player, block }) {
        const { x, y, z } = block.location
        const pos = { x: x + 0.5, y: y + 0.172, z: z + 0.5 }
        const equipment = player.getComponent('equippable')
        const equipmentItem = equipment.getEquipment('Mainhand')

        /* --- Sneak + empty hand → clear bonsai --- */
        if (player.isSneaking && !equipmentItem) {
            const entity = block.dimension.getEntities({ tags: ['bonsai'], maxDistance: 0.1, location: pos })[0]
            if (entity) {
                const bonsaiEntity = bonsaiItems.find(item => item.entity === entity.typeId)
                entity.addTag('despawn')
                block.dimension.spawnItem(new ItemStack(bonsaiEntity.sapling), pos)
            }
            if (block.getState('utilitycraft:soil') !== 'empty') {
                block.dimension.spawnItem(new ItemStack(block.getState('utilitycraft:soil')), pos)
                block.setState('utilitycraft:soil', 'empty')
                block.setState('utilitycraft:isFarm', false)
            }
            block.setState('utilitycraft:hasBonsai', false)
            block.setState('utilitycraft:isSlimed', false)
            return
        }

        if (!equipmentItem) return
        const itemId = equipmentItem.typeId

        /* --- Shears → remove sapling --- */
        if (itemId === 'minecraft:shears') {
            const entity = block.dimension.getEntities({ tags: ['bonsai'], maxDistance: 0.1, location: pos })[0]
            if (entity) {
                const bonsaiEntity = bonsaiItems.find(item => item.entity === entity.typeId)
                entity.addTag('despawn')
                block.dimension.spawnItem(new ItemStack(bonsaiEntity.sapling), pos)
                block.setState('utilitycraft:hasBonsai', false)
                block.setState('utilitycraft:isSlimed', false)
                player.playSound('mob.sheep.shear')
            }
            return
        }

        /* --- Slime ball → toggle slimed state --- */
        if (itemId === 'minecraft:slime_ball') {
            const entity = block.dimension.getEntities({ tags: ['bonsai'], maxDistance: 0.1, location: pos })[0]
            if (!entity) return
            const slimed = !block.getState('utilitycraft:isSlimed')
            block.setState('utilitycraft:isSlimed', slimed)
            entity.triggerEvent(slimed ? 'normal' : 'small')
            return
        }

        /* --- Hoe → farm bonsai (durability check with unbreaking) --- */
        if (itemId.includes('hoe')) {
            const enchantable = equipmentItem.getComponent('minecraft:enchantable')
            const unbreakingLvl = enchantable.hasEnchantment('unbreaking')
                ? enchantable.getEnchantment('unbreaking').level
                : 0

            if (!block.getState('utilitycraft:isFarm') && block.getState('utilitycraft:soil') !== 'empty') {
                block.setState('utilitycraft:isFarm', true)

                const durability = equipmentItem.getComponent('minecraft:durability')
                const shouldDamage = Math.random() <= 1 / (unbreakingLvl + 1)

                if (shouldDamage && durability.damage < durability.maxDurability) {
                    durability.damage++
                    equipment.setEquipment('Mainhand', equipmentItem)
                    block.dimension.playSound('step.gravel', pos)
                } else if (durability.damage === durability.maxDurability) {
                    equipment.setEquipment('Mainhand')
                    player.playSound('random.break')
                }
            }
            return
        }

        /* --- Sapling → spawn bonsai entity --- */
        const bonsai = bonsaiItems.find(item => item.sapling === itemId)
        if (bonsai) {
            const soilId = block.getState('utilitycraft:soil')
            if (
                (specialSoils.includes(soilId) || bonsai.allowed.includes(soilId.split(':')[1])) &&
                !block.getState('utilitycraft:hasBonsai')
            ) {
                block.setState('utilitycraft:hasBonsai', true)
                const bonsaiEntity = block.dimension.spawnEntity(bonsai.entity, pos)
                bonsaiEntity.addTag('bonsai')

                if (player.getGameMode() !== 'creative') {
                    player.runCommand(`clear @s ${bonsai.sapling} 0 1`)
                }
            }
            return
        }

        /* --- Soil → set soil state --- */
        if (soils[itemId] && block.getState('utilitycraft:soil') === 'empty') {
            block.setState('utilitycraft:soil', itemId)
            if (player.getGameMode() !== 'creative') {
                player.runCommand(`clear @s ${itemId} 0 1`)
            }
        }
    },

    /**
     * Runs every tick to handle bonsai growth and item drops.
     */
    onTick({ block }) {
        if (block.getState('utilitycraft:isSlimed')) return

        const { x, y, z } = block.location
        const pos = { x: x + 0.5, y: y + 0.172, z: z + 0.5 }

        const entity = block.dimension.getEntities({ tags: ['bonsai'], maxDistance: 0.1, location: pos })[0]
        const soilId = block.getState('utilitycraft:soil')
        const soil = soils[soilId]

        if (entity && soil) {
            const bonsaiEntity = bonsaiItems.find(enty => enty.entity === entity.typeId)
            if (!bonsaiEntity) return

            let timeGrowth = BASETIMEGROWTH - (soil.bonus ?? 0)
            let multi = soil.multi ?? 1

            if (!specialSoils.includes(soilId)) {
                timeGrowth -= block.getState('utilitycraft:isFarm') ? 10 : 0
            }

            entity.playAnimation(`animation.grow_tree_${timeGrowth}`)

            // Inventory target: block below or nearby container entity
            const blockInv = block.below(1).getComponent('minecraft:inventory')?.container
            const entityInv = block.dimension.getEntities({
                families: ['dorios:container'],
                maxDistance: 0.5,
                location: { x: x + 0.5, y: y - 1, z: z + 0.5 }
            })[0]?.getComponent('minecraft:inventory')?.container

            const inv = blockInv ?? entityInv
            if (!inv) return

            bonsaiDrops[bonsaiEntity.loot].forEach(drop => {
                if (Math.random() * 100 <= drop.prob) {
                    const amount = DoriosAPI.math.randomInterval(drop.min, drop.max)
                    try {
                        DoriosAPI.addItem(inv, drop.item, amount * multi)
                    } catch { }
                }
            })
        }
    },

    /**
     * Handles block destruction → drop soil and sapling if present.
     */
    onPlayerDestroy({ destroyedBlockPermutation, block }) {
        const { x, y, z } = block.location
        const pos = { x: x + 0.5, y: y + 0.172, z: z + 0.5 }

        const soil = destroyedBlockPermutation.getState('utilitycraft:soil')
        if (soil !== 'empty') {
            block.dimension.spawnItem(new ItemStack(soil), pos)
        }

        if (destroyedBlockPermutation.getState('utilitycraft:hasBonsai')) {
            const entity = block.dimension.getEntities({ tags: ['bonsai'], maxDistance: 0.1, location: pos })[0]
            if (entity) {
                const bonsaiEntity = bonsaiItems.find(enty => enty.entity === entity.typeId)
                block.dimension.spawnItem(new ItemStack(bonsaiEntity.sapling), pos)
            }
        }
    }
})
