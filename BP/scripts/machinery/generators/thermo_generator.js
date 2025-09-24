import { world, ItemStack, system } from '@minecraft/server'
import * as doriosAPI from '../../doriosAPI.js'
import { Generator, settings } from '../generators_class.js'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('utilitycraft:thermo_generator', {
        beforeOnPlayerPlace(e) {
            Generator.spawnGeneratorEntity(e, settings.thermoGen, (entity) => {
                entity.getComponent('minecraft:inventory').container.setItem(6, new ItemStack(`utilitycraft:arrow_indicator`))
            })
        },
        onTick(e) {
            const gen = new Generator(e.block, settings.thermoGen)
            gen.transferEnergy(20)
            gen.entity?.runCommand(`scoreboard players set @s liquidCap_0 ${settings.thermoGen.liquidCapBase * gen.multi}`)

            Generator.tick(() => {
                gen.liquid.display(3)

                const multi = settings.heatSources[e.block.below(1)?.typeId]
                const hasWater = gen.liquid.type == 'water' && gen.liquid.get() > 0
                if (gen.energy.get() < gen.energy.cap && hasWater && multi) {
                    let burnSpeed = Math.min(
                        gen.burnSpeed * multi,
                        gen.energy.cap - gen.energy.get(),
                        gen.liquid.get() * 40
                    )
                    gen.liquid.add(-burnSpeed / 40)
                    gen.energy.add(burnSpeed)
                    gen.turnOn()
                } else { gen.turnOff() }
                gen.displayEnergy()
            })
        },
        onPlayerInteract(e) {
            const player = e.player
            const gen = new Generator(e.block, settings.thermoGen)
            if (!gen.entity) return

            let mainhand = player.getComponent('equippable').getEquipment('Mainhand')?.typeId

            const insert = gen.liquid.liquidItem(mainhand, settings.itemLiquidContainers)
            if (insert == false) return
            if (player.getGameMode() != 'creative') {
                doriosAPI.entities.changeItemAmount(player, player.selectedSlotIndex, -1)
                if (insert != undefined) {
                    doriosAPI.entities.addItem(player, insert)
                }
            }
        },
        onPlayerDestroy(e) {
            Generator.onDestroy(e)
        }
    })
})

