import * as doriosAPI from '../../doriosAPI.js'
import { Generator, settings } from '../generators_class.js'

doriosAPI.register.OldBlockComponent('utilitycraft:magmator', {
    beforeOnPlayerPlace(e) {
        Generator.spawnGeneratorEntity(e, settings.magmator, (entity) => {
            doriosAPI.entities.setItem(entity, 6, `utilitycraft:arrow_indicator`)
        })
    },
    onTick(e) {
        const gen = new Generator(e.block, settings.magmator)
        gen.transferEnergy(20)
        gen.entity?.runCommand(`scoreboard players set @s liquidCap_0 ${settings.magmator.liquidCapBase * gen.multi}`)

        Generator.tick(() => {
            gen.liquid.display(3)

            const hasLava = gen.liquid.type == 'lava' && gen.liquid.get() > 0
            if (gen.energy.get() < gen.energy.cap && hasLava) {
                let burnSpeed = Math.min(
                    gen.burnSpeed,
                    gen.energy.cap - gen.energy.get(),
                    gen.liquid.get() * 100
                )
                gen.liquid.add(-burnSpeed / 100)
                gen.energy.add(burnSpeed)
                gen.turnOn()
            } else { gen.turnOff() }
            gen.displayEnergy()
        })
    },
    onPlayerDestroy(e) {
        Generator.onDestroy(e)
    },
    onPlayerInteract(e) {
        const player = e.player
        const gen = new Generator(e.block, settings.magmator)
        if (!gen.entity) return

        const mainhand = doriosAPI.entities.getEquipment(player, 'Mainhand')?.typeId

        const insert = gen.liquid.liquidItem(mainhand, settings.itemLiquidContainers)
        if (insert == false) return
        if (player.getGameMode() != 'creative') {
            doriosAPI.entities.changeItemAmount(player, player.selectedSlotIndex, -1)
            if (insert != undefined) {
                doriosAPI.entities.addItem(player, insert)
            }
        }
    }
})