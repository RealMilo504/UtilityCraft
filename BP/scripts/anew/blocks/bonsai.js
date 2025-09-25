import { ItemStack } from '@minecraft/server'

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

/* -------------------------------------------------------------------------- */
/*                                Configuration                               */
/* -------------------------------------------------------------------------- */

/** Growth base time (in ticks) */
const timeGrowthBase = 60

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
    // ... (keep all other entries as in your original)
]

/**
 * Loot table definitions (unchanged, keyed by loot ID).
 * Example:
 * bonsaiDrops['acacia'] → list of drop objects.
 */
const bonsaiDrops = {
    acacia: [
        { item: 'minecraft:acacia_log', min: 6, max: 10, prob: 100 },
        { item: 'minecraft:leaves2', min: 0, max: 4, prob: 100 },
        { item: 'minecraft:stick', min: 0, max: 6, prob: 100 },
        { item: 'minecraft:acacia_sapling', min: 1, max: 1, prob: 25 }
    ],
    // ... (keep all other loot tables as in your original)
}

/* -------------------------------------------------------------------------- */
/*                                 Utilities                                  */
/* -------------------------------------------------------------------------- */

/**
 * Returns a random integer between [min, max).
 */
function randomInterval(min, max) {
    const minCeiled = Math.ceil(min)
    const maxFloored = Math.floor(max)
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

/* -------------------------------------------------------------------------- */
/*                            Bonsai Block Logic                              */
/* -------------------------------------------------------------------------- */

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

            let timeGrowth = timeGrowthBase - (soil.bonus ?? 0)
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
                    const amount = randomInterval(drop.min, drop.max)
                    try {
                        inv.addItem(new ItemStack(drop.item, amount * multi))
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
