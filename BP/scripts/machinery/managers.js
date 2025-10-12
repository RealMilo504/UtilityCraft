import * as doriosAPI from "../doriosAPI.js"
import { ItemStack, system, world, Container, Block } from '@minecraft/server'
import { setQuality, refreshSpeed } from './utility_quality.js'

const tankCaps = {
    'utilitycraft:basic_fluid_tank': 8000,
    'utilitycraft:advanced_fluid_tank': 32000,
    'utilitycraft:expert_fluid_tank': 128000,
    'utilitycraft:ultimate_fluid_tank': 512000
};


export const EnergyBarCache = {
    bars: Array.from({ length: 17 }, (_, i) => new ItemStack(`utilitycraft:energy_bar_${i}`))
};

function createMultiplefluids(entity, inv, tankCount = 1) {
    if (tankCount === 1) {
        return new fluidManager(entity, inv, 0);
    }
    const tanks = [];
    for (let i = 0; i < tankCount; i++) {
        tanks.push(new fluidManager(entity, inv, i));
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
        this.fluid = createMultiplefluids(this.entity, this.inv);
        this.setRefreshSpeed();
        this.refreshSpeed = block.permutation.getState('utilitycraft:refreshSpeed') ?? 1;
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
     * - Drops the machine block item with stored energy and fluid info in lore.
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

        // fluid
        const fluidType = entity.getDynamicProperty("utilitycraft:fluidType");
        const havefluid = fluidType && fluidType !== "empty"
        // Energy lore
        if (energy.value > 0 || havefluid) {
            lore.push(`§r§7  Stored Energy: ${formatEnergyToText(energy.value)}/${formatEnergyToText(energy.cap)}`);
            if (havefluid) {
                const fluid = new fluidManager(entity);
                if (fluid.get() > 0) {
                    const displayType = capitalizeFirst(fluid.type);
                    lore.push(`§r§7  Stored ${displayType}: ${formatInputsfluids(fluid.get(), fluid.cap)}`);
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
     * It sets the `utilitycraft:refresh_speed` block state accordingly.
     * 
     */
    setRefreshSpeed() {
        try { setQuality(this.block) } catch { }
    }

    /**
     * Changes the texture of the block to the on version.
     */
    turnOn() {
        this.block.setPermutation(this.block.permutation.withState('utilitycraft:on', true))
    }

    /**
     * Changes the texture of the block to the off version.
     */
    turnOff() {
        this.block.setPermutation(this.block.permutation.withState('utilitycraft:on', false))
    }

    /**
     * Displays energy information in abar format inside the given inventory.
     * 
     * Uses the first inventory slot to show energy bars that visually represent:
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
    displayfluid(startSlot = 4) {
        this.fluid.display(startSlot)
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
        return this.entity.getDynamicProperty('utilitycraft:progress') || 0;
    }

    /**
     * Sets the machine's progress value.
     *
     * @param {number} amount The new progress value.
     */
    set(amount) {
        const clampedAmount = Math.max(0, amount);
        this.entity.setDynamicProperty('utilitycraft:progress', clampedAmount);
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
        this.entity.setDynamicProperty('utilitycraft:progress', 0);

        // Only update permutation if needed
        const perm = this.block.permutation;
        if (perm.getState('utilitycraft:on') !== false) {
            this.block.setPermutation(perm.withState('utilitycraft:on', false));
        }

        // Optional: clear arrow
        const current = this.inv.getItem(slot);
        if (!current || current.typeId !== 'utilitycraft:arrow_right_0') {
            this.inv.setItem(slot, new ItemStack('utilitycraft:arrow_right_0'));
        }
    }


}

/**
 * Global map storing loaded fluid-related scoreboard objectives per index.
 * Each index represents an independent tank slot (e.g., 0, 1, 2).
 */
const fluidObjectives = new Map();

/**
 * Ensures that the required scoreboard objectives exist for a given tank index.
 *
 * Creates or retrieves four objectives per index:
 * - `fluid_{index}` → fluid amount (mantissa)
 * - `fluidExp_{index}` → fluid exponent
 * - `fluidCap_{index}` → Capacity (mantissa)
 * - `fluidCapExp_{index}` → Capacity exponent
 *
 * @param {number} [index=0] The fluid tank index to initialize (default 0).
 * @returns {void}
 */
export function initFluidObjectives(index = 0) {
    const definitions = [
        [`fluid_${index}`, `fluid ${index}`],
        [`fluidExp_${index}`, `fluid Exp ${index}`],
        [`fluidCap_${index}`, `fluid Cap ${index}`],
        [`fluidCapExp_${index}`, `fluid Cap Exp ${index}`]
    ];

    for (const [id, display] of definitions) {
        if (!fluidObjectives.has(id)) {
            let obj = world.scoreboard.getObjective(id);
            if (!obj) obj = world.scoreboard.addObjective(id, display);
            fluidObjectives.set(id, obj);
        }
    }
}

const itemFluidContainers = {
    'minecraft:lava_bucket': { amount: 1000, type: 'lava', output: 'minecraft:bucket' },
    'utilitycraft:lava_ball': { amount: 1000, type: 'lava' },
    'minecraft:water_bucket': { amount: 1000, type: 'water', output: 'minecraft:bucket' },
    'utilitycraft:water_ball': { amount: 1000, type: 'water' }
}

/**
 * Manages scoreboard-based fluid values for entities or machines.
 * 
 * Provides a unified API to store, retrieve, normalize, and display fluid values.
 * Each instance can manage a specific tank index (0, 1, ...).
 *
 * The system uses the same mantissa–exponent structure as the Energy system
 * to support large numbers efficiently while maintaining scoreboard safety.
 */
export class FluidManager {
    /**
     * Creates a new FluidManager instance for a specific entity and tank index.
     *
     * @param {Entity} entity The entity representing the fluid container.
     * @param {number} [index=0] The index of the fluid tank managed by this instance.
     */
    constructor(entity, index = 0) {
        this.entity = entity;
        this.index = index;
        this.scoreId = entity?.scoreboardIdentity;

        // Ensure fluid objectives exist for this tank index
        initFluidObjectives(index);

        this.scores = {
            fluid: fluidObjectives.get(`fluid_${index}`),
            fluidExp: fluidObjectives.get(`fluidExp_${index}`),
            fluidCap: fluidObjectives.get(`fluidCap_${index}`),
            fluidCapExp: fluidObjectives.get(`fluidCapExp_${index}`)
        };

        this.type = this.getType();
        this.cap = this.getCap();
    }

    /**
     * Initializes a single fluid tank (index 0) for a machine entity.
     *
     * This should be used for machines that only store one type of fluid.
     * It ensures the scoreboard objectives for index 0 exist and
     * returns a ready-to-use FluidManager instance.
     *
     * @param {Entity} entity The machine entity to initialize.
     * @returns {FluidManager} A FluidManager instance managing index 0.
     */
    static initializeSingle(entity) {
        initFluidObjectives(0);
        return new FluidManager(entity, 0);
    }

    /**
     * Initializes multiple fluid tanks for a machine entity.
     *
     * This should be used for machines capable of storing more than one fluid.
     * It ensures all scoreboard objectives up to the specified maximum index exist
     * and returns an array of FluidManager instances (one per index).
     *
     * @param {Entity} entity The machine entity to initialize.
     * @param {number} maxIndex The maximum tank index (exclusive upper bound).
     * @returns {FluidManager[]} An array of FluidManager instances from index 0 to maxIndex - 1.
     */
    static initializeMultiple(entity, maxIndex) {
        const tanks = [];
        for (let i = 0; i < maxIndex; i++) {
            initFluidObjectives(i);
            tanks.push(new FluidManager(entity, i));
        }
        return tanks;
    }


    // --------------------------------------------------------------------------
    // Normalization utilities
    // --------------------------------------------------------------------------

    /**
     * Normalizes a raw fluid amount into a mantissa–exponent pair.
     *
     * This ensures the mantissa never exceeds 1e9 to remain scoreboard-safe.
     *
     * @param {number} amount The raw fluid amount.
     * @returns {{ value: number, exp: number }} The normalized mantissa and exponent.
     */
    static normalizeValue(amount) {
        let exp = 0;
        let value = amount;
        while (value > 1e9) {
            value /= 1000;
            exp += 3;
        }
        return { value: Math.floor(value), exp };
    }

    /**
     * Combines a mantissa and exponent into a full numeric value.
     *
     * @param {number} value Mantissa value.
     * @param {number} exp Exponent multiplier (power of 10).
     * @returns {number} The reconstructed numeric value.
     */
    static combineValue(value, exp) {
        return (value || 0) * (10 ** (exp || 0));
    }

    /**
     * Formats a fluid amount into a human-readable string with units.
     *
     * @param {number} value The fluid amount in millibuckets (mB).
     * @returns {string} A formatted string with unit suffix (mB, kB, MB).
     */
    static formatFluid(value) {
        let unit = "mB";
        if (value >= 1e9) {
            unit = "MB";
            value /= 1e6;
        } else if (value >= 1e6) {
            unit = "kB";
            value /= 1e3;
        }
        return `${value.toFixed(1)} ${unit}`;
    }

    // --------------------------------------------------------------------------
    // Core operations
    // --------------------------------------------------------------------------

    /**
     * Initializes scoreboard values for a new fluid entity.
     *
     * @param {Entity} entity The entity to initialize.
     * @returns {void}
     */
    static initialize(entity) {
        entity.runCommand(`scoreboard players set @s fluid_0 0`);
    }

    /**
     * Handles item-to-fluid interactions for machines or fluid tanks.
     *
     * Supports:
     * - Inserting fluid from known container items (defined in `itemFluidContainers`)
     * - Filling empty buckets with available fluid (lava, water, milk)
     *
     * @param {string} typeId The item identifier being used (e.g., "minecraft:water_bucket" or "minecraft:bucket").
     * @returns {string|false} Returns the output item ID (e.g., empty bucket) if successful, or false if the action failed.
     */
    fluidItem(typeId) {
        // 1. Handle known container items (e.g., water bucket, lava bucket)
        const insertData = itemFluidContainers[typeId];
        if (insertData) {
            const { type, amount, output } = insertData;

            // Ensure the tank can accept this fluid
            const inserted = this.tryInsert(type, amount);
            if (!inserted) return false;

            return output; // Return resulting item (e.g., empty bucket)
        }

        // 2. Handle empty bucket → attempt to fill with stored fluid
        if (typeId === "minecraft:bucket") {
            const validFillable = ["lava", "water", "milk"];
            const storedType = this.getType();

            // Only valid fluids can be bucketed
            if (!validFillable.includes(storedType)) return false;

            // Require at least 1000 mB (1 bucket)
            if (this.get() < 1000) return false;

            // Drain and return filled bucket
            this.add(-1000);
            return `minecraft:${storedType}_bucket`;
        }

        // 3. Not a recognized container item
        return false;
    }


    /**
     * Sets the fluid capacity of this tank.
     *
     * @param {number} amount Maximum fluid capacity in mB.
     * @returns {void}
     */
    setCap(amount) {
        const { value, exp } = FluidManager.normalizeValue(amount);
        this.scores.fluidCap.setScore(this.scoreId, value);
        this.scores.fluidCapExp.setScore(this.scoreId, exp);
    }

    /**
     * Retrieves the full capacity of this tank.
     *
     * @returns {number} The maximum capacity in mB.
     */
    getCap() {
        const v = this.scores.fluidCap.getScore(this.scoreId) || 0;
        const e = this.scores.fluidCapExp.getScore(this.scoreId) || 0;
        this.cap = FluidManager.combineValue(v, e);
        return this.cap;
    }

    /**
     * Sets the current amount of fluid in this tank.
     *
     * Automatically clamps to the tank capacity and normalizes for scoreboard storage.
     *
     * @param {number} amount Amount to set in mB.
     * @returns {void}
     */
    set(amount) {
        const { value, exp } = FluidManager.normalizeValue(amount);
        this.scores.fluid.setScore(this.scoreId, value);
        this.scores.fluidExp.setScore(this.scoreId, exp);
    }

    /**
     * Gets the current amount of fluid stored in this tank.
     *
     * @returns {number} The current fluid amount in mB.
     */
    get() {
        const v = this.scores.fluid.getScore(this.scoreId) || 0;
        const e = this.scores.fluidExp.getScore(this.scoreId) || 0;
        return FluidManager.combineValue(v, e);
    }

    /**
     * Adds or subtracts a specific amount of fluid.
     *
     * Automatically clamps to the tank capacity.
     *
     * @param {number} amount Amount to add (negative values subtract).
     * @returns {number} Actual amount added or removed.
     */
    add(amount) {
        const current = this.get();
        const newValue = Math.max(0, Math.min(current + amount, this.getCap()));
        this.set(newValue);
        return newValue - current;
    }

    /**
     * Consumes a specific amount of fluid if available.
     *
     * @param {number} amount The amount to consume.
     * @returns {number} The amount actually consumed (0 if insufficient).
     */
    consume(amount) {
        const current = this.get();
        if (current < amount) return 0;
        this.add(-amount);
        return amount;
    }

    /**
     * Returns the remaining space available in this tank.
     *
     * @returns {number} Remaining free capacity in mB.
     */
    getFreeSpace() {
        return Math.max(0, this.getCap() - this.get());
    }

    /**
     * Checks whether the tank has at least a certain amount of fluid.
     *
     * @param {number} amount Amount to check for.
     * @returns {boolean} True if there is enough fluid.
     */
    has(amount) {
        return this.get() >= amount;
    }

    /**
     * Checks whether the tank is full.
     *
     * @returns {boolean} True if the tank has no free space remaining.
     */
    isFull() {
        return this.get() >= this.getCap();
    }

    // --------------------------------------------------------------------------
    // Type tag management
    // --------------------------------------------------------------------------

    /**
     * Gets the fluid type currently stored in this tank.
     *
     * The type is stored in the entity's tags as `fluid{index}Type:{type}`.
     *
     * @returns {string} The stored fluid type, or "empty" if none.
     */
    getType() {
        const tag = this.entity.getTags().find(t => t.startsWith(`fluid${this.index}Type:`));
        return tag ? tag.split(":")[1] : "empty";
    }

    /**
     * Sets the fluid type for this tank.
     *
     * Removes any previous type tag before adding the new one.
     *
     * @param {string} type The new fluid type (e.g. "lava", "water").
     * @returns {void}
     */
    setType(type) {
        const old = this.entity.getTags().find(t => t.startsWith(`fluid${this.index}Type:`));
        if (old) this.entity.removeTag(old);
        this.entity.addTag(`fluid${this.index}Type:${type}`);
        this.type = type;
    }

    // --------------------------------------------------------------------------
    // Transfer operations
    // --------------------------------------------------------------------------

    /**
     * Transfers a specific amount of fluid from this tank to another.
     *
     * @param {FluidManager} other The target tank to receive the fluid.
     * @param {number} amount The amount to transfer in mB.
     * @returns {number} The actual amount transferred.
     */
    transferTo(other, amount) {
        if (this.getType() !== other.getType() && other.getType() !== "empty") return 0;

        const transferable = Math.min(amount, this.get(), other.getFreeSpace());
        if (transferable <= 0) return 0;

        this.add(-transferable);
        other.add(transferable);
        if (other.getType() === "empty") other.setType(this.getType());
        return transferable;
    }

    /**
     * Receives fluid from another FluidManager.
     *
     * @param {FluidManager} other The source tank to pull from.
     * @param {number} amount The maximum amount to receive.
     * @returns {number} The actual amount received.
     */
    receiveFrom(other, amount) {
        return other.transferTo(this, amount);
    }

    // --------------------------------------------------------------------------
    // Display logic
    // --------------------------------------------------------------------------

    /**
     * Displays the current fluid level in the entity's inventory.
     *
     * Renders a 48-frame progress bar representing how full the tank is.
     * The item used depends on the current fluid type.
     *
     * @param {number} [slot=4] Inventory slot index for the display item.
     * @returns {void}
     */
    display(slot = 4) {
        const inv = this.entity.getComponent("minecraft:inventory")?.container;
        if (!inv) return;

        const fluid = this.get();
        const cap = this.getCap();
        const type = this.getType();

        if (type === "empty") {
            inv.setItem(slot, new ItemStack("utilitycraft:empty_fluid_bar"));
            return;
        }

        const frame = Math.max(0, Math.min(48, Math.floor((fluid / cap) * 48)));
        const frameName = frame.toString().padStart(2, "0");

        const item = new ItemStack(`utilitycraft:${type}_bar_${frameName}`, 1);
        item.nameTag = `§r${DoriosAPI.utils.capitalizeFirst(type)}
§r§7  Stored: ${FluidManager.formatFluid(fluid)} / ${FluidManager.formatFluid(cap)}
§r§7  Percentage: ${(fluid / cap * 100).toFixed(2)}%`;

        inv.setItem(slot, item);
    }

    // --------------------------------------------------------------------------
    // Utility for blocks
    // --------------------------------------------------------------------------

    /**
     * Adds a specified fluid to a tank block at a given location.
     *
     * Spawns a fluid tank entity if missing and initializes its scoreboards.
     *
     * @param {Block} block The block representing the tank.
     * @param {string} type The type of fluid to insert.
     * @param {number} amount Amount of fluid to insert in mB.
     * @returns {boolean} True if insertion was successful.
     */
    static addfluidToTank(block, type, amount) {
        const dim = block.dimension;
        const pos = block.location;
        let entity = dim.getEntitiesAtBlockLocation(pos)[0];

        if (!entity) {
            const { x, y, z } = block.location;
            entity = dim.spawnEntity(`utilitycraft:fluid_tank_${type}`, { x: x + 0.5, y, z: z + 0.5 });
            if (!entity) return false;
            FluidManager.initialize(entity);
        }

        const tank = new FluidManager(entity, 0);
        tank.setCap(FluidManager.getTankCapacity(block.typeId));
        tank.setType(type);
        tank.add(amount);
        return true;
    }

    /**
     * Returns the default capacity for a given tank block.
     *
     * @param {string} typeId The block type identifier.
     * @returns {number} The tank's base capacity in mB.
     */
    static getTankCapacity(typeId) {
        const caps = {
            "utilitycraft:basic_fluid_tank": 8000,
            "utilitycraft:advanced_fluid_tank": 32000,
            "utilitycraft:expert_fluid_tank": 128000,
            "utilitycraft:ultimate_fluid_tank": 512000
        };
        return caps[typeId] ?? 8000;
    }
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
 * Extracts the fluid type and amount from a formatted text like:
 * "§r§7  Stored Lava: 52809 kB/ 64000 kB"
 * 
 * @param {string} input - The lore line.
 * @returns {{ type: string, amount: number }} - The fluid type and its parsed numeric value.
 */
export function obtainfluidFromText(input) {
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

export function formatfluid(value) {
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

export function formatInputsfluids(input1, input2) {
    const formattedInput1 = formatfluid(input1);
    const formattedInput2 = formatfluid(input2);

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