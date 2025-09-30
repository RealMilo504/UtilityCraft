import { ActionFormData, ModalFormData } from '@minecraft/server-ui'


DoriosAPI.register.blockComponent('mechanic_hoppers', {
    onTick({ block: hopper, dimension }) {
        if (!hopper.isValid || hopper.isAir) return
        let { x, y, z } = hopper.location;
        let initialLoc = { x, y, z };
        let finalLoc = { x, y, z };

        /** @type {import("@minecraft/server").Entity} */
        const hopperEntity = hopper.getEntity()
        const hopperInv = hopperEntity.getComponent('inventory')?.container
        if (!hopperEntity || !hopperInv) return

        let speed = 4 * (2 ** hopper.getState('utilitycraft:speed'))
        const acceptedItems = hopperEntity.getTags()
        let state = hopper.getDynamicProperty('utilitycraft:whitelistOn')

        const direction = block.permutation.getState('minecraft:block_face')
        const hasFilter = block.permutation.getState('utilitycraft:filter')


        const id = hopper.typeId;
        const isDropper = id === "utilitycraft:mechanic_dropper";

        if (id === "utilitycraft:mechanic_hopper" || (isDropper && direction === "up")) {
            initialLoc.y++
            finalLoc.y--
        } else if (id === "utilitycraft:mechanic_upper" || (isDropper && direction !== "up")) {
            initialLoc.y--
        }

        const firstBlock = dimension.getBlock(loc)
        if (firstBlock?.typeId == "dustveyn:storage_drawers") {

            return
        }


    }
})