
/**
 * @global
 * @typedef {import("@minecraft/server").Container} Container
 * @typedef {import("@minecraft/server").Block} Block
 * @typedef {import("@minecraft/server").Entity} Entity
 * @typedef {import("@minecraft/server").EntityTypeFamilyComponent} EntityTypeFamilyComponent
 * @typedef {import("@minecraft/server").ScoreboardObjective} ScoreboardObjective
 * @typedef {import("@minecraft/server").Vector3} Vector3
 * @typedef {import("@minecraft/server").Dimension} Dimension
 * @typedef {import("@minecraft/server").BlockPermutation} BlockPermutation
 * @typedef {import("@minecraft/server").BlockCustomComponent} BlockCustomComponent
 * @typedef {import("@minecraft/server").ItemCustomComponent} ItemCustomComponent
 * @typedef {import("@minecraft/server").BlockComponentTickEvent} BlockComponentTickEvent
 * @typedef {import("@minecraft/server").BlockComponentPlayerPlaceBeforeEvent} BlockComponentPlayerPlaceBeforeEvent
 */

/**
 * Machine settings object for configuring behavior.
 * 
 * @global
 * @typedef {Object} MachineSettings
 * @property {Object} entity Entity configuration of the machine.
 * @property {string} entity.name Internal machine name (e.g., "crusher").
 * @property {string} entity.input_type Type of input (e.g., "simple").
 * @property {string} entity.output_type Type of output (e.g., "complex").
 * @property {number} entity.inventory_size Number of inventory slots.
 * 
 * @property {Object} machine Machine operational settings.
 * @property {number} machine.energy_cap Maximum internal energy capacity.
 * @property {number} machine.energy_cost Energy consumed per operation.
 * @property {number} machine.rate_speed_base Base processing rate (DE/t).
 * @property {number[]} machine.upgrades List of accepted upgrade IDs.
 */

/**
 * @global
 * @typedef {"energy" | "filter" | "quantity" | "range" | "speed" | "ultimate"} UpgradeType
 */

/**
 * Object mapping upgrade levels by type.
 * Keys are autocompleted from UpgradeType.
 *
 * @global
 * @typedef {Object} UpgradeLevels
 * @property {number} energy
 * @property {number} range
 * @property {number} speed
 * @property {number} ultimate
 */

/**
 * Parameters stored in a sieve mesh item.
 *
 * @global
 * @typedef {Object} MeshParams
 * @property {number} tier       The mesh tier level (e.g., 0, 1, 2...).
 * @property {number} multiplier Loot multiplier applied to sieve results.
 * @property {number} amount_multiplier Loot multiplier applied to sieve results.
 */

/**
 * Represents a single input→output recipe (Press, Furnace, Crusher, etc.).
 *
 * @global
 * @typedef {Object} SingleInputRecipe
 * @property {string} output The resulting item identifier.
 * @property {number} [required=1] Number of input items required per operation (defaults to 1).
 * @property {number} [amount=1] Number of output items produced (defaults to 1).
 */

/**
 * Represents a collection of single-input recipes.
 *
 * The keys are input item identifiers, and each value describes
 * the resulting output and requirements.
 *
 * @global
 * @typedef {Object.<string, SingleInputRecipe>} SingleInputRecipes
 */

/**
 * Represents a single infusing recipe.
 *
 * @global
 * @typedef {Object} InfusingRecipe
 * @property {string} output The resulting item identifier.
 * @property {number} [required=1] Number of catalyst items required (defaults to 1).
 * @property {number} [amount=1] Number of output items produced (defaults to 1).
 */