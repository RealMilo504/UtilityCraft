import { world, system, ItemStack } from '@minecraft/server'



const liquids = {
    'minecraft:water': 'water',
    'minecraft:lava': 'lava'
}

const caps = {
    'utilitycraft:basic_fluid_tank': 8000,
    'utilitycraft:advanced_fluid_tank': 32000,
    'utilitycraft:expert_fluid_tank': 128000,
    'utilitycraft:ultimate_fluid_tank': 512000,
    'utilitycraft:basic_magmator': 8000 * 1,
    'utilitycraft:advanced_magmator': 8000 * 4,
    'utilitycraft:expert_magmator': 8000 * 16,
    'utilitycraft:ultimate_magmator': 8000 * 100,
    'utilitycraft:basic_thermo_generator': 2000 * 1,
    'utilitycraft:advanced_thermo_generator': 2000 * 4,
    'utilitycraft:expert_thermo_generator': 2000 * 16,
    'utilitycraft:ultimate_thermo_generator': 2000 * 100,
    'utilitycraft:magmatic_chamber': 32000
};


world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('utilitycraft:fluid_pump', {
        onTick(e) {
            const { block, dimension } = e
            let { x, y, z } = block.location;

            // If by any chance the script is executed when you break the machine, returns to avoid errors
            if (block?.typeId == 'minecraft:air') return;

            // Facing direction
            const facingOffsets = {
                up: [0, -1, 0],
                down: [0, 1, 0],
                north: [0, 0, 1],
                south: [0, 0, -1],
                west: [1, 0, 0],
                east: [-1, 0, 0]
            };
            const facing = facingOffsets[block.permutation.getState('minecraft:block_face')];
            [x, y, z] = [x - facing[0], y - facing[1], z - facing[2]];

            const firstBlock = dimension.getBlock({ x, y, z })
            if (!firstBlock) return

            const firstContainer = dimension.getEntitiesAtBlockLocation(firstBlock.location)[0]
            let firstAmount = 0
            let liquidType = null
            let isInfinite = false
            let speed = 64000

            // Detectar tipo de fuente
            if (firstContainer) {
                firstAmount = firstContainer.getDynamicProperty('utilitycraft:liquid')
                if (firstAmount <= 0) return
                liquidType = firstContainer.getDynamicProperty('utilitycraft:liquidType')
            } else if (liquids[firstBlock.typeId]) {
                // Bloques líquidos vanilla
                if (firstBlock.permutation.getState("liquid_depth") !== 0) return
                firstAmount = 1000
                liquidType = liquids[firstBlock.typeId]
            } else if (firstBlock.typeId === 'utilitycraft:crucible') {
                const lavaLevel = firstBlock.permutation.getState('utilitycraft:lava')
                if (lavaLevel < 1) return
                firstAmount = 250 * lavaLevel
                liquidType = 'lava'
            } else if (firstBlock.typeId === 'utilitycraft:sink') {
                liquidType = 'water'
                firstAmount = Infinity
                isInfinite = true
            } else {
                return // Fuente inválida
            }

            let nextType, nextAmount, nextCap

            [x, y, z] = [x + 2 * facing[0], y + 2 * facing[1], z + 2 * facing[2]];
            const pos = { x, y, z }

            const targetEnt = dimension.getEntitiesAtBlockLocation(pos)[0]
            const nextBlock = dimension.getBlock(pos)

            if (targetEnt) {
                nextAmount = targetEnt.getDynamicProperty('utilitycraft:liquid')
                nextType = targetEnt.getDynamicProperty('utilitycraft:liquidType')
                nextCap = caps[nextBlock?.typeId]

                if (!nextCap) return

                if (nextType !== liquidType && nextAmount > 0) return
                if (nextAmount >= nextCap) return
                const transfer = Math.min(speed, firstAmount, nextCap - nextAmount)
                if (transfer <= 0) return

                targetEnt.setDynamicProperty('utilitycraft:liquid', nextAmount + transfer)
                targetEnt.setDynamicProperty('utilitycraft:liquidType', liquidType)
                if (nextBlock.typeId.includes('fluid_tank')) {
                    targetEnt.getComponent('minecraft:health').setCurrentValue(nextAmount + transfer)
                }

                // Actualiza fuente
                if (!isInfinite) {
                    firstAmount -= transfer

                    if (firstContainer) {
                        firstContainer.setDynamicProperty('utilitycraft:liquid', firstAmount)
                        if (firstContainer.typeId.includes('fluid_tank')) {
                            firstContainer.getComponent('minecraft:health').setCurrentValue(firstAmount)
                        }
                        if (firstAmount <= 0 && firstBlock.typeId.includes('fluid_tank')) {
                            firstContainer.remove()
                            firstBlock.setPermutation(firstBlock.permutation.withState('utilitycraft:hasliquid', false))
                        }
                    } else if (liquids[firstBlock.typeId]) {
                        firstBlock.setType('minecraft:air')
                    } else if (firstBlock.typeId === 'utilitycraft:crucible') {
                        firstBlock.setPermutation(firstBlock.permutation.withState('utilitycraft:lava', 0))
                    }
                }
                return
            }

            // Si no hay entidad y es un tag de tanque (crear nuevo tanque)
            if (!targetEnt && nextBlock.typeId.includes('fluid_tank')) {
                const tank = dimension.spawnEntity(`utilitycraft:fluid_tank_${liquidType}`, {
                    x: pos.x + 0.5,
                    y: pos.y,
                    z: pos.z + 0.5
                })

                const nextBlock = dimension.getBlock(pos)
                const transfer = Math.min(speed, firstAmount)

                tank.setDynamicProperty('utilitycraft:liquid', transfer)
                tank.setDynamicProperty('utilitycraft:liquidType', liquidType)
                tank.getComponent('minecraft:health').setCurrentValue(transfer)
                nextBlock.setPermutation(nextBlock.permutation.withState('utilitycraft:hasliquid', true))

                if (!isInfinite) {
                    firstAmount -= transfer

                    if (firstContainer) {
                        firstContainer.setDynamicProperty('utilitycraft:liquid', firstAmount)
                        if (firstAmount <= 0 && firstBlock.typeId.includes('fluid_tank')) {
                            firstContainer.remove()
                            firstBlock.setPermutation(firstBlock.permutation.withState('utilitycraft:hasliquid', false))
                        }
                    } else if (liquids[firstBlock.typeId]) {
                        firstBlock.setType('minecraft:air')
                    } else if (firstBlock.typeId === 'utilitycraft:crucible') {
                        firstBlock.setPermutation(firstBlock.permutation.withState('utilitycraft:lava', 0))
                    }
                }
            }
        }
    })
})