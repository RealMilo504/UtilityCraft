import { system, world, ItemStack } from '@minecraft/server'
/**
 * Machine settings object for configuring behavior.
 * 
 * @typedef {Object} MachineSettings
 * @property {string} entity Entity identifier used to spawn the machine.
 * @property {string} name_tag Localized name tag identifier.
 * @property {number} energy_cost Energy consumed per operation.
 * @property {number} rate_speed_base Base processing rate (DE/t).
 * @property {number} energy_cap Maximum internal energy capacity.
 * @property {string} recipes Recipe group name associated with this machine.
 */
/**
 * @typedef {import("@minecraft/server").Container} Container
 * @typedef {import("@minecraft/server").Block} Block
 * @typedef {import("@minecraft/server").Entity} Entity
 * @typedef {import("@minecraft/server").ScoreboardObjective} ScoreboardObjective
 * @typedef {import("@minecraft/server").Vector3} Vector3
 * @typedef {import("@minecraft/server").Dimension} Dimension
 * @typedef {import("@minecraft/server").BlockPermutation} BlockPermutation
 */

globalThis.worldLoaded = false;

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
 * const objectives.energy = objectives.energy;
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

export class Machine {


    /**
     * Creates a new Machinery instance.
     * 
     * @param {Block} block The block representing the machine.
     * @param {MachineSettings} settings Machine's settings.
     */
    constructor(block, settings) {
        this.settings = settings
        this.dim = block.dimension
        this.block = block
        this.entity = this.dim.getEntitiesAtBlockLocation(block.location)[0]
        this.inv = this.entity.getComponent('inventory').container
        this.energy = new Energy(this.entity)
    }

    /**
     * Handles machine destruction:
     * - Drops inventory (excluding UI items).
     * - Drops the machine block item with stored energy and liquid info in lore.
     * - Removes the machine entity.
     * - Skips drop if the player is in Creative mode.
     *
     * @param {{ block: Block, brokenBlockPermutation: BlockPermutationplayer: Player, dimension: Dimension }} e The event data object containing the dimension, block and player.
     */
    static onDestroy(e) {
        const { block, brokenBlockPermutation, player, dimension: dim } = e;
        const entity = dim.getEntitiesAtBlockLocation(block.location)[0];
        if (!entity) return;

        const energy = new Energy(entity);
        const blockItemId = brokenBlockPermutation.type.id
        const blockItem = new ItemStack(blockItemId);
        const lore = [];

        // Energy lore
        if (energy.value > 0) {
            lore.push(`§r§7  Stored Energy: ${Energy.formatEnergyToText(energy.value)}/${Energy.formatEnergyToText(energy.cap)}`);
        }

        if (lore.length > 0) {
            blockItem.setLore(lore);
        }

        // Drop item and cleanup
        system.run(() => {
            if (player.getGameMode() == "survival") {
                dim.getEntities({ type: 'item', maxDistance: 3, location: block.center() }).find(item => {
                    item.getComponent('minecraft:item')?.itemStack?.typeId == blockItemId
                }).remove()
            };
            // this.dropInventoryItems(entity);
            entity.remove();
            dim.spawnItem(blockItem, block.center());
        });
    }

    /**
     * Spawns a machine entity at the given block location with a name tag and energy settings.
     *
     * @param {{ block: Block, player: Player, dimension: Dimension }} e The event data object containing the dimension, block and player.
     * @param {Object} settings Custom settings to apply to the machine entity.
     * @param {Function} [callback] A function to execute after the entity is spawned (optional).
     */
    static spawnMachineEntity(e, settings, callback) {
        const { block, player, dimension: dim } = e
        let { x, y, z } = block.center(); y -= 0.25

        const itemInfo = player.getComponent('equippable').getEquipment('Mainhand').getLore();
        let energy = 0;
        if (itemInfo[0]) {
            energy = Energy.getEnergyFromText(itemInfo[0]);
        }

        system.run(() => {
            const entity = dim.spawnEntity(settings.entity, { x, y, z });
            entity.nameTag = settings.name_tag;
            Energy.initialize(entity)
            const energyManager = new Energy(entity)
            energyManager.set(energy)
            energyManager.setCap(settings.energy_cap)
            energyManager.display()
            if (callback) callback(entity)
        });
    }

    /**
     * Changes the texture of the block to the on version.
     */
    on() {
        this.block.setState('utilitycraft:on', true)
    }

    /**
     * Changes the texture of the block to the off version.
     */
    off() {
        this.block.setState('utilitycraft:on', false)
    }

    /**
     * Adds progress to the machine.
     * 
     * @param {number} amount Value to add to the current progress.
     */
    addProgress(amount) {
        const key = "dorios:progress";
        let current = this.entity.getDynamicProperty(key) ?? 0;
        this.entity.setDynamicProperty(key, current + amount);
    }

    /**
     * Sets the machine progress directly.
     * 
     * @param {number} value New progress value.
     * @param {number} [slot=2] Inventory slot to place the progress item.
     * @param {string} [type='arrow_right_'] Item type suffix. 
     */
    setProgress(value, slot = 2, type = "arrow_right") {
        this.entity.setDynamicProperty("dorios:progress", Math.max(0, value));
        this.displayProgress(slot, type)
    }

    /**
     * Gets the current progress of the machine.
     * 
     * @returns {number} Current progress value.
     */
    getProgress() {
        return this.entity.getDynamicProperty("dorios:progress") ?? 0;
    }

    /**
     * Sets the machine's energy cost (maximum progress).
     * 
     * @param {number} value Energy cost representing 100% progress.
     */
    setEnergyCost(value) {
        this.entity.setDynamicProperty("dorios:energy_cost", Math.max(1, value));
    }

    /**
     * Gets the energy cost (maximum progress).
     * 
     * @returns {number} Energy cost value.
     */
    getEnergyCost() {
        return this.entity.getDynamicProperty("dorios:energy_cost") ?? 800;
    }

    /**
     * Displays the current progress in the machine's inventory as a progress bar item.
     * Progress is scaled between 0–16, where 16 = 100% (energy_cost).
     * 
     * @param {number} [slot=2] Inventory slot to place the progress item.
     * @param {string} [type='arrow_right_'] Item type suffix. 
     * Always assumes the `utilitycraft:` namespace, so pass only the suffix.
     */
    displayProgress(slot = 2, type = "arrow_right") {
        const inv = this.entity.getComponent("minecraft:inventory")?.container;
        if (!inv) return;

        const progress = this.getProgress();
        const max = this.getEnergyCost();
        const normalized = Math.min(16, Math.floor((progress / max) * 16));

        const itemId = `utilitycraft:${type}_${normalized}`;
        inv.setItem(slot, new ItemStack(itemId, 1));
    }
}




/**
 * Utility class to manage scoreboard-based energy values for entities.
 */
export class Energy {
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
     * @param {Entity} entity The entity representing the machine.
     * @returns {void}
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
    static formatEnergyToText(value) {
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
    static getEnergyFromText(input, index = 0) {
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
        objectives.energyCap.setScore(this.scoreId, value);
        objectives.energyCapExp.setScore(this.scoreId, exp);
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
        const value = objectives.energyCap.getScore(this.scoreId) || 0;
        const exp = objectives.energyCapExp.getScore(this.scoreId) || 0;

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
        const value = objectives.energyCap.getScore(this.scoreId) || 0;
        const exp = objectives.energyCapExp.getScore(this.scoreId) || 0;

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

        objectives.energy.setScore(this.scoreId, value);
        objectives.energyExp.setScore(this.scoreId, exp);
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
        const value = objectives.energy.getScore(this.scoreId) || 0;
        const exp = objectives.energyExp.getScore(this.scoreId) || 0;
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
            value: objectives.energy.getScore(this.scoreId) || 0,
            exp: objectives.energyExp.getScore(this.scoreId) || 0,
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
            objectives.energy.addScore(this.scoreId, normalizedAdd);

            if (exp > 0 && value < 1e6) {
                this.set(this.get() + amount);
            }
        } else {
            this.set(this.get() + amount);
        }

        return amount;
    }

    /**
     * Displays the current energy as a 48-frame bar item inside the entity's inventory.
     *
     * @param {number} [slot=0] The slot index to place the item in (default is 0).
     * @returns {void}
     *
     * @example
     * energy.display();     // shows bar in slot 0
     * energy.display(5);    // shows bar in slot 5
     */
    display(slot = 0) {
        const container = this.entity.getComponent("minecraft:inventory")?.container;
        if (!container) return;

        const energy = this.get();
        const energyCap = this.getCap();

        const energyP = Math.floor((energy / energyCap) * 48);
        const frame = Math.max(0, Math.min(48, energyP));
        const frameName = frame.toString().padStart(2, "0");

        const item = new ItemStack(`utilitycraft:energy_${frameName}`, 1);
        item.nameTag = '§rEnergy';

        container.setItem(slot, item);
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

