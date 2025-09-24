import * as doriosAPI from '../../doriosAPI.js'
import { world, ItemStack } from '@minecraft/server'
import { Generator, settings } from '../generators_class.js'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('utilitycraft:furnator', {
        beforeOnPlayerPlace(e) {
            Generator.spawnGeneratorEntity(e, settings.furnator)
        },
        onTick(e) {
            const gen = new Generator(e.block, settings.furnator)
            gen.transferEnergy(20)

            Generator.tick(() => {
                const entity = gen.entity
                let energyR = entity.getDynamicProperty('utilitycraft:energyR') || 0
                let energyF = entity.getDynamicProperty('utilitycraft:energyF') || 0

                let fuelP = 0
                if (energyF > 0) fuelP = Math.floor((energyR / energyF) * 13)
                let fuelBar = new ItemStack(`utilitycraft:fuel_bar_${fuelP}`)
                gen.inv.setItem(4, fuelBar)

                let burnSpeed = gen.burnSpeed
                const energy = gen.energy
                if (energy.get() < energy.cap) {
                    if (energyR > 0) {
                        burnSpeed = Math.min(energyR, burnSpeed, energy.cap - energy.get())
                        energyR -= burnSpeed
                        energy.add(burnSpeed)
                        gen.turnOn()
                    } else {
                        entity.setDynamicProperty('utilitycraft:energyF', 0)
                        let item = gen.inv.getItem(3)
                        const fuel = settings.furnator.fuels.find(fuel => item?.typeId.includes(fuel.id))
                        if (fuel) {
                            burnSpeed = Math.min(fuel.de, burnSpeed, energy.cap - energy.get())
                            energyR = fuel.de - burnSpeed
                            energy.add(burnSpeed)
                            gen.turnOn()
                            doriosAPI.entities.changeItemAmount(gen.entity, 3, -1)
                            entity.setDynamicProperty('utilitycraft:energyF', fuel.de)
                        } else { gen.turnOff() }
                    }
                } else { gen.turnOff() }

                gen.displayEnergy()
                entity.setDynamicProperty('utilitycraft:energyR', energyR)
            })
        },
        onPlayerDestroy(e) {
            Generator.onDestroy(e)
        }
    })
})

