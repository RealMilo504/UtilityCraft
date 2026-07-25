# UtilityCraft v3.5.0

This is the complete changelog for the changes introduced after v3.4.5.

## SUMMARY

- Completely redesigned machine and generator interfaces with clearer layouts, colored slots, resource displays, and expandable side panels.
- Added an in-machine Recipe Book for the Infuser, Crusher, Electro Press, Autosieve, Autofisher, Magmatic Chamber, and Seed Synthesizer.
- Added dedicated Information, Upgrades, and Input/Output panels to supported machine screens.
- Added configurable per-face item, liquid, and gas I/O, including machines with multiple input and output modes.
- Reworked item, liquid, energy, and gas transport networks with persistent configuration menus, filtering, routing modes, and better performance.
- Reworked Bonsais with dynamic growth times, optimized models, safer output handling, and more reliable soil and yield modifiers.
- Reworked Bountiful Crops, crop harvesting, Accelerator Clocks, machine working-area previews, and Pedestal previews.
- Reworked the XP Condenser into a proper liquid machine with internal XP storage and exact level-transfer controls.
- Reworked the Way Center, Way Carpets, and Way Chips with safer teleportation, persistent destinations, localized menus, range limits, and level costs.
- Reworked sieving, ore chunks, shards, pebbles, machine processing recipes, and early-game resource progression.
- Added gas storage and transport, Creative resource sources, machine upgrade registries, overclock support, and generic linked-storage support.
- Migrated the pack to DoriosLib and expanded creator APIs, registries, typings, and addon integration support.

## USER INTERFACE

### Machine UI Overhaul

- Redesigned the interfaces for machines, generators, batteries, receivers, and transmitters.
- Added a shared top bar and expandable right-side panels for Recipes, Upgrades, Input/Output configuration, and machine information.
- Added clear open and close states for every side panel.
- Added colored slot backgrounds so input, secondary input, output, fuel, blueprint, mesh, soil, seed, and upgrade slots are easier to identify.
- Added clearer energy, liquid, gas, steam, temperature, and progress displays.
- Added improved toggle buttons, hover states, panel backgrounds, tabs, connectors, icons, overlays, and separators.
- Added localized hover text and clearer labels throughout machine screens.
- Added information pages that explain what each supported machine does, which slots it uses, and which upgrades it accepts.
- Renamed player-facing references to `Fluids` as `Liquids` for consistency.
- Updated machine and generator interfaces to work with the new I/O system.
- Updated machine blocks to use vanilla full-block geometry and per-face textures where possible.
- Normalized and reorganized machine textures and other Resource Pack assets.

### Recipe Book and Drop Tables

- Added an embedded Recipe Book tab to the Infuser.
- Added an embedded Recipe Book tab to the Crusher.
- Added an embedded Recipe Book tab to the Electro Press.
- Added an Autosieve drop-table tab.
- Added an Autofisher loot-table tab.
- Added a Magmatic Chamber recipe tab.
- Added a Seed Synthesizer drop-table tab.
- Added recipe separators, animated ingredient displays, output amounts, localized hover text, and recipe compatibility hooks.
- Added support for displaying registered recipes from compatible addons.
- Updated Recipe Book assets after the sieving and ore-processing rework.
- Removed the visible recipe-batch label while keeping batch-processing support.

### Localization

- Localized machine UI labels instead of relying on hardcoded text.
- Localized modal forms and action forms.
- Localized the new Way Center and Way Chip menus.
- Added localized messages for machine upgrades, item transport, liquid transport, gas transport, I/O configuration, and machine-area outlines.
- Expanded new menu translations in English, Spanish (Spain and Mexico), and Portuguese (Brazil and Portugal).

## MACHINE INPUT/OUTPUT

- Added a new per-face I/O system for items, liquids, and gases.
- Added visual I/O controls directly inside supported machine screens.
- Added separate item, liquid, and gas I/O tabs where required.
- Added machine-specific I/O modes so a face can target the correct input, secondary input, output, fuel, mesh, blueprint, soil, seed, or resource storage.
- Added support for multiple valid I/O configurations on the same machine.
- Applied the new item I/O system to all compatible machines.
- Applied liquid I/O to the Magmatic Chamber, Magmator, Thermo Generator, and XP Condenser.
- Added gas I/O support for compatible machines and addons.
- Added direction-aware I/O that correctly follows machine rotation and visible front faces.
- Added tag-based interface registration so compatible blocks can expose I/O without relying on fragile identifier checks.
- Improved item, liquid, gas, and energy container resolution.
- Added support for resource items whose lore contains multiple liquid or gas storages.
- Added generic link nodes that can route items, liquids, gases, and energy to linked storage endpoints, including multiblock integrations.

## PIPES AND NETWORKS

### Network Rework

- Rebuilt item conduit networks around the new I/O and container systems.
- Rebuilt liquid pipe networks with the same routing and persistence model.
- Improved energy cable network discovery and transfer scheduling.
- Added complete gas pipe network support.
- Added Basic, Advanced, Expert, and Ultimate Gas Tanks.
- Added Gas Pipes and Gas Extractors in the default, blue, green, red, orange, and yellow network colors.
- Kept colored networks isolated from one another.
- Added persistent exporter and importer settings.
- Added debounced, scheduled network rescans to reduce large scripting spikes.
- Added network reconciliation when pipes or exporters are moved by pistons.
- Improved network endpoint caching and invalid-target cleanup.
- Improved transfer fairness and reduced repeated container scans.

### Exporter and Importer Menus

- Added configuration menus for Item Exporters and Item Importers.
- Added configuration menus for Liquid Extractors.
- Added configuration menus for Gas Extractors.
- Added enable and disable controls.
- Added whitelist and blacklist filtering.
- Added Nearest, Farthest, and Round Robin destination modes.
- Added item filters using the held item.
- Added liquid and gas filters using either the held container or the connected source.
- Added menus for adding and removing filtered resources.
- Replaced the old Smart Filter Upgrade path with the shared Filter Upgrade system.

## MACHINES AND GENERATORS

### XP Condenser

- Completely reworked the XP Condenser as a liquid-storage machine.
- Added a fixed internal capacity of 256,000 mB of XP.
- Added exact Deposit 1, Deposit 5, Deposit Max, Withdraw 1, Withdraw 5, and Withdraw Max controls.
- Preserved exact XP totals and level progress during transfers.
- Added transaction safeguards so failed transfers do not delete stored or player XP.
- Added live stored-XP, capacity, and operation-status displays.
- Added configurable XP liquid input and output on every face.
- Added per-face machine textures and an updated XP Condenser UI.

### Way Center

- Completely reworked the Way Center, Way Carpet, and Way Chip systems.
- Way Chips now store destination data in persistent item properties instead of depending on lore parsing.
- Added a localized Way Chip binding form with destination names.
- Added persistent Way Center destination lists with duplicate protection.
- Added destination sorting, dimension icons, distance displays, teleport costs, range displays, and upgrade discounts.
- Added range levels of 1,000, 2,500, 5,000, 10,000, 25,000, and unlimited blocks.
- Added discounts of 0%, 5%, 15%, 25%, 50%, and 100% based on range level.
- Added safer cross-dimensional teleportation and collision checks.
- Added validation for missing or blocked Way Carpets and Way Centers.
- Invalid destinations are now removed safely instead of leaving broken entries.
- Breaking a Way Center now returns its registered destination chips in Survival.
- Breaking a Way Carpet now unregisters it from connected centers.

### Machine Upgrades and Processing

- Added a shared machine-upgrade registry.
- Speed, Energy, and Range Upgrades now use registered level definitions.
- Machine blocks now declare the exact upgrade types, slots, and maximum levels they accept.
- Upgrades can be installed by using the upgrade item directly on a compatible machine.
- Sneaking while installing an upgrade inserts as many valid upgrades as possible.
- Added localized messages for unsupported upgrades, maximum levels, successful installation, and failed installation.
- Fixed machines accepting upgrades beyond their real limits.
- Added recipe-batch processing support for compatible machines and custom upgrade definitions.
- Added overclock support. Each overclock level increases speed by 35% and energy cost by 25% unless disabled by the machine.
- Improved upgrade registry validation and creator extension support.

### Machine Behavior

- Fixed the Block Breaker, Block Placer, and Harvester working in the wrong direction.
- Fixed their front, back, side, top, and bottom textures so their visuals match the working direction.
- Fixed the Block Placer I/O face orientation.
- Fixed and centered the Harvester and Block Breaker UI descriptions.
- Added working-area outlines for the Harvester, Block Breaker, and Block Placer.
- Working-area outlines can be toggled with a Wrench and update after rotation or Range Upgrade changes.
- Limited Harvester area expansion to 9x9; the fourth Range Upgrade now pulls drops back toward the machine.
- Improved automated harvesting for Bountiful Crops.
- Completed Crafter machine recipes and migrated their registration to the shared registry system.
- Improved Assembler batch crafting based on installed Speed Upgrades.
- Added machine output and progress safeguards for full inventories and insufficient inputs.

### Generators and Creative Sources

- Added the Creative Battery, which supplies infinite energy at up to 10 kDE/t.
- Added Creative Water, Lava, Milk, XP, and Steam Tanks.
- Infinite tanks can fill compatible held containers and connect to the new transport networks.
- Added Steam Bar UI elements for gas-based machines and integrations.
- Reduced Wind Turbine maximum altitude multipliers:
  - Basic, Advanced, and Expert: 300% to 200%.
  - Ultimate: 400% to 250%.
- Corrected Wind Turbine UI rate reporting to display actual DE/t.
- Fixed Gas Tank material instances and visuals.
- Simplified Battery textures while preserving charge-level displays.

## BONSAIS, CROPS, AND FARMING

### Bonsais

- Rebuilt Bonsai growth around persistent progress steps and dynamic cycle lengths.
- Bonsai growth times now support precise 10% timing increments.
- Soil speed and yield modifiers are recalculated without resetting completed progress.
- Tilling a supported soil now resynchronizes the current cycle safely.
- Slime Ball pausing and decorative Bonsais now preserve their growth state.
- Improved recovery and cleanup of orphaned or invalid Bonsai entities.
- Added an admin command for recalculating loaded Bonsais.
- Optimized Bonsai models to use far fewer cubes and reduce rendering cost.
- Bonsais now insert output only into the container below and no longer spill items into the world when that container is full.
- Bonsais safely return their plant and soil when removed.

### Bountiful Crops

- Reworked crop definitions, growth ticks, harvesting, seeds, loot, and Fortune handling.
- Updated crop growth intervals by tier.
- Mature crops now always preserve or return the seed needed to replant them.
- Added a consistent additional-seed chance.
- Added controlled Fortune scaling up to Fortune III.
- Right-click, area, machine, and block-break harvesting now share the same crop data and drop rules.
- Automated harvests use base yield and no Fortune bonus.
- Improved Area Harvest behavior for supported hoes and AIOTs.
- Updated Seed Synthesizer data from the same generated crop registry to keep drops consistent.

### Accelerator Clocks and Outlines

- Renamed the original Accelerator Clock to the Gold Accelerator Clock.
- Added the Diamond Accelerator Clock with a 50% growth-attempt chance.
- Added the Nether Star Accelerator Clock with guaranteed growth attempts and a chance to advance an extra growth stage.
- Rebalanced the Gold Accelerator Clock to an 18.75% growth-attempt chance.
- Applied tier-aware growth scaling to Bountiful Crops.
- Added a temporary 9x9 Pedestal area preview when placing or changing an Accelerator Clock.
- Added recipes, items, entities, names, and models for the new clocks.

## SIEVING AND RESOURCE PROGRESSION

- Reworked Sieve and Autosieve drop tables.
- Added Crushed Blackstone.
- Added single, double, triple, and quadruple Compressed Crushed Blackstone.
- Added Blackstone, Basalt, Calcite, Dripstone, Gilded Blackstone, and Tuff Pebbles to the updated resource loop.
- Added Geodes, Diamond Shards, Emerald Shards, Shulker Shell Shards, Nether Star Fragments, Totem Shards, and Wither Skull Shards to relevant processing paths.
- Replaced redundant Diamond, Emerald, Lapis, and Redstone chunks with direct resources or shard-based progression where appropriate.
- Removed obsolete crushed-block handfuls and dimension-specific pebbles that were no longer part of progression.
- Gravel can now produce Lapis directly plus Diamond and Emerald Shards.
- Sand can now produce up to four Redstone per successful roll.
- Crushed Netherrack can now produce Ender Pearls at a 0.5% chance and no longer produces Gold Nuggets.
- Crushed Blackstone now has its own progression table, including Basalt, Sulfur, Gold, Magma Cream, and Ancient Debris resources.
- Crushed End Stone now requires higher-tier meshes for Ender Pearls and can produce Shulker Shell Shards.
- Crushed Cobbled Deepslate now produces Geodes, Calcite and Tuff Pebbles, gem shards, and direct Lapis instead of the removed chunk types.
- Compressed sieve inputs continue to produce scaled nine-times output.
- Added Sand Handfuls to the Dirt and Grass hammer-interaction pool.
- Added Mud Balls from Mud.
- Added Red Sand Handfuls from Red Sand and Terracotta.
- Fixed the Basic Sieve so all supported inputs fit within Bedrock's block-state limits.
- Updated the in-game guide and Recipe Book to describe the new resource progression.

## RECIPES AND BALANCE

### Crusher

- Added Crusher recipes for Blackstone and all four compressed Blackstone tiers.
- Metal ores now produce two matching dusts.
- Coal Ore produces four Coal.
- Quartz Ore produces six Quartz.
- Lapis and Redstone Ore produce eight resources.
- Diamond and Emerald Ore produce two gems.
- Nether Gold Ore and Gilded Blackstone produce two Gold Dust.
- Ancient Debris produces two Netherite Scrap Dust.
- Added Crusher recipes for Clay, Glowstone, Quartz Blocks, Amethyst Blocks, Geodes, Sandstone, Red Sandstone, Bricks, Nether Bricks, Hay Bales, Melons, Snow, leaves, and other reversible materials.

### Electro Press

- Added ore reconstruction from four Copper, Gold, Iron, Coal, Deepslate, Nether Quartz, Nether Gold, or Ancient Debris chunks.
- Added reconstruction recipes for pebbles, handfuls, fragments, and shards.
- Added compression recipes for Wheat, Clay Balls, Bricks, Nether Bricks, Glowstone Dust, Quartz, Amethyst, Snowballs, and Sulfur.
- Added reconstruction recipes for Nether Stars, Shulker Shells, Totems of Undying, and Wither Skeleton Skulls.

### Infuser

- Added separate Coal Dust and Charcoal Dust routes for Steel Ingots and Steel Dust.
- Added Brute Steel recipes using Raw Iron with Coal, Coal Dust, Charcoal, or Charcoal Dust.
- Added recipes for Eyes of Ender, Magma Cream, Golden Carrots, Golden Apples, and Glistering Melon Slices.
- Added recipes for Red Sand, Cinnabar, Warped Nylium, Crimson Nylium, Sculk, Gilded Blackstone, Podzol, Mycelium, Rooted Dirt, and Compressed Netherrack.
- Changed the Crying Obsidian recipe to consume eight Obsidian and produce eight Crying Obsidian.
- Removed outdated or duplicate Infuser routes, including the old Raw Energized Iron Dust route.

### Other Recipe Changes

- Completed and registered the Crafter's built-in recipes, including generators, energy transfer blocks, machines, tanks, utilities, networks, elevators, fishing nets, chips, and upgrades.
- Updated the machine crafting recipe set after removing obsolete features.
- Updated the solid-fuel list and fixed all Compressed Wood tiers so they provide the intended DE values.
- Updated the smeltable-item list.
- Empty Fluid Capsules can now be filled from a Sink.
- Lowered the Autofisher Heart of the Sea requirement from net tier 6 to tier 5.
- Added Redstone as a Sieve drop from Sand before the larger sieving rework.

## CREATOR CHANGES

### DoriosLib

- Added DoriosLib 2.0.0 as UtilityCraft's new shared creator library.
- Removed the deprecated DoriosAPI runtime and migrated the entire pack to explicit DoriosLib module imports.
- DoriosLib no longer mutates Minecraft prototypes or exposes a global API; creators can import only the modules they need from `DoriosLib/index.js`.
- Added public `block`, `config`, `constants`, `container`, `dependencies`, `entity`, `item`, `linkNode`, `math`, `messages`, `player`, `registry`, `text`, `time`, and `utils` modules.
- Added block helpers for reading and writing one or multiple states, resolving facing vectors and blocks, reading adjacent blocks, and finding a block's backing entity.
- Added entity helpers for inventory access, item searches and counts, slot writes, item removal, inventory clearing, equipment access, and health management.
- Added player helpers for game-mode checks and safe item delivery.
- Added item creation, type matching, durability inspection, repair, and damage helpers.
- Added common math helpers for clamping, rounding, scaling, random ranges, distances, offsets, and Roman numeral conversion.
- Added text, message, time, array, object, and safe JSON parsing, stringifying, and cloning helpers.
- Added dependency discovery, semantic-version comparison, validation, and formatted dependency reports.

### DoriosLib Containers and Link Nodes

- Added the unified `DoriosLib.container` API for vanilla containers, custom entity containers, and linked containers.
- Added `container.resolve()` and `container.resolveAt()` for resolving a container from an entity, block, or world location.
- Added `container.getInputSlots()` and `container.getOutputSlots()` for direction-aware slot access.
- Added `container.insert()` and `container.transfer()` for safe item movement between compatible endpoints.
- Added container configuration revisions, compatibility checks, cache invalidation, explicit initialization, and shutdown controls.
- Added `DoriosLib.linkNode` helpers for creating, parsing, locating, validating, and resolving linked storage nodes.
- Added persistent link-node I/O overrides with initialization, invalidation, revision tracking, and per-resource input/output selection.

### DoriosLib Registries

- Added queued world-load registration so addons can register content safely before UtilityCraft's machine systems initialize.
- Added `registerCrusherRecipe()`, `registerPressRecipe()`, `registerInfuserRecipe()`, `registerMelterRecipe()`, `registerFurnaceRecipe()`, and `registerCrafterRecipe()`.
- Added `registerSieveDrop()`, `registerAutoFisherDrop()`, `registerPlant()`, and `registerBonsai()`.
- Added `registerFuel()`, `registerCoolant()`, `registerFluidItem()`, `registerFluidHolder()`, `registerGasItem()`, and `registerGasHolder()`.
- Added `registerMachineUpgrade()` and `registerSpecialContainerSlots()`.
- Added `createRegistrar()` for namespaced registrar instances.
- Added shared `blockComponent()`, `itemComponent()`, and `customCommand()` registration helpers.
- Migrated UtilityCraft's recipes, drops, fuels, coolants, fluid and gas items, machine upgrades, block components, item components, and commands to the new registries.

### DoriosCore

- Added `ContainerSessionManager` for safely tracking and closing active container UI sessions.
- Added the shared `registerIOInterface()` API for declaring item, liquid, and gas I/O in one machine definition.
- Added `registerIOInterfaceForBlockTag()` so creators can assign an interface to every block with a matching tag.
- Added `ensureBlockIOInterface()`, `hasRegisteredIOInterface()`, and the shared `IOInterface` registration facade.
- Added `registerLinkNodeIO()`, `getLinkNodeIODefinition()`, and `openLinkNodeIOForm()` for configurable linked-storage ports.
- Added lower-level item, liquid, and gas I/O definitions with per-face modes, configuration revisions, normalization, cloning, status inspection, and direction-mode cycling.
- Added direction-aware item container resolution through `resolveItemContainerAt()`.
- Added `resolveFluidContainer()`, `resolveFluidContainerAt()`, `getFluidInputIndices()`, `getFluidOutputIndices()`, `transferFluid()`, `insertFluid()`, and `getFluidStorage()`.
- Added equivalent gas APIs through `resolveGasContainer()`, `resolveGasContainerAt()`, `getGasInputIndices()`, `getGasOutputIndices()`, `transferGas()`, `insertGas()`, and `getGasStorage()`.
- Added the `GasStorage` class with indexed storage, fixed gas types, item-container interaction, network transfer, display bars, and the same core operations as `FluidStorage`.
- Expanded `FluidStorage` with indexed storage, fixed liquid types, safer insertion, container-item interaction, direct storage transfer, and network transfer modes.
- Expanded `EnergyStorage` with normalized values, free-space checks, safe add and consume operations, direct storage and entity transfers, percentage reporting, and configurable network routing.
- Added `MachineUpgradeRegistry` for validated, extensible upgrade definitions and level-based modifiers.
- Added `BasicMachine.processIO()` for processing declared item, liquid, and gas interfaces through one call.
- Added indexed progress and energy-cost support through `setProgress()`, `displayProgress()`, `setEnergyCost()`, and `getEnergyCost()` on machines and multiblock machines.
- Added machine status and warning helpers, output-state checks, direction-aware output tracking, and configurable I/O processing limits.
- Added resource-lore helpers for building, parsing, reading, and restoring energy, multiple liquid tanks, and multiple gas tanks from items.
- Added shared direction helpers for offsets, opposite faces, block-facing resolution, and relative I/O face conversion.
- Expanded multiblock activation, deactivation, structure detection, and storage integration for items, liquids, gases, energy, and link nodes.
- Added and updated DoriosCore typings for machine settings, boosts, I/O definitions, storage classes, containers, upgrades, resource lore, link nodes, multiblocks, and the new helper methods.

## PERFORMANCE AND TECHNICAL CHANGES

- Reduced unused block permutations in machines, networks, Bonsais, Cobblestone Generators, Mechanical Spawners, Creative Tanks, and Asphalt.
- Optimized cable rescans, transfers, caching, and scheduled work.
- Optimized Bonsai models and runtime processing.
- Normalized script filenames, imports, texture names, models, entity definitions, UI assets, and folder structure.
- Added documentation for the normalized Resource Pack texture structure.
- Removed duplicated and unused assets.

## BUG FIXES

- Fixed machine I/O directions not following block rotation correctly.
- Fixed an I/O configuration bug and incorrect output-slot behavior.
- Fixed the Harvester and Block Breaker information text alignment.
- Fixed the Harvester, Block Breaker, and Block Placer working on the wrong face.
- Fixed machine textures displaying on the wrong faces after the geometry migration.
- Fixed additional machine texture references after asset normalization.
- Fixed the Basic Sieve failing after the expanded input list exceeded a single block-state enum.
- Fixed Asphalt texture switching.
- Fixed Asphalt mining properties so it can be mined with Pickaxes, Shovels, and AIOTs.
- Fixed every Compressed Wood tier being detected incorrectly as Furnator fuel.
- Fixed Gas Tank material instances.
- Fixed Bonsais dropping overflow items into the world when the output container was full.
- Fixed recipe UI output slots, separators, layers, toggles, hover states, and panel alignment.
- Fixed several malformed JSON files and pack dependency declarations.
- Fixed upgrade registration and maximum-level handling.
- Fixed Wind Turbine rate text showing interval output instead of actual per-tick output.
- Fixed Way Center destination duplication, missing destinations, unsafe teleports, blocked destinations, and broken legacy data handling.
- Fixed XP Condenser level math, partial XP progress, storage overflow, and failed-transfer rollback.

## REMOVED AND CLEANED UP

- Removed the obsolete Smart Filter Upgrade and its recipe; the shared Filter Upgrade now handles network filtering.
- Removed unused paused Conveyor, Fluid Pump, and Utility Table definitions and assets.
- Removed unused Drill and Tractor placer blocks and recipes.
- Removed legacy vehicle assets.
- Removed obsolete ore-chunk, handful, pebble, and conversion recipes replaced by the new resource progression.
- Removed duplicated UI, machine, texture, model, and legacy script assets.
