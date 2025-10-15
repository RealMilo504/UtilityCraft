import { world, ItemStack, system } from '@minecraft/server'
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'

DoriosAPI.register.blockComponent('mechanic_hopper', {
    onTick({ block: hopper, dimension }) {
        if (!hopper.isValid || hopper.isAir) return;

        const id = hopper.typeId;
        const dir = hopper.permutation.getState("minecraft:block_face");

        let { x, y, z } = hopper.location;
        let sourceLoc = { x, y, z };
        let targetLoc = { x, y, z };

        const isHopper = id === "utilitycraft:mechanic_hopper";
        const isUpper = id === "utilitycraft:mechanic_upper";

        if (isHopper) {
            sourceLoc = { x, y: y + 1, z };
            targetLoc = { x, y: y - 1, z };
        } else if (isUpper) {
            sourceLoc = { x, y: y - 1, z };
            targetLoc = { x, y: y + 1, z };
        } else {
            switch (dir) {
                case "north": sourceLoc = { x, y, z: z + 1 }; targetLoc = { x, y, z: z - 1 }; break;
                case "south": sourceLoc = { x, y, z: z - 1 }; targetLoc = { x, y, z: z + 1 }; break;
                case "east": sourceLoc = { x: x - 1, y, z }; targetLoc = { x: x + 1, y, z }; break;
                case "west": sourceLoc = { x: x + 1, y, z }; targetLoc = { x: x - 1, y, z }; break;
            }
        }

        /** @type {Entity} */
        const hopperEntity = hopper.getEntity();

        const hopperInv = hopperEntity?.getComponent("minecraft:inventory")?.container;
        if (!hopperEntity || !hopperInv) return;

        // Fuente → Hopper
        const sourceInv = DoriosAPI.containers.getContainerAt(sourceLoc, dimension);
        if (sourceInv) {
            const sourceEntity = dimension.getEntitiesAtBlockLocation(sourceLoc)[0];
            const [start, end] = DoriosAPI.containers.getAllowedSlotRange(sourceEntity ?? hopperEntity);

            for (let i = start; i <= end; i++) {
                const item = sourceInv.getItem(i);
                if (!item) continue;
                DoriosAPI.containers.transferItemsBetween(sourceLoc, hopper.location, dimension, i);
                break;
            }
        }


        for (let i = 0; i < hopperInv.size; i++) {
            const item = hopperInv.getItem(i);
            if (!item) continue;
            DoriosAPI.containers.transferItemsAt(hopperInv, targetLoc, dimension, i)
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
            menu.button(`${formatId(item)}`)
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

function formatId(id) {
    // Elimina el prefijo (antes de los dos puntos)
    const parts = id.split(':');
    const name = parts[1] || parts[0]; // Por si no hay prefijo

    // Reemplaza guiones bajos con espacios y capitaliza cada palabra
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}