import { system, ItemStack } from "@minecraft/server"

DoriosAPI.register.blockComponent("xp", {
    onPlayerInteract({ block }) {
        if (block.typeId !== "utilitycraft:xp_spout") return

        const isOpen = block.permutation.getState("utilitycraft:isOpen")
        block.setPermutation(
            block.permutation.withState("utilitycraft:isOpen", !isOpen)
        )
    },

    onTick({ block }) {
        if (!worldLoaded) return;
        let { x, y, z } = block.location

        // ========== XP DRAIN ==========
        if (block.typeId === "utilitycraft:xp_drain") {
            x += 0.5
            z += 0.5

            const player = block.dimension.getPlayers({
                location: { x, y, z },
                maxDistance: 0.8
            })[0]

            const tankEntity = block.dimension.getEntities({
                tags: ["tank"],
                location: { x, y: y - 1, z },
                maxDistance: 0.1
            })[0]

            const tank = block.below(1)

            if (
                player &&
                !tankEntity &&
                tank.permutation.getState("utilitycraft:hasliquid") === false
            ) {
                if (player.getTotalXp() > 0) {
                    tank.setPermutation(
                        tank.permutation.withState("utilitycraft:hasliquid", true)
                    )
                    y -= 1
                    block.dimension.spawnEntity(`utilitycraft:fluid_tank_xp`, { x, y, z })
                    block.dimension.runCommand(
                        `tag @e[type=utilitycraft:fluid_tank_xp] add tank`
                    )

                    system.run(() => {
                        const entityTank =
                            block.dimension.getEntitiesAtBlockLocation(
                                block.below(1).location
                            )[0]
                        entityTank.addTag(`${tank.typeId}`)
                        const tankCap = entityTank.getComponent("minecraft:health")
                        entityTank.setDynamicProperty("utilitycraft:liquid", 1)
                        tankCap.setCurrentValue(1)
                    })

                    if (player.xpEarnedAtCurrentLevel === 0) {
                        player.addLevels(-1)
                        player.addExperience(player.totalXpNeededForNextLevel - 1)
                    } else {
                        player.addExperience(-1)
                    }
                }
            }

            if (
                player &&
                tankEntity &&
                tank.permutation.getState("utilitycraft:hasliquid") === true
            ) {
                const tankCap = tankEntity.getComponent("minecraft:health")
                const actualXp = tankEntity.getDynamicProperty("utilitycraft:liquid")

                if (player.getTotalXp() > 0 && actualXp < tankCap.effectiveMax) {
                    y -= 1
                    if (player.xpEarnedAtCurrentLevel === 0) {
                        player.addLevels(-1)
                        player.addExperience(player.totalXpNeededForNextLevel - 1)
                        tankCap.setCurrentValue(actualXp + 1)
                        tankEntity.setDynamicProperty(
                            "utilitycraft:liquid",
                            actualXp + 1
                        )
                    } else {
                        const amount =
                            player.xpEarnedAtCurrentLevel >= 10
                                ? 10
                                : player.xpEarnedAtCurrentLevel
                        player.addExperience(-amount)
                        tankCap.setCurrentValue(actualXp + amount)
                        tankEntity.setDynamicProperty(
                            "utilitycraft:liquid",
                            actualXp + amount
                        )
                    }
                }
            }
        }

        // ========== XP SPOUT ==========
        if (
            block.typeId === "utilitycraft:xp_spout" &&
            block.permutation.getState("utilitycraft:isOpen") === true
        ) {
            let xs = 0,
                zs = 0
            let tank = undefined
            switch (block.permutation.getState("minecraft:block_face")) {
                case "north":
                    tank = block.south(1)
                    z += 1
                    zs = 0.8
                    xs = 0.4
                    break
                case "south":
                    tank = block.north(1)
                    z -= 1
                    zs = 0.2
                    xs = 0.4
                    break
                case "west":
                    tank = block.east(1)
                    x += 1
                    xs = 0.6
                    zs = 0.5
                    break
                case "east":
                    tank = block.west(1)
                    x -= 1
                    xs = 0.1
                    zs = 0.5
                    break
            }
            x += 0.5
            z += 0.5

            const tankEntity = block.dimension.getEntities({
                families: ["tank"],
                location: { x, y, z },
                maxDistance: 0.1
            })[0]

            if (tankEntity && tankEntity.typeId === "utilitycraft:fluid_tank_xp") {
                const tankCap = tankEntity.getDynamicProperty("utilitycraft:liquid")
                if (tankCap > 1) {
                    tankEntity.setDynamicProperty("utilitycraft:liquid", tankCap - 1)
                    tankEntity.getComponent("minecraft:health").setCurrentValue(
                        tankCap - 1
                    )
                    block.dimension.spawnEntity("xp_orb", {
                        x: block.location.x + xs,
                        y: block.location.y + 0.5,
                        z: block.location.z + zs
                    })
                } else {
                    tankEntity.remove()
                    block.dimension.spawnEntity("xp_orb", {
                        x: block.location.x + xs,
                        y: block.location.y + 0.5,
                        z: block.location.z + zs
                    })
                    tank.setPermutation(
                        tank.permutation.withState("utilitycraft:hasliquid", false)
                    )
                }
            }
        }
    }
})
