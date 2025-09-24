import { world } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('twm:potion', {
        onUse(e) {
            const { source } = e
            let entity = undefined
            if (source.getEntitiesFromViewDirection()[0] != undefined) {
                entity = source.getEntitiesFromViewDirection({ maxDistance: 3 })[0].entity
                if (entity.typeId == 'minecraft:zombie_villager_v2') {
                    entity.triggerEvent('villager_converted')
                }
            }
        }
    })
})