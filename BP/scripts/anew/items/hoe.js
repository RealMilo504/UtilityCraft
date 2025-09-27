DoriosAPI.register.itemComponent("hoe", {
    onUseOn({ block }, { params }) {
        let { x, y, z } = block.location;

        const size = params?.size ?? 1; // default = 1 (3x3 area)
        const runTractor = params?.runTractor ?? false;

        // Fill farmland in the area
        block.dimension.runCommand(
            `fill ${x - size} ${y} ${z - size} ${x + size} ${y} ${z + size} farmland replace dirt`
        );
        block.dimension.runCommand(
            `fill ${x - size} ${y} ${z - size} ${x + size} ${y} ${z + size} farmland replace grass`
        );

        // Optional: run tractor function
        if (runTractor) {
            block.dimension.runCommand(
                `execute positioned ${x} ${y} ${z} run function tractor`
            );
        }
    }
});
