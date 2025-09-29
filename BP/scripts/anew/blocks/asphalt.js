DoriosAPI.register.blockComponent('asphalt', {
    onPlayerInteract({ block, player }) {
        const hand = player.getComponent('equippable').getEquipment('Mainhand')

        if (!hand) return
        try {
            block.setPermutation(block.permutation.withState('utilitycraft:texture', hand.typeId))
        } catch { }
    },
    onStepOn({ block }) {
        let { x, y, z } = block.location
        const player = block.dimension.getPlayers({ location: { x, y: y + 1, z } })[0]
        if (player) player.runCommand('effect @s speed 2 3 true')
    }
})
