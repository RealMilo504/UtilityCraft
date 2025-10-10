import { ItemStack, system } from '@minecraft/server'
import { Machine } from '../managers.js'
import { crafting as legacyCraftingRecipes } from '../../../machinery/machines_config.js'

const BLUEPRINT_SLOT = 3
const MATERIAL_SLOTS = 9
const CRAFTING_FLAG = 'utilitycraft:digitizer_crafting'
const DEFAULT_SETTINGS = {
    entity: {
        name: 'digitizer',
        input_type: 'complex',
        output_type: 'simple',
        inventory_size: 17
    },
    machine: {
        energy_cap: 8000,
        energy_cost: 100,
        rate_speed_base: 5,
        upgrades: [4, 5, 6]
    },
    recipes: legacyCraftingRecipes
}

DoriosAPI.register.blockComponent('digitizer', {
    beforeOnPlayerPlace(e, ctx) {
        const settings = resolveSettings(ctx?.params)
        Machine.spawnMachineEntity(e, settings, () => {
            const machine = new Machine(e.block, settings)
            machine.setEnergyCost(settings.machine.energy_cost)
            machine.displayProgress()
            machine.entity?.setDynamicProperty(CRAFTING_FLAG, false)
            machine.displayEnergy()
            machine.setLabel('§r§7Insert blueprint paper', 1)
        })
    },

    onTick(e, ctx) {
        if (!worldLoaded) return

        const settings = resolveSettings(ctx?.params)
        const machine = new Machine(e.block, settings)
        const { inv } = machine
        if (!machine.entity || !inv) return

        const outputSlotIndex = inv.size - 1
        const blueprint = inv.getItem(BLUEPRINT_SLOT)
        const outputSlot = inv.getItem(outputSlotIndex)
        const isCrafting = machine.entity.getDynamicProperty(CRAFTING_FLAG) === true

        if (e.block.location.y < -60) {
            machine.showWarning('Invalid Position')
            return
        }

        if (!blueprint || blueprint.typeId !== 'utilitycraft:blueprint_paper') {
            machine.showWarning('Insert Paper')
            return
        }

        if (outputSlot) {
            machine.showWarning('Output Full')
            return
        }

        if (isCrafting) {
            machine.off()
            machine.displayEnergy()
            machine.displayProgress()
            machine.showStatus('Crafting Blueprint')
            return
        }

        if (machine.energy.get() <= 0) {
            machine.showWarning('No Energy', false)
            return
        }

        const materialSlots = getMaterialSlotIndexes(inv.size)
        const materials = materialSlots
            .map(slot => inv.getItem(slot))
            .filter(item => !!item)

        if (materials.length === 0) {
            machine.showWarning('No Materials')
            return
        }

        const energyCost = settings.machine.energy_cost
        machine.setEnergyCost(energyCost)
        const progress = machine.getProgress()

        if (progress >= energyCost) {
            beginCrafting(machine, settings, materialSlots, outputSlotIndex, energyCost)
            return
        }

        const energyToConsume = Math.min(machine.energy.get(), machine.rate, energyCost - progress)
        machine.energy.consume(energyToConsume)
        machine.addProgress(energyToConsume / machine.boosts.consumption)

        machine.on()
        machine.displayEnergy()
        machine.displayProgress()
        machine.showStatus('Running')
    },

    onPlayerBreak(e) {
        Machine.onDestroy(e)
    }
})

/**
 * @param {Machine} machine
 * @param {MachineSettings & { recipes: Record<string, { output: string, amount?: number, leftover?: string }> }} settings
 * @param {number[]} materialSlots
 * @param {number} outputSlotIndex
 * @param {number} energyCost
 */
function beginCrafting(machine, settings, materialSlots, outputSlotIndex, energyCost) {
    const { entity: machineEntity, inv, dim, block } = machine
    machineEntity.setDynamicProperty(CRAFTING_FLAG, true)

    const crafterPos = { x: block.location.x, y: -64, z: block.location.z }
    const redstonePos = { x: crafterPos.x, y: crafterPos.y + 1, z: crafterPos.z }

    const originalCrafter = dim.getBlock(crafterPos)?.typeId ?? 'minecraft:air'
    const originalRedstone = dim.getBlock(redstonePos)?.typeId ?? 'minecraft:air'

    dim.setBlockType(crafterPos, 'minecraft:crafter')

    const recipeArray = []
    const materialMap = {}

    materialSlots.forEach((slot, index) => {
        const item = inv.getItem(slot)
        if (item) {
            materialMap[item.typeId] = (materialMap[item.typeId] || 0) + 1
            recipeArray.push(item.typeId.split(':')[1])
            dim.runCommand(`replaceitem block ${crafterPos.x} ${crafterPos.y} ${crafterPos.z} slot.container ${index} ${item.typeId}`)
        } else {
            recipeArray.push('air')
            dim.runCommand(`replaceitem block ${crafterPos.x} ${crafterPos.y} ${crafterPos.z} slot.container ${index} air`)
        }
    })

    dim.setBlockType(redstonePos, 'minecraft:redstone_block')

    const recipeKey = recipeArray.join(',')
    const recipeData = Object.entries(materialMap).map(([id, amount]) => ({ id, amount }))
    const blueprintResult = new ItemStack('utilitycraft:blueprint', 1)

    machine.off()
    machine.displayEnergy()
    machine.displayProgress()
    machine.showStatus('Crafting Blueprint')

    system.runTimeout(() => {
        const dropPos = { x: crafterPos.x, y: crafterPos.y - 1, z: crafterPos.z }
        const itemEntity = dim.getEntitiesAtBlockLocation(dropPos)[0]
        let outputAmount = 0
        let outputId = ''
        let leftover

        if (itemEntity) {
            const itemStack = itemEntity.getComponent('minecraft:item')?.itemStack
            if (itemStack) {
                outputAmount = itemStack.amount
                outputId = itemStack.typeId
            }
            itemEntity.remove()
        } else {
            const fallbackRecipe = settings.recipes?.[recipeKey]
            if (fallbackRecipe) {
                outputAmount = fallbackRecipe.amount ?? 1
                outputId = fallbackRecipe.output
                leftover = fallbackRecipe.leftover
            }
        }

        if (outputAmount > 0 && outputId) {
            blueprintResult.setDynamicProperty('amount', outputAmount)
            blueprintResult.setDynamicProperty('id', outputId)
            if (leftover) {
                blueprintResult.setDynamicProperty('leftover', leftover)
            }
            blueprintResult.setDynamicProperty('materials', JSON.stringify(recipeData))
            blueprintResult.setLore(buildBlueprintLore(outputId, recipeData))

            const currentPaper = inv.getItem(BLUEPRINT_SLOT)
            if (currentPaper && currentPaper.typeId === 'utilitycraft:blueprint_paper') {
                if (currentPaper.amount > 1) {
                    currentPaper.amount -= 1
                    inv.setItem(BLUEPRINT_SLOT, currentPaper)
                } else {
                    inv.setItem(BLUEPRINT_SLOT, undefined)
                }
            }

            inv.setItem(outputSlotIndex, blueprintResult)
            machine.addProgress(-energyCost)
            machine.displayProgress()
            machine.showStatus('Blueprint Ready')
        } else {
            machine.showWarning('Invalid Recipe')
        }

        cleanupCrafter(dim, crafterPos, redstonePos, originalCrafter, originalRedstone, machineEntity)
    }, 9)
}

/**
 * Restores the crafter setup to its original state.
 *
 * @param {import('@minecraft/server').Dimension} dimension
 * @param {{ x: number, y: number, z: number }} crafterPos
 * @param {{ x: number, y: number, z: number }} redstonePos
 * @param {string} originalCrafter
 * @param {string} originalRedstone
 * @param {import('@minecraft/server').Entity} entity
 */
function cleanupCrafter(dimension, crafterPos, redstonePos, originalCrafter, originalRedstone, entity) {
    for (let i = 0; i < MATERIAL_SLOTS; i++) {
        dimension.runCommand(`replaceitem block ${crafterPos.x} ${crafterPos.y} ${crafterPos.z} slot.container ${i} air`)
    }

    dimension.setBlockType(crafterPos, originalCrafter)
    dimension.setBlockType(redstonePos, originalRedstone)
    entity.setDynamicProperty(CRAFTING_FLAG, false)
}

/**
 * Builds the lore shown in the resulting blueprint item.
 *
 * @param {string} outputId
 * @param {{ id: string, amount: number }[]} materials
 */
function buildBlueprintLore(outputId, materials) {
    const lore = [`§r§7 Recipe: §r§f${formatItemId(outputId)}`, '§r§7 Materials:']
    for (const mat of materials) {
        lore.push(`§r§7 - ${formatItemId(mat.id)} x${mat.amount}`)
    }
    return lore
}

/**
 * Formats an identifier to a human-readable string.
 *
 * @param {string} typeId
 */
function formatItemId(typeId) {
    const cleanId = typeId.split(':')[1] || typeId
    return cleanId
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

/**
 * Computes the inventory indexes used for the 3x3 crafting grid.
 *
 * @param {number} size
 */
function getMaterialSlotIndexes(size) {
    const start = size - (MATERIAL_SLOTS + 1)
    return Array.from({ length: MATERIAL_SLOTS }, (_, index) => start + index)
}

/**
 * Normalizes machine settings with defaults.
 *
 * @param {MachineSettings & { recipes?: Record<string, { output: string, amount?: number, leftover?: string }> }} params
 * @returns {MachineSettings & { recipes: Record<string, { output: string, amount?: number, leftover?: string }> }}
 */
function resolveSettings(params) {
    const entity = { ...DEFAULT_SETTINGS.entity, ...(params?.entity ?? {}) }
    const machine = { ...DEFAULT_SETTINGS.machine, ...(params?.machine ?? {}) }
    const recipes = params?.recipes ?? DEFAULT_SETTINGS.recipes

    const extra = { ...(params ?? {}) }
    delete extra.entity
    delete extra.machine
    delete extra.recipes

    return { ...extra, entity, machine, recipes }
}
