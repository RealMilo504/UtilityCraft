DoriosAPI.register.blockComponent("utilitycraft:upgradeable", {
    onPlayerInteract({ player, block }, { params }) {
        /** @type {import('@minecraft/server').ItemStack} */
        const mainHand = player.getEquipment("Mainhand")
        if (!mainHand || !mainHand?.typeId.endsWith("_upgrade")) return

        player.sendMessage(`${JSON.stringify(block.permutation.getAllStates())}`)

    }
})

