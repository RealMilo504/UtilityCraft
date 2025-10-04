import { ModalFormData } from "@minecraft/server-ui";
/**
 * Mob Grinder Block Component
 * - Inflicts continuos damage on the entity within the block's effect radius
 * - Accepts range and (upcoming) damage upgrades
 * - Allows players to configure radius, damage and on/off state via UI.
 */
DoriosAPI.register.blockComponent("mob_grinder", {
    onTick({ block: grinder, dimension}) {
        const { x, y, z } = grinder.location

        // isOn pode vir como boolean ou string "true"
        const isOnState = grinder.permutation.getState("utilitycraft:isOn")
        const isOn = isOnState === true || isOnState === "true"

        // Limit
        let rangeUpgrade = Number(grinder.permutation.getState("utilitycraft:range"))
        if (Number.isNaN(rangeUpgrade)) rangeUpgrade = 0

        let damageUpgrade = Number(grinder.permutation.getState("utilitycraft:damage"))
        if (Number.isNaN(damageUpgrade)) damageUpgrade = 0

        // níveis escolhidos pelo jogador (dentro do teto)
        let rangeSelected = Number(grinder.permutation.getState("utilitycraft:rangeSelected"))
        if (Number.isNaN(rangeSelected)) rangeSelected = rangeUpgrade

        let damageSelected = Number(grinder.permutation.getState("utilitycraft:damageSelected"))
        if (Number.isNaN(damageSelected)) damageSelected = damageUpgrade

        // mapa de alcance (index corresponde ao level)
        let rangeMap = [0.5, 1, 1.5, 2, 2.5] // mantém o seu mapa original; index 0 já é válido
        const maxIndex = rangeMap.length - 1

        // garante índice seguro dentro do array
        const clampIndex = (i) => Math.max(0, Math.min(Math.floor(i), maxIndex))

        const trueRange = rangeMap[clampIndex(rangeSelected)]

        if (isOn) {
            // garante damage mínimo 0
            const damageAmount = Math.max(0, Math.floor(damageSelected))

            dimension.runCommand(
                `damage @e[r=${trueRange}, type=!item, family=!inanimate, x=${x + 0.5}, y=${y}, z=${z + 0.5}] ${damageAmount} none entity @p`
            )
        }
    },

    onPlayerInteract(e) {
        const { block, player } = e
        const hand = player.getComponent("equippable").getEquipment("Mainhand")
        // Only open menu if empty-handed and not sneaking
        if (!hand && !player.isSneaking) {
            let isOnState = block.permutation.getState("utilitycraft:isOn")
            let isOn = isOnState === true || isOnState === "true"

            // teto (upgrades)
            let rangeUpgrade = Number(block.permutation.getState("utilitycraft:range"))
            if (Number.isNaN(rangeUpgrade)) rangeUpgrade = 0

            let damageUpgrade = Number(block.permutation.getState("utilitycraft:damage"))
            if (Number.isNaN(damageUpgrade)) damageUpgrade = 0

            // selecionados (nível atual do jogador)
            let rangeSelected = Number(block.permutation.getState("utilitycraft:rangeSelected"))
            if (Number.isNaN(rangeSelected)) rangeSelected = rangeUpgrade

            let damageSelected = Number(block.permutation.getState("utilitycraft:damageSelected"))
            if (Number.isNaN(damageSelected)) damageSelected = damageUpgrade

            // limites do design
            const RANGE_CAP = 4
            const DAMAGE_CAP = 8

            // limita o teto pelos caps do design e pelo tamanho do rangeMap (se necessário)
            const rangeMapLength = 5 // se você mudar rangeMap no onTick, mantenha o mesmo tamanho aqui
            const maxRange = Math.min(rangeUpgrade, RANGE_CAP, rangeMapLength - 1)
            const maxDamage = Math.min(damageUpgrade, DAMAGE_CAP)

            const modalForm = new ModalFormData()
                .title("Mob Grinder Settings")
                .toggle("Off/On", { defaultValue: isOn })
                // Range suporta 0 (conforme você comentou) -> slider de 0 a maxRange
                .slider("§9Range §rLevel", 0, maxRange, { defaultValue: Math.min(rangeSelected, maxRange) })
                .slider("§cDamage §rLevel", 1, maxDamage, { defaultValue: Math.min(damageSelected, maxDamage) })

            modalForm.show(player).then(formData => {
                if (!formData.canceled && formData.formValues) {
                    const [newOn, newRangeSelected, newDamageSelected] = formData.formValues

                    // salva apenas os valores selecionados — não sobrescreve os tetos (upgrades)
                    block.setPermutation(block.permutation.withState("utilitycraft:isOn", newOn))
                    block.setPermutation(block.permutation.withState("utilitycraft:rangeSelected", newRangeSelected))
                    block.setPermutation(block.permutation.withState("utilitycraft:damageSelected", newDamageSelected))
                }
            })
        }
    }
})
