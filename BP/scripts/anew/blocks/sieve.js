import { ItemStack } from "@minecraft/server"
import { sieveDrops, meshMulti } from "../config/sieve_drops.js"

/**
 * Represents a single sieve block with utility methods.
 */
class Sieve {
    /**
     * @param {import("@minecraft/server").Block} block 
     */
    constructor(block) {
        this.block = block
        this.perm = block.permutation
    }

    get mesh() { return this.perm.getState("utilitycraft:mesh") }
    get blockType() { return this.perm.getState("utilitycraft:block") }
    get stage() { return this.perm.getState("utilitycraft:state") }


    insertMesh(player, itemId) {
        if (this.mesh !== "empty") return false
        this.block.setState("utilitycraft:mesh", itemId.split(":")[1])
        if (!player.isInCreative()) {
            player.runCommand(`clear @s ${itemId} 0 1`)
        }
        return true
    }

    removeMesh(player) {
        if (this.mesh === "empty" || this.blockType !== "empty" || this.stage !== 0) return false

        // Devuelve la malla al jugador
        player.giveItem("utilitycraft:" + this.mesh)

        this.block.setState("utilitycraft:mesh", "empty")
        this.block.setState("utilitycraft:state", 0)
        return true
    }

    /**
     * Swap the current mesh with a new one from player's hand.
     * Drops/returns the old mesh and equips the new one.
     * @param {import("@minecraft/server").Player} player
     * @param {string} newMeshId - e.g. "utilitycraft:iron_mesh"
     */
    swapMesh(player, newMeshId) {
        if (this.mesh === "empty") return false

        // Devuelve la malla vieja
        player.giveItem("utilitycraft:" + this.mesh)

        // Coloca la nueva
        this.block.setState("utilitycraft:mesh", newMeshId.split(":")[1])
        if (!player.isInCreative()) {
            player.runCommand(`clear @s ${newMeshId} 0 1`)
        }

        this.block.dimension.playSound?.("item.armor.equip_chain", this.block.location)
        return true
    }

    insertBlock(player, mainHand) {
        if (this.mesh === "empty" || this.blockType !== "empty" || this.stage !== 0) return false
        if (!sieveDrops[mainHand.typeId]) return false

        this.block.setState("utilitycraft:block", mainHand.typeId)
        this.block.setState("utilitycraft:state", 4)
        if (!player.isInCreative()) {
            player.runCommand(`clear @s ${mainHand.typeId} 0 1`)
        }
        this.block.dimension.playSound("dig.gravel", this.block.location)
        return true
    }

    processStage() {
        if (this.stage > 1 && this.blockType !== "empty" && this.mesh !== "empty") {
            this.block.setState("utilitycraft:state", this.stage - 1)
            this.block.dimension.playSound("dig.gravel", this.block.location)
            return true
        }
        return false
    }

    finishFiltering() {
        if (this.stage !== 1 || this.blockType === "empty" || this.mesh === "empty") return false

        const { x, y, z } = this.block.location

        const multi = meshMulti["utilitycraft:" + this.mesh]
        if (!multi) return false
        const sievableBlock = sieveDrops[this.blockType]
        sievableBlock?.forEach(loot => {
            if (Math.random() <= loot.chance * multi) {
                const qty = Math.ceil(Math.random() * loot.amount)
                this.block.dimension.spawnItem(new ItemStack(loot.item, qty), {
                    x: x + 0.25 + Math.random() / 2,
                    y: y + 0.75,
                    z: z + 0.25 + Math.random() / 2
                })
            }
        })

        this.block.setState("utilitycraft:block", "empty")
        this.block.setState("utilitycraft:state", 0)
        this.block.dimension.playSound("dig.gravel", this.block.location)
        return true
    }
}

DoriosAPI.register.blockComponent("sieve", {
    onPlayerInteract(e) {
        const { block, player } = e
        const mainHand = player.getComponent("equippable").getEquipment("Mainhand")
        const sieve = new Sieve(block)

        // Sneak + empty hand → remove mesh
        if (!mainHand && player.isSneaking) {
            sieve.removeMesh(player)
            return
        }

        // Insert or swap mesh
        if (mainHand?.typeId.includes("mesh")) {
            if (sieve.mesh === "empty") {
                sieve.insertMesh(player, mainHand.typeId)
            } else {
                sieve.swapMesh(player, mainHand.typeId)
            }
            return
        }

        let remaining = mainHand?.amount ?? 0
        const radius = 2
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dz = -radius; dz <= radius; dz++) {
                const sieveBlock = block.dimension.getBlock({
                    x: block.location.x + dx,
                    y: block.location.y,
                    z: block.location.z + dz
                })

                if (!sieveBlock) continue
                if (sieveBlock.typeId !== "utilitycraft:sieve") continue

                const sieve = new Sieve(sieveBlock)

                if (mainHand && remaining > 0 && sieve.insertBlock(player, mainHand)) {
                    remaining--
                }

                if (sieve.stage === 1) {
                    sieve.finishFiltering()
                } else {
                    sieve.processStage()
                }
            }
        }
    },

    onPlayerDestroy(e) {
        const { destroyedBlockPermutation, block, player } = e
        const mesh = destroyedBlockPermutation.getState("utilitycraft:mesh")
        if (mesh !== "empty") {
            player.giveItem("utilitycraft:" + mesh)
        }
    }
})
