import { system, world, ItemStack } from '@minecraft/server'
/**
 * @typedef {import("@minecraft/server").Container} Container
 * @typedef {import("@minecraft/server").Block} Block
 * @typedef {import("@minecraft/server").Entity} Entity
 * @typedef {import("@minecraft/server").ScoreboardObjective} ScoreboardObjective
 * @typedef {import("@minecraft/server").Vector3} Vector3
 */


let worldLoaded = false;

/**
 * Retrieves a scoreboard objective by id, or creates it if it does not exist.
 *
 * @param {string} id The unique identifier of the scoreboard objective.
 * @param {string} [display=id] The display name shown in the scoreboard. Defaults to the id.
 * @returns {ScoreboardObjective} The existing or newly created scoreboard objective.
 */
const getOrCreateObjective = (id, display = id) =>
    world.scoreboard.getObjective(id) ?? world.scoreboard.addObjective(id, display);

/**
 * Ensures a set of scoreboard objectives exist and returns them as an object.
 *
 * Each entry in the `definitions` array must be a tuple of `[id, displayName]`.
 * If the display name is omitted, the objective id will be used as its display name.
 *
 * @param {Array.<[string, string?]>} definitions Array of objectives to load, each with an id and optional display name.
 * @returns {Record<string, ScoreboardObjective>} An object containing the objectives, keyed by their ids.
 *
 * @example
 * const objectives = loadObjectives([
 *   ["energy", "Energy"],
 *   ["energyExp", "EnergyExp"],
 *   ["energyCap", "Energy Max Capacity"],
 *   ["energyCapExp", "Energy Max Capacity Exp"],
 * ]);
 *
 * // Access example
 * const energyScore = objectives.energy;
 */
function loadObjectives(definitions) {
    const result = {};
    for (const [id, display] of definitions) {
        result[id] = getOrCreateObjective(id, display);
    }
    return result;
}

/**
 * Scoreboard objectives used for the energy system.
 * Will be initialized after the world has finished loading.
 *
 * @type {{
 *   energy: ScoreboardObjective,
 *   energyExp: ScoreboardObjective,
 *   energyCap: ScoreboardObjective,
 *   energyCapExp: ScoreboardObjective
 * } | null}
 */
let objectives = null;

world.afterEvents.worldLoad.subscribe(() => {
    objectives = loadObjectives([
        ["energy", "Energy"],
        ["energyExp", "EnergyExp"],
        ["energyCap", "Energy Max Capacity"],
        ["energyCapExp", "Energy Max Capacity Exp"],
    ]);
    worldLoaded = true;
});

/**
 * Utility class to manage scoreboard-based energy values for entities.
 */
class Energy {
    /**
     * Creates a new Energy instance linked to the given entity.
     *
     * @param {Entity} entity The entity this manager is attached to.
     */
    constructor(entity) {
        this.entity = entity;
        this.scoreId = entity.scoreboardIdentity;
        this.cap = this.getCap()
    }

    //#region Statics
    /**
     * Ensures that the given entity has a valid scoreboard identity.
     *
     * If an entity does not yet have one, its `scoreboardIdentity` will be `undefined`.
     * Running this method forces the entity to be registered in the scoreboard system
     * by setting its `energy` objective to `0`.
     *
     * @param {Entity} entity The entity to initialize.
     * @returns {void}
     *
     * @example
     * // Before using Energy, ensure entity has a scoreboard identity:
     * Energy.initialize(myEntity);
     * const energy = new Energy(myEntity);
     */
    static initialize(entity) {
        entity.runCommand(`scoreboard players set @s energy 0`);
    }

    /**
     * Normalizes a raw number into a scoreboard-safe mantissa and exponent.
     * Ensures that the mantissa does not exceed 1e9 by shifting into the exponent.
     *
     * @param {number} amount The raw number to normalize.
     * @returns {{ value: number, exp: number }} The normalized mantissa (value) and exponent.
     *
     * @example
     * Energy.normalizeValue(25_600_000);
     * // → { value: 25_600, exp: 3 }
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
     * Combines a mantissa and exponent back into the full number.
     *
     * @param {number} value The mantissa part of the number.
     * @param {number} exp The exponent part of the number.
     * @returns {number} The reconstructed full number.
     *
     * @example
     * Energy.combineValue(25_600, 3);
     * // → 25_600_000
     */
    static combineValue(value, exp) {
        return value * (10 ** exp);
    }
    //#endregion

    //#region Caps
    /**
     * Sets the maximum energy capacity of the entity.
     * The value is automatically normalized into a mantissa and an exponent,
     * then stored in the corresponding scoreboard objectives.
     *
     * @param {number} amount The raw capacity value to set.
     * @returns {void}
     *
     * @example
     * energy.setCap(25_600_000);
     */
    setCap(amount) {
        const { value, exp } = Energy.normalizeValue(amount);
        energyCapScore.setScore(this.scoreId, value);
        energyCapExpScore.setScore(this.scoreId, exp);
    }

    /**
     * Gets the maximum energy capacity of the entity.
     * Reads the mantissa and exponent from the scoreboards,
     * then reconstructs the full number.
     *
     * The result is also stored in `this.cap` for later checks.
     *
     * @returns {number} The maximum energy capacity.
     *
     * @example
     * const cap = energy.getCap();
     * console.log(cap); // → 25600000
     */
    getCap() {
        const value = energyCapScore.getScore(this.scoreId) || 0;
        const exp = energyCapExpScore.getScore(this.scoreId) || 0;

        this.cap = Energy.combineValue(value, exp);
        return this.cap;
    }

    /**
     * Gets the maximum energy capacity of the entity as separate
     * mantissa and exponent values without combining them.
     *
     * The result is also stored in `this.cap` as the full combined number.
     *
     * @returns {{ value: number, exp: number }} The normalized mantissa and exponent.
     *
     * @example
     * const { value, exp } = energy.getCapNormalized();
     * console.log(value, exp); // → 25600 , 3
     */
    getCapNormalized() {
        const value = energyCapScore.getScore(this.scoreId) || 0;
        const exp = energyCapExpScore.getScore(this.scoreId) || 0;

        this.cap = Energy.combineValue(value, exp);
        return { value, exp };
    }
    //#endregion

    /**
     * Sets the current energy of the entity.
     * The value is automatically normalized into a mantissa and an exponent,
     * then stored in the corresponding scoreboard objectives.
     *
     * @param {number} amount The raw energy value to set.
     * @returns {void}
     *
     * @example
     * energy.set(1_250_000);
     */
    set(amount) {
        const { value, exp } = Energy.normalizeValue(amount);

        energyScore.setScore(this.scoreId, value);
        energyExpScore.setScore(this.scoreId, exp);
    }

    /**
     * Gets the current energy stored in the entity.
     * Reads the mantissa and exponent from the scoreboards,
     * then reconstructs the full number.
     *
     * @returns {number} The current energy value.
     *
     * @example
     * const current = energy.get();
     * console.log(current); // → 1250000
     */
    get() {
        const value = energyScore.getScore(this.scoreId) || 0;
        const exp = energyExpScore.getScore(this.scoreId) || 0;
        return Energy.combineValue(value, exp);
    }

    /**
     * Gets the current energy stored in the entity as separate
     * mantissa and exponent values without combining them.
     *
     * @returns {{ value: number, exp: number }} The normalized mantissa and exponent.
     *
     * @example
     * const { value, exp } = energy.getNormalized();
     * console.log(value, exp); // → 125000 , 1
     */
    getNormalized() {
        return {
            value: energyScore.getScore(this.scoreId) || 0,
            exp: energyExpScore.getScore(this.scoreId) || 0,
        };
    }

    /**
     * Gets the free energy capacity available in the entity.
     *
     * This is the difference between the maximum capacity (`this.cap`)
     * and the current stored energy.
     *
     * @returns {number} The free capacity (0 if already full).
     *
     * @example
     * const free = energy.getFreeSpace();
     * console.log(free); // → 10240
     */
    getFreeSpace() {
        if (this.cap === undefined) {
            this.getCap();
        }
        const current = this.get();
        return Math.max(0, this.cap - current);
    }

    /**
     * Adds energy to the entity, respecting the maximum capacity.
     * Converts the amount into the current exponent scale.
     *
     * @param {number} amount The amount of energy to add.
     * @returns {number} The actual amount of energy added.
     *
     * @example
     * const added = energy.add(5000);
     * console.log(added); // → 5000 or less if near cap
     */
    add(amount) {
        // Clamp amount to remaining capacity
        const free = this.getFreeSpace();
        if (free <= 0) return 0;

        if (amount > free) {
            amount = free;
        }

        // Current normalized values
        let { value, exp } = this.getNormalized();
        const multi = 10 ** exp;

        // Convert to current exponent scale
        const normalizedAdd = Math.floor(amount / multi);

        // Add directly if safe
        let newValue = value + normalizedAdd;
        if (newValue <= 1e9) {
            energyScore.addScore(this.scoreId, normalizedAdd);

            if (exp > 0 && value < 1e6) {
                this.set(this.get() + amount);
            }
        } else {
            this.set(this.get() + amount);
        }

        return amount;
    }

    //#region Utils
    /**
     * Consumes energy from the entity if available.
     * Internally this is just an add with a negative amount.
     *
     * @param {number} amount The amount of energy to consume.
     * @returns {number} The actual amount of energy consumed.
     *
     * @example
     * const used = energy.consume(1000);
     * if (used > 0) console.log(`Consumed ${used} energy`);
     */
    consume(amount) {
        if (amount <= 0) return 0;

        const current = this.get();
        if (current < amount) return 0;

        // Delegate to add with negative value
        this.add(-amount);
        return amount;
    }

    /**
     * Checks if the entity has at least the given amount of energy.
     *
     * @param {number} amount The required amount.
     * @returns {boolean} True if the entity has enough energy.
     *
     * @example
     * if (energy.has(500)) {
     *   // Do operation
     * }
     */
    has(amount) {
        return this.get() >= amount;
    }

    /**
     * Checks if the entity is at maximum capacity.
     *
     * @returns {boolean} True if energy is at or above the capacity.
     *
     * @example
     * if (energy.isFull()) {
     *   console.log("Battery is full!");
     * }
     */
    isFull() {
        return this.getFreeSpace() === 0;
    }

    /**
     * Rebalances the energy value to ensure the mantissa and exponent
     * are in the optimal range.
     *
     * This is useful after large consumes, to avoid cases where
     * the exponent is high but the mantissa is very small.
     *
     * @returns {void}
     *
     * @example
     * energy.rebalance();
     */
    rebalance() {
        this.set(this.get());
    }

    /**
     * Gets the current energy as a percentage of capacity.
     *
     * @returns {number} The percentage [0-100].
     *
     * @example
     * const percent = energy.getPercent();
     * console.log(`${percent.toFixed(1)}% full`);
     */
    getPercent() {
        if (this.cap === undefined) {
            this.getCap();
        }
        if (this.cap <= 0) return 0;
        return Math.min(100, (this.get() / this.cap) * 100);
    }

    /**
     * Transfers energy from this entity to another Energy manager.
     *
     * @param {Energy} other The target Energy instance.
     * @param {number} amount The maximum amount to transfer.
     * @returns {number} The actual amount transferred.
     *
     * @example
     * const transferred = source.transferTo(target, 1000);
     * console.log(`Transferred ${transferred} energy`);
     */
    transferTo(other, amount) {
        const consumed = this.consume(amount);
        if (consumed <= 0) return 0;

        const added = other.add(consumed);
        return added;
    }

    /**
     * Transfers energy from this entity to another entity directly.
     * Creates a temporary Energy manager for the target entity.
     *
     * @param {Entity} entity The target entity.
     * @param {number} amount The maximum amount to transfer.
     * @returns {number} The actual amount transferred.
     *
     * @example
     * const transferred = battery.transferToEntity(machineEntity, 2000);
     * console.log(`Transferred ${transferred} energy`);
     */
    transferToEntity(entity, amount) {
        const other = new Energy(entity);
        return this.transferTo(other, amount);
    }

    /**
     * Receives energy from another Energy manager.
     *
     * @param {Energy} other The source Energy instance.
     * @param {number} amount The maximum amount to receive.
     * @returns {number} The actual amount received.
     *
     * @example
     * const received = machine.receiveFrom(generator, 1500);
     * console.log(`Received ${received} energy`);
     */
    receiveFrom(other, amount) {
        const consumed = other.consume(amount);
        if (consumed <= 0) return 0;

        const added = this.add(consumed);
        return added;
    }

    /**
     * Receives energy directly from another entity.
     * Creates a temporary Energy manager for the source entity.
     *
     * @param {Entity} entity The source entity.
     * @param {number} amount The maximum amount to receive.
     * @returns {number} The actual amount received.
     *
     * @example
     * const received = machine.receiveFromEntity(generatorEntity, 3000);
     * console.log(`Received ${received} energy`);
     */
    receiveFromEntity(entity, amount) {
        const other = new Energy(entity);
        return this.receiveFrom(other, amount);
    }
    //#endregion
}
