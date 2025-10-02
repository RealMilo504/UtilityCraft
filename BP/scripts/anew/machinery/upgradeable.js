DoriosAPI.register.blockComponent("utilitycraft:upgradeable", {
    onPlayerInteract({ player, block }, { params }) {
        const mainHand = player.getEquipment("Mainhand")
        const states = block.permutation.getAllStates()
    }
})

