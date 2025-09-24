import { world } from '@minecraft/server'
import { Generator, settings } from '../generators_class.js'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:solar_panel', {
        beforeOnPlayerPlace(e) {
            Generator.spawnGeneratorEntity(e, settings.solarPanel)
        },
        onTick(e) {
            const gen = new Generator(e.block, settings.solarPanel)
            gen.transferEnergy(20)

            Generator.tick(() => {
                const isDay = world.getTimeOfDay() > 0 && world.getTimeOfDay() < 13000

                const energy = gen.energy
                if (energy.get() < energy.cap && isDay) {
                    let burnSpeed = Math.min(gen.burnSpeed, energy.cap - energy.get())
                    energy.add(burnSpeed)
                    gen.turnOn()
                } else {
                    gen.turnOff()
                }
                gen.displayEnergy()
            })
        },
        onPlayerDestroy(e) {
            Generator.onDestroy(e)
        }
    })
})