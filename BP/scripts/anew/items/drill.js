/**
* Builds a Minecraft fill command string for a cubic drill operation,
* with conditions to skip unbreakable blocks.
*
* The cube is centered on the mined block's X and Z, and Y is offset by -1
* so the drill digs just below the mined block.
*
* @param {{x:number, y:number, z:number}} location The mined block location.
* @param {number} size The cube size (edge length).
* @returns {string} A Minecraft command string with `execute ... fill ... air destroy`.
*/
function buildCubicDrillCommand(location, size) {
    const radius = Math.floor(size / 2)

    const { x, y, z } = location
    const minX = x - radius
    const maxX = x + radius
    const minY = (y - 1)
    const maxY = (y - 1) + 2 * radius
    const minZ = z - radius
    const maxZ = z + radius

    // Add all conditions for unbreakable blocks
    const conditions = DoriosAPI.unbreakableBlocks
        .map(b => `unless block ${x} ${y} ${z} ${b}`)
        .join(" ")

    return `execute ${conditions} run fill ${minX} ${minY} ${minZ} ${maxX} ${maxY} ${maxZ} air destroy`
}

DoriosAPI.register.itemComponent("drill", {
    /**
     * Custom drill behavior when mining a block.
     */
    onMineBlock({ block }, { params }) {
        const shape = params?.shape ?? "cubic"

        if (shape === "cubic") {
            const size = params?.size ?? 3
            const cmd = buildCubicDrillCommand(block.location, size)
            block.dimension.runCommand(cmd)
        }
    }
})