import { world, ItemStack, system } from '@minecraft/server'
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'

DoriosAPI.register.blockComponent('mechanic_hopper', {
    onTick({ block, dimension }, { params }) {
        if (!block.isValid || block.isAir) return;

        const dir = block.permutation.getState("minecraft:block_face");
        const { x, y, z } = block.location;

        const isHopper = params.type === "hopper";
        const isUpper = params.type === "upper";
        const isDropper = params.type === "dropper";

        /** @type {Entity} */
        const entity = block.getEntity();
        if (!entity) return;

        const inv = entity.getComponent("minecraft:inventory")?.container;
        if (!inv) return;

        const hasFilter = block.getState("utilitycraft:filter") == 1;
        const whiteList = entity.getDynamicProperty("utilitycraft:whitelistOn");

        // Define source and target positions depending on block type and direction
        let sourceLoc = { x, y, z };
        let targetLoc = { x, y, z };

        if (isDropper) {
            // Dropper only works vertically
            sourceLoc = dir === "down" ? { x, y: y - 1, z } : { x, y: y + 1, z };
        } else {
            // Hopper and Upper logic
            sourceLoc = isHopper ? { x, y: y + 1, z } : { x, y: y - 1, z };

            if (dir === "up" || dir === "down") {
                // Vertical output
                targetLoc = isHopper
                    ? { x, y: y - 1, z }
                    : { x, y: y + 1, z };
            } else {
                // Horizontal output
                switch (dir) {
                    case "south": targetLoc = { x, y, z: z - 1 }; break;
                    case "north": targetLoc = { x, y, z: z + 1 }; break;
                    case "west": targetLoc = { x: x + 1, y, z }; break;
                    case "east": targetLoc = { x: x - 1, y, z }; break;
                }
            }
        }

        // Pull items from the source container into the block
        const sourceInv = DoriosAPI.containers.getContainerAt(sourceLoc, dimension);
        if (sourceInv) {
            const sourceEntity = dimension.getEntitiesAtBlockLocation(sourceLoc)[0];
            const [start, end] = DoriosAPI.containers.getAllowedSlotRange(sourceEntity ?? sourceInv);

            for (let i = start; i <= end; i++) {
                const item = sourceInv.getItem(i);
                if (!item) continue;

                // Apply filter rules if enabled
                if (hasFilter && whiteList != entity.hasTag(`${item.typeId}`)) continue;

                DoriosAPI.containers.transferItemsBetween(sourceLoc, block.location, dimension, i);
                break;
            }
        }

        // Handle output: transfer to container or drop into the world
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (!item) continue;

            // Apply filter rules again before output
            if (hasFilter && whiteList != entity.hasTag(`${item.typeId}`)) continue;

            if (isDropper) {
                // Dropper releases the item into the world
                const spawnY = dir === "up" ? y + 1.2 : y - 0.2;
                const pos = { x: x + 0.5, y: spawnY, z: z + 0.5 };

                dimension.spawnItem(item, pos);
                inv.setItem(i, undefined);
            } else {
                // Hopper and Upper push items into the target container
                DoriosAPI.containers.transferItemsAt(inv, targetLoc, dimension, i);
            }

            // Limit to one transfer per tick
            break;
        }
    },

    beforeOnPlayerPlace(e) {
        const { block } = e
        let { x, y, z } = block.location
        x += 0.5, z += 0.5, y += 0.375

        system.run(() => {
            const entity = block.dimension.spawnEntity('utilitycraft:hopper', { x, y, z })
            entity.setDynamicProperty('utilitycraft:whitelistOn', true)
        })
    },
    onPlayerBreak(e) {
        const { block } = e
        let { x, y, z } = block.location
        x += 0.5, z += 0.5, y += 0.375
        const entity = block.dimension.getEntitiesAtBlockLocation(block.location)[0]
        if (!entity) return
        const inv = entity.getComponent('minecraft:inventory').container
        for (let j = 0; j < inv.size; j++) {
            if (inv.getItem(j) != undefined) {
                let item = inv.getItem(j)
                block.dimension.spawnItem(item, { x, y, z })
            }
        }
        entity.remove()
    },
    onPlayerInteract(e) {
        const { block, player } = e
        let { x, y, z } = block.location
        x += 0.5, z += 0.5, y += 0.375
        if (player.isSneaking) return
        const hasFilter = block.permutation.getState('utilitycraft:filter')
        if (!hasFilter) return
        const mainHand = player.getComponent('equippable').getEquipment('Mainhand')
        if (mainHand?.typeId.includes('wrench')) return
        openMenu({ x, y, z }, block, player)
    }
})

function openMenu({ x, y, z }, block, player) {
    let menu = new ActionFormData()
    const hopper = block.dimension.getEntitiesAtBlockLocation(block.location)[0]
    let state = hopper.getDynamicProperty('utilitycraft:whitelistOn')

    menu.title('Filter')

    if (state) {
        menu.button(`Whitelist Mode \n(Click to Change)`, 'textures/items/whitelist.png')
    } else {
        menu.button(`Blacklist Mode \n(Click to Change)`, 'textures/items/blacklist.png')

    }

    menu.button(`Add item \n(Adds the item in your Mainhand)`)

    const acceptedItems = hopper.getTags()

    if (acceptedItems) {
        for (let item of acceptedItems) {
            menu.button(`${DoriosAPI.utils.formatIdToText(item)}`)
        }
    }

    menu.show(player)
        .then(result => {
            let selection = result.selection
            if (selection == undefined) return;

            if (selection == 0) {
                hopper.setDynamicProperty('utilitycraft:whitelistOn', !state)
                openMenu({ x, y, z }, block, player)
                return
            }

            if (selection == 1) {
                const mainHand = player.getComponent('equippable').getEquipment('Mainhand')
                if (mainHand) {
                    hopper.addTag(`${mainHand.typeId}`)
                }
                return
            }
            hopper.removeTag(`${acceptedItems[selection - 2]}`)
            openMenu({ x, y, z }, block, player)
        })
}