import { world } from '@minecraft/server'

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('twm:elevator', {
        onStepOff(e) {
            const { block } = e
            var { x, y, z } = block.location
            y++;
            let ymax
            switch (block.dimension.id) {
                case 'minecraft:overworld':
                    ymax = 320
                    break
                case 'minecraft:nether':
                    ymax = 129
                    break
                case 'minecraft:the_end':
                    ymax = 257
                    break
            }
            const player = block.dimension.getPlayers({ location: { x, y, z } })[0]
            if (player.isJumping && !player.isSneaking) {
                for (var y = y; y < ymax; y++) {
                    if (block.dimension.getBlock({ x: block.location.x, y, z: block.location.z }).typeId == 'twm:elevator') {
                        y++
                        block.dimension.runCommand(`tp "${player.nameTag}" ${x} ${y} ${z}`)
                        player.runCommand(`playsound tile.elevator.up "${player.nameTag}" ~ ~ ~ 100`)
                        break
                    }
                }
            }
        },
        onPlayerInteract(e) {
            const { block, player } = e
            var { x, y, z } = block.location
            let ymin, ymax
            switch (block.dimension.id) {
                case 'minecraft:overworld':
                    ymax = 320
                    ymin = -64
                    break
                case 'minecraft:nether':
                    ymax = 129
                    ymin = 0
                    break
                case 'minecraft:the_end':
                    ymax = 257
                    ymin = 0
                    break
            }
            const ytemp = y - 1
            if (player.isSneaking) {
                for (var y = ytemp; y >= ymin; y--) {
                    if (block.dimension.getBlock({ x: block.location.x, y, z: block.location.z }).typeId == 'twm:elevator') {
                        y++
                        block.dimension.runCommand(`tp "${player.nameTag}" ${x} ${y} ${z}`)
                        player.runCommand(`playsound tile.elevator.down "${player.nameTag}" ~ ~ ~ 100`)
                        break
                    }
                }
            } else {
                if (player.dimension.id == 'minecraft:nether' && (Math.ceil(Math.random() * 10) == 3)) {
                    player.setOnFire(1)
                }
                for (var y = ytemp + 2; y < ymax; y++) {
                    if (block.dimension.getBlock({ x: block.location.x, y, z: block.location.z }).typeId == 'twm:elevator') {
                        y++
                        block.dimension.runCommand(`tp "${player.nameTag}" ${x} ${y} ${z} true`)
                        player.runCommand(`playsound tile.elevator.up "${player.nameTag}" ~ ~ ~ 100`)
                        break
                    }
                }
            }
        }
    })
})