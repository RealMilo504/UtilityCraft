import { world, system, ItemStack } from '@minecraft/server'
import * as settings from './generators_config.js'
export { settings }

import { Machinery, obtainEnergyFromText, obtainLiquidFromText } from './managers.js'
export { LiquidManager, EnergyManager } from './managers.js'

const tierMultis = {
    basic: 1,
    advanced: 4,
    expert: 16,
    ultimate: 100
}

export class Generator extends Machinery {
    /**
     * Creates a new Generator instance.
     * 
     * @param {Block} block The block representing the Generator.
     * @param {Object} [settings] Generator's settings.
     */
    constructor(block, settings) {
        super(block, settings)
        this.multi = tierMultis[block?.typeId.split(":")[1].split("_")[0]]
        this.entity?.runCommand(`scoreboard players set @s energyCap ${settings.energyCapBase * this.multi}`)

        this.trueBurnSpeed = settings.burnSpeedBase * this.multi
        this.burnSpeed = this.trueBurnSpeed * this.refreshSpeed
    }

    /**
     * Spawns a generator entity at the given block location with a name tag and energy settings.
     *
     * @param {object} e The event data object containing information about the destroyed block and player.
     * @param {Object} settings
     * @param {Function} callback A function to execute after the entity is spawned (Optional)
     * @param {boolean} [hasLiquid=false] Whether this generator should manage liquids.
     */
    static spawnGeneratorEntity(e, settings, callback) {
        const { block, player } = e
        let { x, y, z } = block.location;
        y += 0.25;
        x += 0.5;
        z += 0.5;

        const item = player.getComponent('equippable').getEquipment('Mainhand')
        const itemInfo = item.getLore();
        let energy = 0;
        let liquid = false
        if (itemInfo[0]) {
            energy = obtainEnergyFromText(itemInfo[0]);
        }
        if (itemInfo[1]) {
            liquid = obtainLiquidFromText(itemInfo[1])
        }

        const tier = item?.typeId?.split(":")[1].split("_")[0]
        const multi = tierMultis[tier] || 1

        system.run(() => {
            const entity = block.dimension.spawnEntity(settings.entity, { x, y, z });
            entity.nameTag = settings.nameTag;
            entity.runCommand(`scoreboard players set @s energy ${energy}`)
            entity.runCommand(`scoreboard players set @s energyCap ${settings.energyCapBase * multi}`)
            if (liquid || settings.liquidCapBase > 0) {
                entity.setDynamicProperty('twm:liquid', liquid.amount || 0)
                entity.setDynamicProperty('twm:liquidType', liquid.type)
                entity.setDynamicProperty('twm:liquidCap', settings.liquidCapBase * multi);
            }
            this.addNearbyMachines(entity)
            if (callback) callback(entity)
        });
    }

    /**
     * Adds tags to the entity for all adjacent blocks (6 directions) around it.
     * 
     * - Each tag follows the format: `pos:[x,y,z]`
     * - This is used by energy transfer functions to identify nearby machines.
     * - Adds positions in all cardinal directions: North, South, East, West, Up, Down.
     * 
     * @param {Entity} entity The entity (usually a generator or battery) to tag with nearby positions.
     */
    static addNearbyMachines(entity) {
        let { x, y, z } = entity.location
        const directions = [
            [1, 0, 0], // East
            [-1, 0, 0], // West
            [0, 1, 0], // Up
            [0, -1, 0], // Down
            [0, 0, 1], // South
            [0, 0, -1]  // North
        ];

        for (const [dx, dy, dz] of directions) {
            const xf = x + dx;
            const yf = y + dy;
            const zf = z + dz;
            entity.addTag(`pos:[${xf},${yf},${zf}]`);
        }
    }

    /**
     * Transfers energy from this entity to the connected network based on its current burn speed.
     *
     * This is a wrapper method that delegates the energy transfer logic to the internal `energy` handler,
     * using `burnSpeed` as the transfer speed multiplier.
     */
    transferEnergy(multi = 1) {
        this.energy.transferToNetwork(this.burnSpeed * multi);
    }

}