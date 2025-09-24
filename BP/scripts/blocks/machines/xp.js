import { world, ItemStack, system } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:xp', {
        onPlayerInteract(e) {
            const { block } = e
            if (block.typeId == 'twm:xp_spout') {
                if (block.permutation.getState('twm:isOpen') == false) {
                    block.setPermutation(block.permutation.withState('twm:isOpen', true))
                } else { block.setPermutation(block.permutation.withState('twm:isOpen', false)) }
            }
        },
        onTick(e) {
            const { block } = e
            let { x, y, z } = block.location

            if (block.typeId == 'twm:xp_drain') {
                y += 0, x += 0.5, z += 0.5
                const player = block.dimension.getPlayers({ location: { x: x, y: y, z: z }, maxDistance: 0.8 })[0]
                const tankEntity = block.dimension.getEntities({ tags: ["tank"], location: { x: x, y: y - 1, z: z }, maxDistance: 0.1 })[0]
                const tank = block.below(1)
                if (player != undefined && tankEntity == undefined && tank.permutation.getState('twm:hasliquid') == false) {
                    if (player.getTotalXp() > 0) {
                        tank.setPermutation(tank.permutation.withState('twm:hasliquid', true))
                        y -= 1
                        block.dimension.spawnEntity(`twm:fluid_tank_xp`, { x, y, z })
                        block.dimension.runCommandAsync(`tag @e[type=twm:fluid_tank_xp] add tank`)
                        system.run(() => {
                            const entityTank = block.dimension.getEntitiesAtBlockLocation(block.below(1).location)[0]
                            entityTank.addTag(`${tank.typeId}`)
                            const tankCap = entityTank.getComponent('minecraft:health')
                            entityTank.setDynamicProperty('twm:liquid', 1);
                            tankCap.setCurrentValue(1)
                        });
                        if (player.xpEarnedAtCurrentLevel == 0) {
                            player.addLevels(-1)
                            player.addExperience(player.totalXpNeededForNextLevel - 1)
                        } else {
                            player.addExperience(-1)
                        }
                    }
                }
                if (player != undefined && tankEntity != undefined && tank.permutation.getState('twm:hasliquid') == true) {
                    const tankCap = tankEntity.getComponent('minecraft:health')
                    const actualXp = tankEntity.getDynamicProperty('twm:liquid')
                    if (player.getTotalXp() > 0 && actualXp < tankCap.effectiveMax) {
                        y -= 1
                        if (player.xpEarnedAtCurrentLevel == 0) {
                            player.addLevels(-1)
                            player.addExperience(player.totalXpNeededForNextLevel - 1)
                            tankCap.setCurrentValue(actualXp + 1)
                            tankEntity.setDynamicProperty('twm:liquid', actualXp + 1);
                        } else {
                            const amount = (player.xpEarnedAtCurrentLevel >= 10) ? 10 : player.xpEarnedAtCurrentLevel
                            player.addExperience(-amount)
                            tankCap.setCurrentValue(actualXp + amount)
                            tankEntity.setDynamicProperty('twm:liquid', actualXp + amount);
                        }
                    }
                }
            }

            if (block.typeId == 'twm:xp_spout' && block.permutation.getState('twm:isOpen') == true) {
                let xs = 0, zs = 0
                let tank = undefined
                switch (block.permutation.getState("minecraft:block_face")) {
                    case 'north':
                        tank = block.south(1)
                        z += 1
                        zs = 0.8
                        xs = 0.4
                        break
                    case 'south':
                        tank = block.north(1)
                        z -= 1
                        zs = 0.2
                        xs = 0.4
                        break
                    case 'west':
                        tank = block.east(1)
                        x += 1
                        xs = 0.6
                        zs = 0.5
                        break
                    case 'east':
                        tank = block.west(1)
                        x -= 1
                        xs = 0.1
                        zs = 0.5
                        break
                }
                y += 0, x += 0.5, z += 0.5
                const tankEntity = block.dimension.getEntities({ families: ["tank"], location: { x: x, y: y, z: z }, maxDistance: 0.1 })[0]
                if (tankEntity != undefined) {
                    if (tankEntity.typeId != 'twm:fluid_tank_xp') return
                    const tankCap = tankEntity.getDynamicProperty('twm:liquid')
                    if (tankCap > 1) {
                        tankEntity.setDynamicProperty('twm:liquid', tankCap - 1);
                        tankEntity.getComponent('minecraft:health').setCurrentValue(tankCap - 1)
                        block.dimension.spawnEntity('xp_orb', { x: block.location.x + xs, y: block.location.y + 0.5, z: block.location.z + zs })
                    } else {
                        tankEntity.remove()
                        block.dimension.spawnEntity('xp_orb', { x: block.location.x + xs, y: block.location.y + 0.5, z: block.location.z + zs })
                        tank.setPermutation(tank.permutation.withState('twm:hasliquid', false))
                    }
                }
            }
        }
    })
})