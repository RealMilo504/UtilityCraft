/**
* Valid camouflage block types for asphalt.
* These correspond to possible textures stored in the block state `utilitycraft:texture`.
*/
const camo = [
    'utilitycraft:asphalt',
    'minecraft:grass_path',
    'minecraft:grass_block',
    'minecraft:dirt',
    'minecraft:cobblestone',
    'minecraft:stone',
    'minecraft:gravel'
]

DoriosAPI.register.blockComponent('asphalt', {
    onPlayerInteract({ block, player }) {
        const hand = player.getComponent('equippable').getEquipment('Mainhand')

        if (!hand) return

        for (let i = 0; i < camo.length; i++) {
            if (hand.typeId === camo[i]) {
                block.setPermutation(block.permutation.withState('utilitycraft:texture', i))
                break
            }
        }
    },

    onStepOn({ block }) {
        let { x, y, z } = block.location
        y++

        const player = block.dimension.getPlayers({ location: { x, y, z } })[0]
        if (player) {
            player.runCommand('effect @s speed 2 3 true')
        }
    }
})
