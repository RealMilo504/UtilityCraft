import { ModalFormData } from "@minecraft/server-ui";
/**
 * Mob Grinder Block Component
 * - Inflicts continuos damage on the entity within the block's effect radius
 * - Accepts range and (upcoming) damage upgrades
 * - Allows players to configure radius, damage and on/off state via UI.
 */
DoriosAPI.register.blockComponent("mob_grinder", {
    onTick(e) {
        const { block } = e
        const { x, y, z } = block.location

        /* Collects states
        * @param {boolean} isOn - Determines the block state
        * @param {number} range - Determines the range level
        * @param {number} rangeMap - Determines the value of each range level. e. g (range = 4, rangeMap = 1.75)
        * @param {number} damage - Determines the damage level
        * @param {number} damageMap - Determines the damage level
        */
        const isOn = block.permutation.getState("utilitycraft:isOn")
        const range = block.permutation.getState("utilitycraft:rangeSelected")
        const damage = block.permutation.getState("utilitycraft:damageSelected")
        let rangeMap = [0.5, 1, 1.5, 1.75, 2]
        let trueRange = rangeMap[range]

        if (isOn) {
            block.dimension.runCommand(
                `damage @e[r = ${trueRange}, type = !item, family = !innanimate, x = ${x + 0.5}, y = ${y}, z = ${z + 0.5}] ${damage} none entity @p`
            )
        }
    },
    onPlayerInteract(e) {
        const { block, player } = e
        const hand = player.getComponent("equippable").getEquipment("Mainhand")
        // Only open menu if empty-handed and not sneaking
        if (!hand && !player.isSneaking) {
            let isOn = block.permutation.getState("utilitycraft:isOn")
            const range = block.permutation.getState("utilitycraft:rangeSelected")
            const damage = block.permutation.getState("utilitycraft:damageSelected")

            const modalForm = new ModalFormData()
                .title("Mob Grinder Settings")
                .toggle("Off/On", { defaultValue: isOn })
                .slider("§9Range §rLevel", 1, 4, { defaultValue: range })
                .slider("§4Damage §rLevel", 1, 8, { defaultValue: damage })

            modalForm.show(player).then(formData => {
                if (!formData.canceled && formData.formValues) {
                    const [newOn, newRange, newDamage] = formData.formValues
                    block.setPermutation(block.permutation.withState("utilitycraft:isOn", newOn))
                    block.setPermutation(block.permutation.withState("utilitycraft:rangeSelected", newRange))
                    block.setPermutation(block.permutation.withState("utilitycraft:damageSelected", newDamage))
                }
            })
        }
    }
})
