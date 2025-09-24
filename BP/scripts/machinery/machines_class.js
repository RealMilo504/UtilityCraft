import * as doriosAPI from "../doriosAPI.js"
import { world, system, ItemStack } from '@minecraft/server'

export * as settings from './machines_config.js';

import { ProgressManager, Machinery, obtainEnergyFromText, obtainLiquidFromText, formatEnergyToText as ft } from './managers.js'
export { LiquidManager, EnergyManager } from './managers.js'

export class Machine extends Machinery {
    /**
     * Creates a new Machine instance.
     * 
     * @param {Block} block The block representing the machine.
     * @param {Object} [settings] Machine's settings.
     */
    constructor(block, settings) {
        super(block, settings)
        this.entity?.runCommand(`scoreboard players set @s energyCap ${settings.energyCap}`)
        this.progress = new ProgressManager(this.entity, this.inv, this.block);
        const energyLevel = block.permutation.getState('utilitycraft:energy') ?? 0;
        const speedLevel = block.permutation.getState('utilitycraft:speed') ?? 0;

        /**
         * Speed multiplier based on speed upgrade level.
         * Higher levels increase processing speed.
         * @type {number}
         */
        this.speed = 1 + 0.125 * speedLevel * (speedLevel + 1);

        /**
         * Base processing speed without refresh delay applied.
         * @type {number}
         */
        this.trueRateSpeed = this.speed * (settings.rateSpeedBase ?? 0);

        /**
         * Final processing speed including refresh rate.
         * @type {number}
         */
        this.rateSpeed = this.trueRateSpeed * this.refreshSpeed;

        /**
         * Energy efficiency multiplier (lower is better).
         * Affected by both energy and speed upgrades.
         * @type {number}
         */
        this.efficiency = energyLevel < 4
            ? (1 - 0.2 * energyLevel) * this.speed
            : (1 - (0.95 - 0.05 * (8 - energyLevel))) * this.speed;
    }


    /**
     * Spawns a machine entity at the given block location with a name tag and energy settings.
     *
     * @param {object} e The event data object containing information about the destroyed block and player.
     * @param {string} entityId
     * @param {string} nameTag
     * @param {Object} settings
     * @param {Function} callback A function to execute after the entity is spawned (Optional)
     * @param {boolean} [hasLiquid=false] Whether this machine should manage liquids.
     */
    static spawnMachineEntity(e, settings, callback) {
        const { block, player } = e
        let { x, y, z } = block.location;
        y += 0.25;
        x += 0.5;
        z += 0.5;

        const itemInfo = player.getComponent('equippable').getEquipment('Mainhand').getLore();
        let energy = 0;
        let liquid = false
        if (itemInfo[0]) {
            energy = obtainEnergyFromText(itemInfo[0]);
        }
        if (itemInfo[1]) {
            liquid = obtainLiquidFromText(itemInfo[1])
        }

        system.run(() => {
            const entity = block.dimension.spawnEntity(settings.entity, { x, y, z });
            entity.nameTag = settings.nameTag;
            entity.runCommand(`scoreboard players set @s energy ${energy}`)
            entity.runCommand(`scoreboard players set @s energyCap ${settings.energyCap}`)
            if (liquid || settings.liquidCap > 0) {
                entity.setDynamicProperty('utilitycraft:liquid', liquid.amount || 0)
                entity.setDynamicProperty('utilitycraft:liquidType', liquid.type)
                entity.setDynamicProperty('utilitycraft:liquidCap', settings.liquidCap);
            }
            if (callback) callback(entity)
        });
    }

    /**
     * Displays the progress arrow in the specified slot.
     *
     * @param {number} [slot=4] Slot to place the arrow.
     * @param {number} [energyCost=800] Energy cost used for visual scaling.
     */
    displayProgress(slot = 4, energyCost = 800) {
        const progress = this.progress.get();
        const progressLevel = Math.max(0, Math.min(16, Math.floor(16 * progress / energyCost)));
        const expectedId = `utilitycraft:arrow_right_${progressLevel}`;

        const currentItem = this.inv.getItem(slot);
        if (!currentItem || currentItem.typeId !== expectedId) {
            this.inv.setItem(slot, new ItemStack(expectedId));
        }
    }

    /**
     * Transfers one or several items from an inventory to the container that the block is facing,
     * based on the Minecraft `minecraft:facing_direction` property.
     *
     * If `i` and `o` are not defined, it automatically transfers the item in the last slot.
     * Otherwise, specify:
     * - `i`: the starting slot index
     * - `o`: the final slot index
     *
     * @param {number} [i] (Optional) Starting slot index.
     * @param {number} [o] (Optional) Ending slot index.
     */
    transferItems(i, o) {

        // Define slots to transfer, if they are not defined, last slot will be output\
        let start, end; start = end = this.inv.size - 1;
        if (i && o) { start = i; end = o }

        // Starting Point
        let { x, y, z } = this.block.location;
        [x, y, z] = [x + 0.5, y + 0.25, z + 0.5];

        // Facing direction
        const facingOffsets = { up: [0, -1, 0], down: [0, 1, 0], north: [0, 0, 1], south: [0, 0, -1], west: [1, 0, 0], east: [-1, 0, 0] };
        const facing = facingOffsets[this.block.permutation.getState('minecraft:facing_direction')];
        if (facing) [x, y, z] = [x + facing[0], y + facing[1], z + facing[2]];

        // Getting the next block
        const blockPos = { x, y, z };
        const nextBlock = this.dimension.getBlock(blockPos)

        // If theres no next block return
        if (!nextBlock) return
        if (nextBlock.typeId == 'minecraft:air') return

        // Start the transfer Section
        for (let i = start; i <= end; i++) {
            let itemToTransfer = this.inv.getItem(i)
            if (!itemToTransfer) continue
            // Drawers Section
            if (nextBlock.typeId.includes('dustveyn:storage_drawers')) {
                const targetEnt = this.dimension.getEntitiesAtBlockLocation(nextBlock.location)[0];
                if (!targetEnt.hasTag(`${itemToTransfer.typeId}`)) continue
                const targetId = targetEnt.scoreboardIdentity
                let capacity = world.scoreboard.getObjective("capacity").getScore(targetId)
                let max_capacity = world.scoreboard.getObjective("max_capacity").getScore(targetId)
                if (capacity < max_capacity) {
                    let amount = Math.min(itemToTransfer.amount, max_capacity - capacity)
                    itemToTransfer.amount > amount ? itemToTransfer.amount -= amount : itemToTransfer = undefined;
                    this.inv.setItem(i, itemToTransfer);
                    targetEnt.runCommandAsync(`scoreboard players add @s capacity ${amount}`);
                }
                return
            }
            const blockInv = nextBlock.getComponent('minecraft:inventory')?.container;
            const nextEntity = this.dimension.getEntitiesAtBlockLocation(blockPos)[0]
            const entityInv = nextEntity?.getComponent('minecraft:inventory')?.container;
            if (!blockInv && !entityInv) return

            if (blockInv?.emptySlotsCount > 0) {
                this.inv.transferItem(i, blockInv);
                continue
            }

            if (entityInv) {
                // Simple container: Only accepts items at slot 3
                if (nextEntity.getComponent("minecraft:type_family")?.hasTypeFamily("dorios:simple_input")) {
                    const slotNext = entityInv.getItem(3);
                    if (!slotNext) {
                        this.inv.transferItem(i, entityInv);
                        continue
                    }
                    if (itemToTransfer.typeId == slotNext.typeId && slotNext.amount < 64) {
                        const amount = Math.min(itemToTransfer.amount, 64 - slotNext.amount);
                        entityInv.addItem(new ItemStack(itemToTransfer.typeId, amount));
                        itemToTransfer.amount > amount ? itemToTransfer.amount -= amount : itemToTransfer = undefined;
                        this.inv.setItem(i, itemToTransfer);
                    }
                    continue
                }
                // Assemblers shouldnt accept new items if it has less than 2 empty slots, it could cause filling the output
                if (nextEntity?.typeId == 'utilitycraft:assembler' && entityInv.emptySlotsCount < 2) return
                // Normal entities
                if (entityInv.emptySlotsCount > 0) {
                    this.inv.transferItem(i, entityInv);
                    continue
                }
            }
        }
    }

    /**
     * Checks if the machine can process the input item.
     * Validates space in the output slot and ensures the recipe is valid.
     * 
     * @returns {object|false} The recipe to process or false if processing isn't possible.
     */
    getItemToProcessSingleMachine() {
        const inputSlot = this.inv.getItem(3);

        if (!inputSlot) return false

        const outputSlot = this.inv.getItem(this.inv.size - 1); // Usually last slot

        const recipe = this.settings.recipes[inputSlot?.typeId];

        // No valid recipe or output slot is already full
        if (!recipe || outputSlot?.amount >= 64) return false;

        // Output slot must match the expected output item or be empty
        if (outputSlot && outputSlot.typeId !== recipe.output) return false;

        // Check how many items can still fit in the output slot
        const spaceLeft = (outputSlot?.maxAmount ?? 64) - (outputSlot?.amount ?? 0);

        // Not enough space for the recipe's output
        if ((recipe.amount ?? 1) > spaceLeft) return false;

        return { recipe, inputSlot, spaceLeft };
    }

    /**
     * Executes one operational cycle for single-slot machines such as the Crusher, Incinerator, or Electro Press.
     * 
     * This method handles:
     * - Refreshing speed modifiers and transferring items.
     * - Checking if there is a valid input item and sufficient energy.
     * - Processing items based on available progress and recipe.
     * - Applying energy consumption and updating progress.
     * - Outputting processed items and updating machine state visuals.
     */
    runProccessSingleMachine() {
        this.transferItems();
        Machine.tick(() => {
            this.setRefreshSpeed();
            const itemToProcess = this.getItemToProcessSingleMachine();

            if (!itemToProcess) {
                this.displayEnergy();
                this.progress.reset(4);
                return;
            }

            if (this.energy.get() <= 0) {
                this.displayEnergy();
                this.turnOff();
                return;
            }

            const progress = this.progress.get();
            const energyCost = this.settings.energyCost;

            if (progress >= energyCost) {
                const processCount = Math.min(
                    Math.floor(progress / energyCost),
                    itemToProcess.inputSlot.amount,
                    itemToProcess.spaceLeft
                );

                this.inv.addItem(
                    new ItemStack(
                        itemToProcess.recipe.output,
                        processCount * (itemToProcess.recipe.amount ?? 1)
                    )
                );

                this.progress.add(-processCount * energyCost);
                doriosAPI.entities.changeItemAmount(this.entity, 3, -processCount);
            } else {
                this.processWithEnergy();
            }

            this.turnOn();
            this.displayEnergy();
            this.displayProgress();
        })
    }

    /**
     * Processes an operation by consuming energy and increasing progress.
     * 
     * This uses the available energy to increment the progress, accounting for efficiency.
     * It consumes only what is available and updates the entity's energy.
     * 
     * @returns {number} The updated progress value.
     */
    processWithEnergy() {
        let energy = this.energy.get()

        let usedEnergy = this.rateSpeed * this.efficiency

        if (usedEnergy > energy) {
            usedEnergy = energy;
        }

        this.energy.add(-usedEnergy)
        this.progress.add(usedEnergy / this.efficiency)
    }
}