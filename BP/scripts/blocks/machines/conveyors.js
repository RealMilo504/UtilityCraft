import { world } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:conveyors', {
        onTick(e) {
            const { block } = e
            let { x, y, z } = block.location
            x += 0.5, z += 0.5
            let xvel = 0, zvel = 0, yvel = 0, next = false, up = false
            switch (block.permutation.getState('minecraft:cardinal_direction')) {
                case 'north':
                    if (block.north(1) != undefined) {
                        if (block.typeId == 'twm:conveyor_horizontal' && block.north(1).typeId == 'twm:conveyor_horizontal' && block.north(1).permutation.getState('minecraft:cardinal_direction') != block.permutation.getState('minecraft:cardinal_direction')) {
                            next = true
                        }
                    }
                    zvel = -1
                    break
                case 'south':
                    if (block.south(1) != undefined) {
                        if (block.typeId == 'twm:conveyor_horizontal' && block.south(1).typeId == 'twm:conveyor_horizontal' && block.south(1).permutation.getState('minecraft:cardinal_direction') != block.permutation.getState('minecraft:cardinal_direction')) {
                            next = true
                        }
                    }
                    zvel = 1
                    break
                case 'west':
                    if (block.west(1) != undefined) {
                        if (block.typeId == 'twm:conveyor_horizontal' && block.west(1).typeId == 'twm:conveyor_horizontal' && block.west(1).permutation.getState('minecraft:cardinal_direction') != block.permutation.getState('minecraft:cardinal_direction')) {
                            next = true
                        }
                    }
                    xvel = -1
                    break
                case 'east':
                    if (block.east(1) != undefined) {
                        if (block.typeId == 'twm:conveyor_horizontal' && block.east(1).typeId == 'twm:conveyor_horizontal' && block.east(1).permutation.getState('minecraft:cardinal_direction') != block.permutation.getState('minecraft:cardinal_direction')) {
                            next = true
                        }
                    }
                    xvel = 1
                    break
            }
            if (block.typeId == 'twm:conveyor_inclined') {
                yvel = 1
                let entitiesup = block.dimension.getEntities({ location: { x: x + 0.75 * xvel, y: y + 0.6 * yvel, z: z + 0.75 * zvel }, maxDistance: 0.75 })
                if (entitiesup != undefined) {
                    for (let j = 0; j < entitiesup.length; j++) {
                        if (entitiesup[j].typeId == 'minecraft:item') {
                            entitiesup[j].teleport({ x: (entitiesup[j].location.x + xvel * 0.25), y: (entitiesup[j].location.y + yvel * 0.2), z: (entitiesup[j].location.z + zvel * 0.25) })
                        }
                    }
                }

            }

            let entities = block.dimension.getEntities({ location: { x: x, y: y + 0.25 + 0.25 * yvel, z: z }, maxDistance: 0.75 })
            if (entities != undefined) {
                for (let j = 0; j < entities.length; j++) {
                    if (entities[j].typeId == 'minecraft:item') {
                        entities[j].teleport({ x: (entities[j].location.x + xvel * 0.05), y: (entities[j].location.y + yvel * 0.12), z: (entities[j].location.z + zvel * 0.05) })
                    }
                }
            }
            if (next == true) {
                let entitiesnext = block.dimension.getEntities({ location: { x: x + 0.75 * xvel, y: y + 0.5 * yvel, z: z + 0.75 * zvel }, maxDistance: 0.75 })
                if (entitiesnext != undefined) {
                    for (let j = 0; j < entitiesnext.length; j++) {
                        if (entitiesnext[j].typeId == 'minecraft:item') {
                            entitiesnext[j].teleport({ x: (entitiesnext[j].location.x + xvel * 0.05), y: (entitiesnext[j].location.y + yvel * 0.15), z: (entitiesnext[j].location.z + zvel * 0.05) })
                        }
                    }
                }
            }
        }
    })
})