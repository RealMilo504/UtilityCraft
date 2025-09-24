import * as doriosAPI from '../../doriosAPI.js'
import { ItemStack, system } from '@minecraft/server'
import { Machine, settings } from '../machines_class.js'

doriosAPI.register.OldBlockComponent('utilitycraft:digitizer', {
    beforeOnPlayerPlace(e) {
        Machine.spawnMachineEntity(e, settings.digitizer,
            (entity) => {
                entity.setDynamicProperty('crafting', false)
            });
    },
    onTick(e) {
        const machine = new Machine(e.block, settings.digitizer)

        Machine.tick(() => {
            let blueprint = machine.inv.getItem(3);
            if (e.block.y < -60 || !blueprint || blueprint?.typeId != 'utilitycraft:blueprint_paper' || machine.inv.getItem(14)) {
                machine.displayEnergy()
                machine.progress.reset()
                return
            }

            // If theres no energy left, return (Maintains progress)
            if (machine.energy.get() <= 0 || machine.entity.getDynamicProperty('crafting')) {
                machine.displayEnergy()
                machine.turnOff()
                return;
            }

            // If there are no materials to craft return
            let itemCount = 0
            for (let i = machine.inv.size - 10; i < machine.inv.size - 1; i++) {
                if (machine.inv.getItem(i)) itemCount++
            }
            if (itemCount == 0) {
                machine.displayEnergy()
                machine.progress.reset()
                return
            }
            if (machine.progress.get() >= machine.settings.energyCost) {
                let { x, y, z } = e.block.location;
                y += 0.25;
                x += 0.5;
                z += 0.5;
                const dimension = machine.dimension
                let materialMap = {}
                let recipeArray = []
                machine.entity.setDynamicProperty('crafting', true)
                const crafterBlockId = dimension.getBlock({ x: x, y: -64, z })?.typeId
                const redstoneBlockId = dimension.getBlock({ x: x, y: -63, z })?.typeId
                dimension.setBlockType({ x: x, y: -64, z }, 'minecraft:crafter')
                // Get Recipes and Materials
                for (let i = machine.inv.size - 10; i < machine.inv.size - 1; i++) {
                    let item = machine.inv.getItem(i)
                    if (item) {
                        let id = item.typeId
                        materialMap[id] = (materialMap[id] || 0) + 1
                        dimension.runCommand(`replaceitem block ${x} -64 ${z} slot.container ${i - 5} ${id}`)
                        recipeArray.push(item.typeId.split(':')[1])
                    } else recipeArray.push('air')
                }

                dimension.setBlockType({ x, y: -63, z }, 'minecraft:redstone_block')
                const recipeString = recipeArray.join(',')
                let recipeData = Object.entries(materialMap).map(([id, amount]) => ({ id, amount }))
                let newBlueprint = new ItemStack('utilitycraft:blueprint', 1)

                system.runTimeout(() => {
                    const itemEntity = dimension.getEntitiesAtBlockLocation({ x, y: -65, z })[0]
                    let recipeExists = false

                    let outputAmount = 0
                    let outputId = undefined

                    if (itemEntity) {
                        const itemStack = itemEntity.getComponent('minecraft:item').itemStack
                        outputAmount = itemStack.amount
                        outputId = itemStack.typeId
                        itemEntity.remove()
                        recipeExists = true
                    } else {
                        const itemRecipe = machine.settings.recipes[recipeString]
                        if (itemRecipe) {
                            outputAmount = itemRecipe.amount
                            outputId = itemRecipe.output
                            recipeExists = true
                            if (itemRecipe.leftover) newBlueprint.setDynamicProperty('leftover', itemRecipe.leftover)
                        }
                    }

                    if (recipeExists) {
                        newBlueprint.setDynamicProperty('amount', outputAmount)
                        newBlueprint.setDynamicProperty('id', outputId)

                        let lore = [`§r§7 Recipe: §r§f${formatItemId(outputId)}`, '§r§7 Materials:'];

                        for (let mat of recipeData) {
                            lore.push(`§r§7 - ${formatItemId(mat.id)} x${mat.amount}`);
                        }
                        newBlueprint.setDynamicProperty('materials', JSON.stringify(recipeData));
                        newBlueprint.setLore(lore);

                        if (blueprint.amount > 1) {
                            blueprint.amount--
                            machine.inv.setItem(3, blueprint)
                        } else machine.inv.setItem(3,)
                        machine.inv.setItem(14, newBlueprint)
                        machine.progress.add(-machine.settings.energyCost)
                    }

                    removeCrafter(dimension, { x, y, z }, machine.entity, crafterBlockId, redstoneBlockId)
                }, 9)
            } else {
                machine.processWithEnergy()
            }
            machine.turnOn()
            machine.displayEnergy()
            machine.displayProgress(4, machine.settings.energyCost)
        })
    },
    onPlayerDestroy(e) {
        Machine.onDestroy(e)
    }
})

function formatItemId(typeId) {
    // Quitar namespace (minecraft: o lo que sea)
    let cleanId = typeId.split(':')[1] || typeId;

    // Separar por guiones bajos y capitalizar cada palabra
    return cleanId
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function removeCrafter(dimension, { x, y, z }, entity, crafterBlockId, redstoneBlockId) {
    for (let i = 0; i < 9; i++) {
        dimension.runCommand(`replaceitem block ${x} -64 ${z} slot.container ${i} air`)
    }
    dimension.setBlockType({ x, y: -64, z }, crafterBlockId)
    dimension.setBlockType({ x, y: -63, z }, redstoneBlockId)
    entity.setDynamicProperty('crafting', false)
}