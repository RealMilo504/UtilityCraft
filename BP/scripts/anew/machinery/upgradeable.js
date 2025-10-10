import { ItemStack } from '@minecraft/server'

DoriosAPI.register.blockComponent("upgradeable", {
    onPlayerInteract({ player, block }) {
        /** @type {import('@minecraft/server').ItemStack} */
        const mainHand = player.getEquipment("Mainhand")
        if (!mainHand || !mainHand?.typeId.endsWith("_upgrade")) return

        const upgradeKey = mainHand.typeId.replace("_upgrade", "");

        const current = block.permutation.getState(upgradeKey);
        if (current === undefined) {
            player.onScreenDisplay.setActionBar(`§cBlock does not support upgrade ${DoriosAPI.utils.formatIdToText(upgradeKey)}`);
            return;
        }

        const max = getMaxState(block, upgradeKey);

        if (current >= max) {
            player.onScreenDisplay.setActionBar(`§c${upgradeKey} is already at max (${max})`)
            return;
        }

        block.setState(upgradeKey, current + 1);
        player.runCommand(`clear @s ${mainHand.typeId} 0 1`);

        player.onScreenDisplay.setActionBar(`§aApplied ${upgradeKey} upgrade (${current + 1}/${max})`);
    },
    /**
     * Drop upgrade items when the block is broken
     */
    onPlayerBreak({ block, brokenBlockPermutation, dimension }) {
        const states = brokenBlockPermutation.getAllStates();

        for (const [key, value] of Object.entries(states)) {
            if (typeof value !== "number" || value <= 0) continue;

            const upgradeId = `${key}_upgrade`;
            try {
                dimension.spawnItem(new ItemStack(upgradeId, value), block.center());
            } catch {
                // En caso de que el ítem no exista, simplemente lo ignora
            }
        }
    }
})

/**
 * Gets the maximum valid value of a block state by testing sequentially up to a theoretical maximum.
 *
 * This function attempts to set the block state incrementally until it throws an error,
 * then returns the last valid value. By default it tests values from current+1 up to 16.
 *
 * @param {import("@minecraft/server").Block} block Block to test the state on.
 * @param {string} key Block state key to test (e.g., "utilitycraft:speed").
 * @param {number} [maxTry=16] Maximum value to test (theoretical cap for integer states).
 * @returns {number} Maximum valid state value for the given key, or 0 if the state does not exist.
 */
function getMaxState(block, key, maxTry = 16) {
    const perm = block.permutation;
    const current = perm.getState(key);

    if (current === undefined) return 0;

    let lastValid = current;
    for (let i = current + 1; i <= maxTry; i++) {
        try {
            perm.withState(key, i);
            lastValid = i;
        } catch {
            break;
        }
    }
    return lastValid;
}