import { world } from '@minecraft/server'

/**
 * Handles illumination blocks (big_torch and lantern) when placed or broken.
 * 
 * - When a block is placed, the corresponding illumination function is executed.
 * - When a block is broken, the corresponding break function is executed.
 * - Lanterns trigger multiple functions around them (±19 blocks on X/Z).
 *
 * This avoids using custom block components and relies purely on
 * `playerPlaceBlock` and `playerBreakBlock` events.
 */

/**
 * Event handler for block placement.
 * Runs a function depending on the placed block type.
 */
world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
    const { typeId, location, dimension } = block
    const { x, y, z } = location

    // Handle Big Torch placement
    if (typeId === 'utilitycraft:big_torch') {
        dimension.runCommand(`execute positioned ${x} ${y} ${z} run function ilumination/big_torch`)
    }

    // Handle Lantern placement (fires in 4 directions ±19 on X/Z)
    if (typeId === 'utilitycraft:lantern') {
        dimension.runCommand(`execute positioned ${x + 19} ${y} ${z} run function ilumination/big_torch`)
        dimension.runCommand(`execute positioned ${x - 19} ${y} ${z} run function ilumination/big_torch`)
        dimension.runCommand(`execute positioned ${x} ${y} ${z + 19} run function ilumination/big_torch`)
        dimension.runCommand(`execute positioned ${x} ${y} ${z - 19} run function ilumination/big_torch`)
    }
})

/**
 * Event handler for block breaking.
 * Runs a break function depending on the destroyed block type.
 */
world.afterEvents.playerBreakBlock.subscribe(({ brokenBlockPermutation, block }) => {
    const typeId = brokenBlockPermutation.type.id
    const { x, y, z } = block.location
    const { dimension } = block

    // Handle Big Torch destruction
    if (typeId === 'utilitycraft:big_torch') {
        dimension.runCommand(`execute positioned ${x} ${y} ${z} run function ilumination/big_torch_break`)
    }

    // Handle Lantern destruction (fires in 4 directions ±19 on X/Z)
    if (typeId === 'utilitycraft:lantern') {
        dimension.runCommand(`execute positioned ${x + 19} ${y} ${z} run function ilumination/big_torch_break`)
        dimension.runCommand(`execute positioned ${x - 19} ${y} ${z} run function ilumination/big_torch_break`)
        dimension.runCommand(`execute positioned ${x} ${y} ${z + 19} run function ilumination/big_torch_break`)
        dimension.runCommand(`execute positioned ${x} ${y} ${z - 19} run function ilumination/big_torch_break`)
    }
})
