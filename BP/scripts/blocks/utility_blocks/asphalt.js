import { world } from '@minecraft/server'

const camo = [
    'twm:asphalt',
    'minecraft:grass_path',
    'minecraft:grass_block',
    'minecraft:dirt',
    'minecraft:cobblestone',
    'minecraft:stone',
    'minecraft:gravel'
]

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:asphalt', {
        onPlayerInteract(e) {
            const { block, player } = e
            const hand = player.getComponent('equippable').getEquipment('Mainhand')
            for (let i = 0; i < camo.length; i++) {
                if (hand.typeId == camo[i]) {
                    block.setPermutation(block.permutation.withState('twm:texture', i))
                }
            }
        },
        onStepOn(e) {
            const { block } = e
            let { x, y, z } = block.location
            y++
            const player = block.dimension.getPlayers({ location: { x, y, z } })[0]
            player.runCommand('effect @s speed 2 3 true')
        }
    })
})