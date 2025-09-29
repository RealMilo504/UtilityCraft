DoriosAPI.register.blockComponent("cobble_generators", {
    onTick({ block, dimension }) {
        let { x, y, z } = block.location

        // Facing direction offset
        const facing = block.getState("minecraft:facing_direction")
        const facingOffsets = {
            up: [0, -1, 0], down: [0, 1, 0],
            north: [0, 0, 1], south: [0, 0, -1],
            west: [1, 0, 0], east: [-1, 0, 0]
        }
        if (facingOffsets[facing]) {
            const [dx, dy, dz] = facingOffsets[facing]
            x += dx; y += dy; z += dz
        }

        // Progress stored in e0/e1
        const e0 = block.getState("utilitycraft:e0")
        const e1 = block.getState("utilitycraft:e1")
        const quantity = e1 * 10 + e0

        if (DoriosAPI.addItemAt({ x, y, z }, dimension, "minecraft:cobblestone", 1 + quantity)) {
            block.setState("utilitycraft:e0", 0)
            block.setState("utilitycraft:e1", 0)
            return
        }

        if (quantity < 64) {
            block.setState("utilitycraft:e0", e0 < 10 ? e0 + 1 : 0)
            block.setState("utilitycraft:e1", e0 < 10 ? e1 : e1 + 1)
        }
    },
    onPlayerInteract({ block, player }) {
        const e0 = block.getState("utilitycraft:e0")
        const e1 = block.getState("utilitycraft:e1")
        const quantity = e1 * 10 + e0

        if (quantity > 0 && !player.getComponent("equippable")?.getEquipment("Mainhand")) {
            player.giveItem("cobblestone", quantity)
            block.setState("utilitycraft:e0", 0)
            block.setState("utilitycraft:e1", 0)
        }
    }
})
