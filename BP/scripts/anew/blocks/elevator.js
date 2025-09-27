/**
* Dimension Y-limits for elevator scanning.
* @type {Record<string, { ymin: number, ymax: number }>}
*/
const DIMENSION_LIMITS = {
    'minecraft:overworld': { ymin: -64, ymax: 320 },
    'minecraft:nether': { ymin: 0, ymax: 129 },
    'minecraft:the_end': { ymin: 0, ymax: 257 }
}

DoriosAPI.register.blockComponent('elevator', {
    onStepOff(e) {
        const { block } = e
        let { x, y, z } = block.location
        const limits = DIMENSION_LIMITS[block.dimension.id]
        if (!limits) return

        y++ // Start above current block
        const player = block.dimension.getPlayers({ location: { x, y, z } })[0]
        if (!player) return

        if (player.isJumping && !player.isSneaking) {
            for (let yi = y; yi < limits.ymax; yi++) {
                const checkBlock = block.dimension.getBlock({ x, y: yi, z })
                if (checkBlock?.typeId === block.typeId) {
                    block.dimension.runCommand(`tp "${player.nameTag}" ${x} ${yi + 1} ${z}`)
                    player.runCommand(`playsound tile.elevator.up "${player.nameTag}" ~ ~ ~ 100`)
                    break
                }
            }
        }
    },

    onPlayerInteract(e) {
        const { block, player } = e
        let { x, y, z } = block.location
        const limits = DIMENSION_LIMITS[block.dimension.id]
        if (!limits) return

        const belowY = y - 1

        if (player.isSneaking) {
            // Move downwards
            for (let yi = belowY; yi >= limits.ymin; yi--) {
                const checkBlock = block.dimension.getBlock({ x, y: yi, z })
                if (checkBlock?.typeId === block.typeId) {
                    block.dimension.runCommand(`tp "${player.nameTag}" ${x} ${yi + 1} ${z}`)
                    player.runCommand(`playsound tile.elevator.down "${player.nameTag}" ~ ~ ~ 100`)
                    break
                }
            }
        } else {
            // Nether penalty: 10% chance to ignite
            if (block.dimension.id === 'minecraft:nether' && Math.random() < 0.1) {
                player.setOnFire(1)
            }

            // Move upwards
            for (let yi = belowY + 2; yi < limits.ymax; yi++) {
                const checkBlock = block.dimension.getBlock({ x, y: yi, z })
                if (checkBlock?.typeId === block.typeId) {
                    block.dimension.runCommand(`tp "${player.nameTag}" ${x} ${yi + 1} ${z} true`)
                    player.runCommand(`playsound tile.elevator.up "${player.nameTag}" ~ ~ ~ 100`)
                    break
                }
            }
        }
    }
})
