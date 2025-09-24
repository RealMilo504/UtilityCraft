import * as doriosAPI from "../doriosAPI.js"
import { ItemStack, system, world, Container, Block } from '@minecraft/server'
import { setQuality, refreshSpeed } from './utility_quality.js'

const tankCaps = {
    'twm:basic_fluid_tank': 8000,
    'twm:advanced_fluid_tank': 32000,
    'twm:expert_fluid_tank': 128000,
    'twm:ultimate_fluid_tank': 512000
};

export const EnergyBarCache = {
    bars: Array.from({ length: 17 }, (_, i) => new ItemStack(`twm:energy_bar_${i}`))
};

function createMultipleLiquids(entity, inv, tankCount = 1) {
    if (tankCount === 1) {
        return new LiquidManager(entity, inv, 0);
    }
    const tanks = [];
    for (let i = 0; i < tankCount; i++) {
        tanks.push(new LiquidManager(entity, inv, i));
    }
    return tanks;
}

export class Machinery {
    /**
     * Creates a new Machinery instance.
     * 
     * @param {Block} block The block representing the machine.
     * @param {Object} [settings] Machine's settings.
     */
    constructor(block, settings) {
        this.block = block;
        this.dimension = block.dimension;
        this.entity = block.dimension.getEntitiesAtBlockLocation(block.location)[0];
        this.inv = this.entity?.getComponent('minecraft:inventory')?.container;
        this.settings = settings;
        this.energy = new EnergyManager(this.entity);
        this.liquid = createMultipleLiquids(this.entity, this.inv);
        this.setRefreshSpeed();
        this.refreshSpeed = block.permutation.getState('twm:refreshSpeed') ?? 1;
        if (this.entity) this.entity.nameTag = settings.nameTag
    }

    /**
     * Executes a function every `refreshSpeed` ticks,
     * with a limit of 5 exact executions.
     *
     * This method is used by machines/generators to improve performance
     * by simulating 4 fake ticks and 1 real tick.
     * 
     * The block using this should have its `onTick` interval set to
     * 5 times the `refreshSpeed` value to align with this system.
     *
     * @param {Function} callback The function to execute on each tick.
     *
     * @example
     * Generator.runInterval(() => {
     *     Logic to run
     * });
     */

    static tick(callback) {
        let count = 0;
        const id = system.runInterval(() => {
            count++;
            if (count > 5) {
                system.clearRun(id);
                return;
            }
            // try {
            callback();
            // } catch {
            //     system.clearRun(id)
            //     return
            // }

        }, refreshSpeed);
    }

    /**
     * Handles machine destruction:
     * - Drops inventory (excluding UI items).
     * - Drops the machine block item with stored energy and liquid info in lore.
     * - Removes the machine entity.
     * - Skips drop if the player is in Creative mode.
     *
     * @param {object} e - The event data (block, player, destroyed permutation, etc.).
     */
    static onDestroy(e) {
        const { block, destroyedBlockPermutation, player } = e;
        const entity = block.dimension.getEntitiesAtBlockLocation(block.location)[0];
        if (!entity) return;

        const dropLoc = {
            x: block.location.x + 0.5,
            y: block.location.y + 0.25,
            z: block.location.z + 0.5
        };

        const energy = new EnergyManager(entity);
        const machineItem = new ItemStack(destroyedBlockPermutation.type.id);
        const lore = [];

        // Liquid
        const liquidType = entity.getDynamicProperty("twm:liquidType");
        const haveLiquid = liquidType && liquidType !== "empty"
        // Energy lore
        if (energy.value > 0 || haveLiquid) {
            lore.push(`§r§7  Stored Energy: ${formatEnergyToText(energy.value)}/${formatEnergyToText(energy.cap)}`);
            if (haveLiquid) {
                const liquid = new LiquidManager(entity);
                if (liquid.get() > 0) {
                    const displayType = capitalizeFirst(liquid.type);
                    lore.push(`§r§7  Stored ${displayType}: ${formatInputsLiquids(liquid.get(), liquid.cap)}`);
                }
            }
        }

        // Apply lore
        if (lore.length > 0) {
            machineItem.setLore(lore);
        }

        // Drop item and cleanup
        system.run(() => {
            if (player.getGameMode() == "survival") {
                block.dimension.getEntities({ type: 'item', maxDistance: 3, location: dropLoc })[0].kill()
            };
            this.dropInventoryItems(entity);
            entity.remove();
            block.dimension.spawnItem(machineItem, dropLoc);
        });
    }

    /**
     * Drops all non-UI items from the given entity's inventory at its current location.
     * UI items are filtered by internal rules: any item with "_bar_", "arrow_right", or "arrow_indicator" in its ID is ignored.
     *
     * @param {Entity} entity - The entity whose inventory will be processed.
     *
     * @example
     * dropInventoryItems(entity);
     */
    static dropInventoryItems(entity) {
        const inventoryComp = entity.getComponent('minecraft:inventory');
        const container = inventoryComp?.container;
        const location = entity.location;
        const dimension = entity.dimension;

        if (!container || !location || !dimension) return;

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item) continue;

            const id = item.typeId;
            const isUI = id.includes('_bar') || id.includes('arrow_right') || id.includes('arrow_indicator');
            if (isUI) continue;

            dimension.spawnItem(item, location);
            container.setItem(i, undefined); // Clear the slot after dropping
        }
    }

    /**
     * Sets the refresh speed of a machine block based on UtilityCraft settings.
     * 
     * UtilityCraft Settings (behavior pack config):
     * - Slow        → Every 20 ticks
     * - Normal      → Every 10 ticks
     * - Fast        → Every 5 ticks
     * - Super Fast  → Every tick (1)
     * 
     * This should be called when a block is placed or settings change.
     * It sets the `twm:refresh_speed` block state accordingly.
     * 
     */
    setRefreshSpeed() {
        try { setQuality(this.block) } catch { }
    }

    /**
     * Changes the texture of the block to the on version.
     */
    turnOn() {
        this.block.setPermutation(this.block.permutation.withState('twm:on', true))
    }

    /**
     * Changes the texture of the block to the off version.
     */
    turnOff() {
        this.block.setPermutation(this.block.permutation.withState('twm:on', false))
    }

    /**
     * Displays energy information in a 3-bar format inside the given inventory.
     * 
     * Uses the first 3 inventory slots (index 0–2) to show energy bars that visually represent:
     * - Stored energy
     * - Rate or energy cost 
     * - Efficiency (if applicable)
     * - Percentage filled
     */
    displayEnergy() {
        const energy = this.energy.value;
        const energyCap = this.energy.cap;
        const energyP = Math.floor((energy / energyCap) * 48);
        const percentage = Math.floor((energy / energyCap) * 10000) / 100;

        let rate = ''
        let speed = this.trueRateSpeed ?? this.trueBurnSpeed
        if (speed > 0) {
            rate = `§r§7  Rate: ${formatEnergyToText(speed)}/t`
        } else rate = `§r§7  Cost: ${formatEnergyToText(this.settings.energyCost)}`

        const lore = [
            `§r§7  Stored: ${formatEnergyToText(energy)}/${formatEnergyToText(energyCap)}`,
            rate
        ];

        if (this.entity.getComponent("minecraft:type_family").hasTypeFamily("dorios:machine")) {
            lore.push(`§r§7  Efficiency: ${Math.ceil(100 / this.efficiency)}%`);
        }

        lore.push(`§r§7  Percentage: ${percentage}%`);

        for (let i = 0; i <= 2; i++) {
            const segment = Math.max(0, Math.min(16, energyP - 16 * i));
            const bar = EnergyBarCache.bars[segment];
            bar.setLore(lore);
            this.inv.setItem(i, bar);
        }
    }

    /**
     * Displays energy information in a single 48-frame bar format inside the given inventory.
     * 
     * Uses only slot 0 to show an energy bar that visually represents:
     * - Stored energy
     * - Rate or energy cost 
     * - Efficiency (if applicable)
     * - Percentage filled
     */
    displayEnergySingle() {
        const energy = this.energy.value;
        const energyCap = this.energy.cap;
        const energyP = Math.floor((energy / energyCap) * 48);
        const percentage = Math.floor((energy / energyCap) * 10000) / 100;

        let rate = '';
        let speed = this.trueRateSpeed ?? this.trueBurnSpeed;
        if (speed > 0) {
            rate = `§r§7  Rate: ${formatEnergyToText(speed)}/t`;
        } else {
            rate = `§r§7  Cost: ${formatEnergyToText(this.settings.energyCost)}`;
        }

        const lore = [
            `§r§7  Stored: ${formatEnergyToText(energy)}/${formatEnergyToText(energyCap)}`,
            rate
        ];

        if (this.entity.getComponent("minecraft:type_family").hasTypeFamily("dorios:machine")) {
            lore.push(`§r§7  Efficiency: ${Math.ceil(100 / this.efficiency)}%`);
        }

        lore.push(`§r§7  Percentage: ${percentage}%`);
        // Asegurar que siempre esté en rango 0–48
        const frame = Math.max(0, Math.min(48, energyP));
        let frameName = frame.toString().padStart(2, "0");
        // Crear el item correspondiente (ejemplo: utilitycraft:energy_07)
        const item = new ItemStack(`utilitycraft:energy_${frameName}`, 1);
        item.nameTag = '§rEnergy'
        item.setLore(lore);

        // Colocar en el slot 0
        this.inv.setItem(0, item);
    }

    /**
     * Displays a 3-slot fluid bar based on dynamic properties stored in the entity.
     * @param {number} startSlot Slot index to start displaying the fluid bar.
     */
    displayLiquid(startSlot = 4) {
        this.liquid.display(startSlot)
    }
}

function getOrCreateObjective(id, display) {
    let obj = world.scoreboard.getObjective(id);
    if (!obj) {
        world.scoreboard.addObjective(id, display);
        obj = world.scoreboard.getObjective(id);
    }
    return obj;
}

const energyScore = getOrCreateObjective("energy", "Energy");
const energyExpScore = getOrCreateObjective("energyExp", "EnergyExp");
const energyCapScore = getOrCreateObjective("energyCap", "Energy Max Capacity");
const energyCapExpScore = getOrCreateObjective("energyCapExp", "Energy Max Capacity Exp");

/**
 * Handles energy logic for machines and generators.
 */
export class EnergyManager {
    /**
     * Creates a new EnergyManager instance.
     * 
     * @param {Entity} entity The entity this manager is attached to.
     * @param {Container} inv The inventory container used by the machine or generator.
     */
    constructor(entity) {
        this.entity = entity;
        this.scoreId = entity?.scoreboardIdentity
        if (this.verifyEnergy() == false) return
        this.value = energyScore.getScore(this.scoreId) * (10 ** (energyExpScore.getScore(this.scoreId) || 0))
        this.cap = energyCapScore.getScore(this.scoreId) * (10 ** (energyCapExpScore.getScore(this.scoreId) || 0))
        if (this.value > this.cap) this.set(this.cap)
        if (this.value < 0) this.set(0)
    }

    static setCap(entity, value) {
        let exp = 0
        while (value > 1e9) {
            value /= 1000
            exp += 3
        }
        entity.runCommand(`scoreboard players set @s energyCap ${value}`)
        if (exp > 0) {
            entity.runCommand(`scoreboard players set @s energyCapExp ${exp}`)
        }
    }

    verifyEnergy() {
        if (this.scoreId != undefined) return true
        let entity = this.entity
        if (!entity) return false
        let energy = entity?.getDynamicProperty('dorios:energy') || (entity.getProperty('dorios:energy') || 0)
        entity.runCommand(`scoreboard players set @s energy ${energy}`)
        this.scoreId = entity.scoreboardIdentity
    }

    /**
     * Gets the current energy stored in the machine.
     * @returns {number} The current energy (0 if not available).
     */
    get() {
        return energyScore.getScore(this.scoreId) * (10 ** (energyExpScore.getScore(this.scoreId) || 0))
    }

    /**
     * Sets the current energy of the machine.
     * If the value exceeds 1e9 and the entity supports multipliers, it splits the value using dorios:energymulti.
     * Warns only if over limit and multipliers are not supported.
     * @param {number} amount The amount of energy to set.
     */
    set(amount) {
        let clamped = Math.min(Math.max(0, amount), this.cap);
        let exp = 0
        while (clamped > 1e9) {
            clamped /= 1000
            exp += 3
        }
        energyScore.setScore(this.scoreId, clamped)
        energyExpScore.setScore(this.scoreId, exp)
        this.value = clamped * (10 ** exp);
    }

    /**
     * Adds energy to the machine.
     * @param {number} amount The amount of energy to add.
     * @returns {number} The updated energy.
     */
    add(amount) {
        const multi = (10 ** (energyExpScore.getScore(this.scoreId) || 0))
        amount /= multi
        const newAmount = amount + this.value / multi
        if (newAmount > 1e9) {
            this.set(newAmount * multi)
        } else {
            energyScore.addScore(this.scoreId, amount)
        }
        this.value += amount * multi;
    }

    /**
     * Transfers energy from this entity to nearby network-connected energy containers.
     *
     * It iterates through tagged positions (`pos:[x,y,z]` or `net:[x,y,z]`) and transfers energy
     * to entities at those locations if they are valid energy containers and not batteries (when this is a battery).
     *
     * The transfer amount is limited by the transfer speed, target capacity, and this entity's available energy.
     *
     * @param {number} speed The transfer speed factor.
     * @returns {number} The total amount of energy successfully transferred.
     */
    transferToNetwork(speed) {
        if (!this.entity) return
        let available = this.value;
        if (available <= 0 || speed <= 0) return 0;

        let transferred = 0;
        const isBattery = this.entity.getComponent("minecraft:type_family").hasTypeFamily("dorios:battery");

        const positions = this.entity.getTags()
            .filter(tag => tag.startsWith("pos:[") || tag.startsWith("net:["))
            .map(tag => {
                const [x, y, z] = tag.slice(5, -1).split(",").map(Number);
                return { x, y, z };
            });

        for (const loc of positions) {
            if (available <= 0) break;

            const [target] = this.entity.dimension.getEntitiesAtBlockLocation(loc);
            if (!target) continue;
            const tf = target.getComponent("minecraft:type_family");
            if (!tf?.hasTypeFamily("dorios:energy_container")) continue;
            if (isBattery && tf.hasTypeFamily("dorios:battery")) continue;

            let targedId = target.scoreboardIdentity
            if (targedId == undefined) continue

            const targetEnergy = new EnergyManager(target)
            const space = targetEnergy.cap - targetEnergy.value
            if (space <= 0) continue;

            let amount = Math.min(speed, space, available);
            targetEnergy.add(amount)

            available -= amount;
            transferred += amount;
        }
        if (transferred > 0) this.add(-transferred);
        return transferred;
    }
}

/**
 * Manages the processing progress of a machine or generator.
 *
 * Tracks the owning entity, its inventory, and the associated block.
 */
export class ProgressManager {
    /**
     * Creates a new ProgressManager instance.
     *
     * @param {Entity} entity The entity this manager is attached to.
     * @param {Container} inv The inventory container used by the machine or generator.
     * @param {Block} block The block where the entity is placed in the world.
     */
    constructor(entity, inv, block) {
        this.entity = entity;
        this.inv = inv;
        this.block = block;
    }

    /**
     * @returns {number} Current progress (0 if none).
     */
    get() {
        return this.entity.getDynamicProperty('twm:progress') || 0;
    }

    /**
     * Sets the machine's progress value.
     *
     * @param {number} amount The new progress value.
     */
    set(amount) {
        const clampedAmount = Math.max(0, amount);
        this.entity.setDynamicProperty('twm:progress', clampedAmount);
    }

    /**
     * Adds progress to the machine.
     *
     * @param {number} amount Progress to add.
     * @returns {number} Updated progress value.
     */
    add(amount) {
        const newProgress = this.get() + amount;
        this.set(newProgress);
        return newProgress;
    }

    /**
     * Resets the machine's progress and updates the block state to off.
     *
     * @param {number} [slot=4] Slot of the progress arrow.
     */
    reset(slot = 4) {
        this.entity.setDynamicProperty('twm:progress', 0);

        // Only update permutation if needed
        const perm = this.block.permutation;
        if (perm.getState('twm:on') !== false) {
            this.block.setPermutation(perm.withState('twm:on', false));
        }

        // Optional: clear arrow
        const current = this.inv.getItem(slot);
        if (!current || current.typeId !== 'twm:arrow_right_0') {
            this.inv.setItem(slot, new ItemStack('twm:arrow_right_0'));
        }
    }


}

const liquidScores = new Map();

export function initLiquidScoreboards(index) {
    const keys = ["liquid", "liquidExp", "liquidCap", "liquidCapExp"];
    for (const key of keys) {
        const id = `${key}_${index}`;
        if (!liquidScores.has(id)) {
            let obj = world.scoreboard.getObjective(id);
            if (!obj) {
                world.scoreboard.addObjective(id, key);
                obj = world.scoreboard.getObjective(id);
            }
            liquidScores.set(id, obj);
        }
    }
}

/**
 * Handles liquid logic for fluid-storing entities.
 */
export class LiquidManager {
    /**
     * Creates a new LiquidManager instance.
     * 
     * @param {Entity} entity The entity this manager is attached to.
     * @param {Container} inv The inventory container used by the machine or generator.
     * @param {Number} index The index of the liquid to manage.
     */
    constructor(entity, inv, index = 0) {
        this.entity = entity;
        this.inv = inv;
        this.index = index;
        this.scoreId = entity?.scoreboardIdentity;
        if (!this.scoreId) {
            entity?.runCommand('scoreboard players add @s liquidCap_0 0')
            this.scoreId = entity?.scoreboardIdentity;
        }
        this.type = this.getType()
        // Referencias a las scoreboards
        this.scores = {
            liquid: liquidScores.get(`liquid_${index}`),
            liquidExp: liquidScores.get(`liquidExp_${index}`),
            liquidCap: liquidScores.get(`liquidCap_${index}`),
            liquidCapExp: liquidScores.get(`liquidCapExp_${index}`)
        };

        // Lazy init si aún no existe
        if (!this.scores.liquid) {
            initLiquidScoreboards(index);
            this.scores = {
                liquid: liquidScores.get(`liquid_${index}`),
                liquidExp: liquidScores.get(`liquidExp_${index}`),
                liquidCap: liquidScores.get(`liquidCap_${index}`),
                liquidCapExp: liquidScores.get(`liquidCapExp_${index}`)
            };
        }
    }

    /**
     * Ensures a tank entity exists at the block and inserts liquid into it.
     * Spawns entity and sets scoreboards directly if missing.
     * 
     * @param {Block} block 
     * @param {string} liquid 
     * @param {number} amount 
     * @returns {boolean}
     */
    static addLiquidToTank(block, liquid, amount) {
        const dim = block.dimension;
        const pos = block.location;
        const tankCap = tankCaps[block.typeId] || 8000;
        let tank = dim.getEntitiesAtBlockLocation(pos)[0];

        if (!tank) {
            const spawnPos = { x: pos.x + 0.5, y: pos.y, z: pos.z + 0.5 };
            tank = dim.spawnEntity(`twm:fluid_tank_${liquid}`, spawnPos);
            if (!tank) return false;

            tank.runCommandAsync(`scoreboard players set @s liquid_0 ${amount}`);
            tank.runCommandAsync(`scoreboard players set @s liquidCap_0 ${tankCap}`);
            tank.addTag(`liquid0Type:${liquid}`);
            tank.getComponent("minecraft:health")?.setCurrentValue(amount);
            block.setPermutation(block.permutation.withState("twm:hasliquid", true));
            return false;
        }

        const liquidManager = new LiquidManager(tank, null, 0);
        const inserted = liquidManager.tryInsert(liquid, amount);
        if (inserted) {
            tank.getComponent("minecraft:health")?.setCurrentValue(liquidManager.get());
        }
        return tank;
    }

    compress(value) {
        let exp = 0;
        while (value > 1e9) {
            value /= 1000;
            exp += 3;
        }
        return { score: Math.floor(value), exp };
    }

    decompress(score, exp) {
        return (score || 0) * (10 ** (exp || 0));
    }

    get() {
        return this.decompress(
            this.scores.liquid.getScore(this.scoreId),
            this.scores.liquidExp.getScore(this.scoreId)
        );
    }

    getCap() {
        return this.decompress(
            this.scores.liquidCap.getScore(this.scoreId),
            this.scores.liquidCapExp.getScore(this.scoreId)
        );
    }

    set(amount) {
        const cap = this.getCap();
        const clamped = Math.min(Math.max(0, amount), cap);
        const { score, exp } = this.compress(clamped);
        if (amount == 0) this.setType('empty')
        this.scores.liquid.setScore(this.scoreId, score);
        this.scores.liquidExp.setScore(this.scoreId, exp);
    }

    /**
     * Adds (or subtracts) liquid to/from the tank using direct scoreboard addition.
     * If overflow is expected, it uses full set() with compression.
     * 
     * @param {number} amount - Amount to add (can be negative).
     */
    add(amount) {
        const current = this.get();
        const result = current + amount;
        if (result < 0 || result > 1e9) {
            this.set(result);
        } else {
            if (result == 0) this.setType('empty')
            this.scores.liquid.addScore(this.scoreId, amount);
        }
    }

    isFull() {
        return this.get() >= this.getCap();
    }

    getFreeSpace() {
        return this.getCap() - this.get();
    }

    getType() {
        const tag = this.entity?.getTags().find(t => t.startsWith(`liquid${this.index}Type:`));
        return tag?.split(":")[1] || "empty";
    }

    setType(type) {
        const old = this.entity.getTags().find(t => t.startsWith(`liquid${this.index}Type:`));
        if (old) this.entity.removeTag(old);
        this.entity.addTag(`liquid${this.index}Type:${type}`);
    }

    tryInsert(type, amount) {
        if (amount <= 0) return false;
        const currentType = this.getType();
        if (currentType === "empty" || currentType === type) {
            if (amount <= this.getFreeSpace()) {
                if (currentType === "empty") this.setType(type);
                this.add(amount);
                return true;
            }
        }
        return false;
    }

    liquidItem(typeId, itemLiquidContainers) {
        const insertData = itemLiquidContainers?.[typeId];

        if (insertData) {
            const inserted = this.tryInsert(insertData.type, insertData.amount);
            if (!inserted) return false;
            return insertData.output;
        }

        if (typeId === "minecraft:bucket") {
            const valid = ["lava", "water", "milk"];
            const type = this.getType();
            if (!valid.includes(type)) return false;
            if (this.get() < 1000) return false;
            this.add(-1000);
            return `minecraft:${type}_bucket`;
        }

        return false;
    }

    display(startSlot) {
        const type = this.type;
        const amount = this.get();
        const cap = this.getCap();

        if (type === 'empty') {
            const item = new ItemStack(`twm:empty_liquid_bar`);
            this.inv.setItem(startSlot, item);
            this.inv.setItem(startSlot + 1, item);
            this.inv.setItem(startSlot + 2, item);
            return;
        }

        const fluidIdPrefix = `twm:${type}_bar_`;
        const displayName = doriosAPI.utils.capitalizeFirst(type);
        const percentage48 = Math.floor((amount / cap) * 48);

        for (let i = 0; i < 3; i++) {
            let segment = percentage48 - 16 * i;
            segment = Math.max(0, Math.min(segment, 16));
            const item = new ItemStack(`${fluidIdPrefix}${segment}`);
            item.setLore([
                `§r§7  Stored ${displayName}: ${amount}/${cap}`,
                `§r§7  Percentage: ${Math.floor((amount / cap) * 10000) / 100}%`
            ]);
            this.inv.setItem(startSlot + i, item);
        }
    }

    /**
     * Attempts to transfer a specified amount of liquid from this tank
     * to the fluid tank entity or block directly in front of the machine.
     * 
     * - Tries to find the first compatible tank index on the target entity.
     * - If target is a valid fluid block, spawns a tank entity and transfers.
     * - If no compatible tank is found, transfer fails.
     * 
     * @param {number} amount The amount of liquid to transfer.
     * @param {Block} block The machine block used to determine facing.
     * @returns {boolean} True if the transfer was successful.
     */
    transferForward(amount, block) {
        amount = Math.min(this.get(), amount);
        if (amount <= 0) return false;

        const direction = block.permutation.getState("minecraft:facing_direction");
        const facingOffsets = {
            up: [0, -1, 0],
            down: [0, 1, 0],
            north: [0, 0, 1],
            south: [0, 0, -1],
            west: [1, 0, 0],
            east: [-1, 0, 0]
        };

        const offset = facingOffsets[direction];
        if (!offset) return false;

        const origin = this.entity.location;
        const targetPos = {
            x: Math.floor(origin.x + offset[0]),
            y: Math.floor(origin.y + offset[1]),
            z: Math.floor(origin.z + offset[2])
        };

        const targetEntity = this.entity.dimension.getEntitiesAtBlockLocation(targetPos)[0];
        if (!targetEntity) {
            // If no entity, try creating one from a fluid tank block
            const targetBlock = this.entity.dimension.getBlock(targetPos);
            if (targetBlock?.typeId.includes("fluid_tank")) {
                let { x, y, z } = targetBlock.location;
                x += 0.5; z += 0.5;

                const tank = targetBlock.dimension.spawnEntity(`twm:fluid_tank_${this.type}`, { x, y, z });
                const tankCap = tankCaps[targetBlock?.typeId] || 8000;

                tank.runCommandAsync(`scoreboard players set @s liquid_0 ${amount}`);
                tank.runCommandAsync(`scoreboard players set @s liquidCap_0 ${tankCap}`);
                tank.addTag(`liquid0Type:${this.type}`);

                targetBlock.setPermutation(targetBlock.permutation.withState("twm:hasliquid", true));

                system.run(() => {
                    tank.getComponent("minecraft:health").setCurrentValue(amount);
                });
                this.add(-amount);
                return true;
            } else {
                return false;
            }
        }

        if (!targetEntity.getComponent("minecraft:type_family")?.hasTypeFamily("dorios:fluid_container")) return false

        const indexTag = targetEntity.getTags().filter(tag => {
            if (!tag.startsWith('liquid')) return false
            const type = tag.split(':')[1]
            if (type == 'empty' || type == this.type) return true
            return false
        })[0]
        let index = 0
        if (indexTag) {
            index = parseInt(indexTag.split('Type:')[0].split('liquid')[1])
        }

        const targetLiquid = new LiquidManager(targetEntity, this.inv, index);
        amount = Math.min(amount, targetLiquid.getFreeSpace())
        if (amount <= 0) return false;

        this.add(-amount);
        targetLiquid.add(amount);
        targetLiquid.setType(this.type)
    }
}



/**
 * Parses a formatted energy string (with Minecraft color codes) and returns the numeric value in DE.
 * 
 * @param {string} input The string with formatted energy (e.g., "§r§7  Stored Energy: 12.5 kDE / 256 kDE").
 * @param {number} index Which value to extract: 0 = current, 1 = max.
 * @returns {number} The numeric value in base DE.
 *
 * @example
 * parseFormattedEnergy("§r§7  Stored Energy: 12.5 kDE / 256 kDE", 0); // 12500
 * parseFormattedEnergy("§r§7  Stored Energy: 12.5 kDE / 256 kDE", 1); // 256000
 */
export function obtainEnergyFromText(input, index = 0) {
    // Remove Minecraft formatting codes
    const cleanedInput = input.replace(/§[0-9a-frklmnor]/gi, '');

    // Find all matches like "12.5 kDE"
    const matches = cleanedInput.match(/([\d.]+)\s*(kDE|MDE|GDE|TDE|DE)/g);

    if (!matches || index >= matches.length) {
        throw new Error("Invalid input or index: couldn't parse energy values.");
    }

    const [valueStr, unit] = matches[index].split(' ');
    let multiplier = 1;

    switch (unit) {
        case 'kDE': multiplier = 1e3; break;
        case 'MDE': multiplier = 1e6; break;
        case 'GDE': multiplier = 1e9; break;
        case 'TDE': multiplier = 1e12; break;
        case 'DE': multiplier = 1; break;
    }

    return parseFloat(valueStr) * multiplier;
}

/**
 * Formats a numerical Dorios Energy (DE) value into a human-readable string with appropriate unit suffix.
 * 
 * @param {number} value The energy value in DE (Dorios Energy).
 * @returns {string} A formatted string representing the value with the appropriate unit (DE, kDE, MDE, GDE, TDE).
 *
 * @example
 * formatEnergyToText(15300); // "15.3 kDE"
 * formatEnergyToText(1048576); // "1.05 MDE"
 */
export function formatEnergyToText(value) {
    let unit = 'DE';

    if (value >= 1e12) {
        unit = 'TDE';
        value /= 1e12;
    } else if (value >= 1e9) {
        unit = 'GDE';
        value /= 1e9;
    } else if (value >= 1e6) {
        unit = 'MDE';
        value /= 1e6;
    } else if (value >= 1e3) {
        unit = 'kDE';
        value /= 1e3;
    }

    return `${parseFloat(value.toFixed(2))} ${unit}`;
}

/**
 * Extracts the liquid type and amount from a formatted text like:
 * "§r§7  Stored Lava: 52809 kB/ 64000 kB"
 * 
 * @param {string} input - The lore line.
 * @returns {{ type: string, amount: number }} - The liquid type and its parsed numeric value.
 */
export function obtainLiquidFromText(input) {
    const cleaned = input.replace(/§./g, "").trim();

    const match = cleaned.match(/Stored (\w+): ([\d.]+)\s*(mB|kB|MB|B)/);
    if (!match) return { type: "empty", amount: 0 };

    const [, rawType, rawValue, unit] = match;

    const multipliers = {
        'mB': 1,
        'B': 1000,
        'kB': 1000,
        'MB': 1_000_000
    };

    const amount = parseFloat(rawValue) * (multipliers[unit] ?? 1);
    const type = rawType.toLowerCase();

    return { type, amount };
}

export function formatLiquid(value) {
    let unit = 'mB';
    if (value >= 1e15) {
        unit = 'GB';
        value /= 1e12;
    } else if (value >= 1e12) {
        unit = 'MB';
        value /= 1e9;
    } else if (value >= 1e9) {
        unit = 'kB';
        value /= 1e6;
    } else if (value >= 1e6) {
        unit = 'B';
        value /= 1e3;
    }
    return value.toFixed(1) + ' ' + unit;
}

export function formatInputsLiquids(input1, input2) {
    const formattedInput1 = formatLiquid(input1);
    const formattedInput2 = formatLiquid(input2);

    return `${formattedInput1}/${formattedInput2}`;
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} text - The input string.
 * @returns {string} The string with its first letter capitalized.
 */
export function capitalizeFirst(text) {
    if (typeof text !== 'string' || text.length === 0) return text;
    return text[0].toUpperCase() + text.slice(1);
}