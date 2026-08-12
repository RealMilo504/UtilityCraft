# UtilityCraft v3.5.3

## ADDED
- Added Glow Berry and Sea Pickle Bonsais with dedicated entities, textures and models.
- Added distinct normal and flowering visuals for Azalea Bonsais.

## CHANGED
- Chorus Bonsais are now planted with Chorus Flowers and produce Chorus Fruit with a small chance of another flower.
- Reduced the Golden Apple chance from Apple Bonsais from 10% to 1%.
- Golden and Enchanted Golden Apple drops from Bonsais are no longer multiplied by soil yield bonuses.

---

# UtilityCraft v3.5.2

This update expands compressed storage, improves automated harvesting and block breaking, refreshes in-game documentation and strengthens addon tooling and compatibility.

## HIGHLIGHTS
- Added four compression levels for 16 additional block families.
- Reworked the Harvester with internal outputs, safer crop handling and configurable item extraction.
- Added Pickaxe support and configurable item input to the Block Breaker.
- Refreshed the How to Play artwork, pack icons and machine visuals.
- Fixed Stack Refill settings and machine-area outline orientation.

---

## BLOCKS
### Compressed Blocks
- Added a data-driven compressed-block generator with reusable material presets, automatic four-level textures, block definitions, compression/decompression recipes, registrations and localization.
- Added four compression levels for each of the following blocks:
  - Tuff
  - Calcite
  - Dripstone Block
  - Basalt
  - Red Sand
  - Mud
  - Soul Sand
  - Soul Soil
  - Clay
  - Bamboo Block
  - Moss Block
  - Slime Block
  - Honey Block
  - Silicon Block
  - Brute Energized Iron Block
  - Blaze Block
- Restored the custom glass geometry and consolidated all compressed glass face culling under `utilitycraft:glass`.
- Split the Blaze Block texture atlas into side, top and bottom textures and migrated the block to `minecraft:geometry.full_block`.
- Added missing block sounds and removed incomplete or unregistered compressed texture assets.
- Added reusable compression-level overlays and render assets for the compressed-block catalog.

## MACHINES
### Furnace
- Fixed the Quartz Block recipe so the Furnace now produces Smooth Quartz.

### Harvester
- Reworked harvesting to generate loot directly and reset mature crops without breaking the plant.
- Added support for mature vanilla crops, registered UtilityCraft crops and the upper growth of tall crops.
- Added 15 internal output slots and configurable item-output faces.
- The fourth Range Upgrade now stores harvested drops directly in the machine and pauses safely when the complete harvest cannot fit.

### Block Breaker
- Added an optional Pickaxe input whose tool properties determine generated block drops.
- Added configurable item-input faces and a dedicated Pickaxe slot to the machine interface.

### Machine Areas
- Fixed east/west orientation for Harvester, Block Breaker and Block Placer area outlines.

## ITEMS
### Hammers
- Added the missing survival crafting recipe for the Golden Hammer.

### Stack Refill
- Fixed the Stack Refill player setting so disabling it now prevents automatic hotbar refills.

### Machine Chips
- Updated the Basic, Advanced, Expert and Ultimate Machine Chip textures.

## UI/UX
### How to Play
- Replaced and expanded the in-game How to Play artwork for machines, generators, sieves, crafting processes and other UtilityCraft systems.
- Updated Block Breaker and Harvester descriptions to match their new slots and behavior.
- Added previously omitted Autofisher and Sieve loot entries to their recipe and How to Play tables.

### Visuals
- Updated the Behavior Pack and Resource Pack icons.
- Added reusable render scenes, render overrides and a catalog of block, machine, crop and compressed-block renders.
- Updated the shared glyph atlas and added a Pickaxe slot overlay.

## COMPATIBILITY
- Moved the `utilitycraft:link_node_io` component registration into UtilityCore while preserving the shared DoriosCore I/O interface.
- Updated DoriosLib to 2.1.0 with shared player-tracking helpers and matching type declarations.

## DEVELOPMENT
- Replaced the obsolete compressed-block Python script with the manifest-driven Node.js generator and audit workflow.
- Updated the workspace watch task from Dash Compiler to Regolith.
- Updated the release workflow to upload the minified release asset to CurseForge after GitHub release assets are built.

---

# UtilityCraft v3.5.1

This update expands Bountiful Crops integration, moves Silicon into UtilityCraft, improves machine interfaces and fixes Way Center teleportation.

## HIGHLIGHTS
- Added Bonsai support for all Bountiful Crops crops.
- Added Silicon and the Block of Silicon as native UtilityCraft materials.
- Added a dedicated Creative Battery interface.
- Improved machine side panels and made I/O panels adapt to their available resource types.
- Fixed Way Center teleportation to destinations in unloaded chunks.

---

## BLOCKS
### Bountiful Crops
- Added dedicated seed blocks for all 32 Bountiful Crops crops.
- Added Bonsai entities, models, visuals and localized names for every supported Bountiful Crops crop.
- Added automatic conversion of legacy crop blocks to the new seed block identifiers while preserving their block states.
- Fixed generated crop Bonsai definitions so their growth-time defaults remain valid.

### Materials
- Added the Block of Silicon.
- Added crafting recipes to compress nine Silicon into a Block of Silicon and decompress it back into nine Silicon.

## ITEMS
### Materials
- Added Silicon as a native UtilityCraft crafting material.
- Silicon is obtained by smelting Quartz Dust.

## MACHINES
### Creative Battery
- Added a dedicated interface with its energy display and information panel.

### Crusher
- Added a recipe to crush a Block of Silicon into nine Silicon.
- Added Silicon recipes to the in-machine Recipe Book.

### Electro Press
- Added a recipe to press nine Silicon into a Block of Silicon.
- Added the Silicon recipe to the in-machine Recipe Book.

### Furnace
- Added Quartz Dust processing into Silicon.
- UtilityCraft Quartz Dust now produces UtilityCraft Silicon instead of the Integrated Storage variant.

### Way Center
- Fixed teleports to Way Carpets and Way Centers in unloaded chunks being rejected before the destination could load.
- Destination validation now runs after teleportation, while still removing stale Way Carpet and Way Center links.
- Improved the formatting of Way Center, Way Carpet and Way Chip descriptions.

## UI/UX
### Machine Interfaces
- Improved shared machine side-panel layouts and positioning.
- Added clearer disabled overlays for unsupported upgrade slots.
- Added support for machines with a single dedicated upgrade slot.
- Added reload button textures and reusable interface controls.
- Machines without energy capacity no longer attempt to display an energy value when placed.

### I/O Configuration
- Made I/O configuration panels adapt to the Item, Liquid and Gas tabs supported by each machine.
- Improved the default I/O panel size, positioning, labels and close-button placement.

### Icons
- Added glyphs for Water, Lava, Milk, XP, Steam, Cryofluid, Liquified Aetherium and Dark Matter.
- Added generic compact Energy and Liquid icons and a Stack Upgrade icon.
- Added Ascendant Technology StatsCore glyphs for Crit Damage, Crit Chance, Crit Multiplier, Preserving, Ore Yield, Luck, Double Trouble, Triple Trouble, Evasion and Sweeping.
- Added Sneaking, Standing and question-mark glyphs.

---

# UtilityCraft v3.5.0

This update introduces a complete overhaul of machine interfaces, configurable side-based I/O, Recipe Books, major automation improvements, performance improvements, MANY reworks and many QoL changes.

## HIGHLIGHTS
- Completely redesigned machine interfaces.
  - Added a configurable per-side Item, Liquid and Gas (I/O) Input/Output.
  - Added **Recipe Books** to multiple machines.
- Improved automation and cable-network performance.
- Reworked Item and Liquid Pipe systems.
- Reworked Bonsais with better visuals and safer item handling.
- Reworked Way Center and its components wtih safer handling and use.
- Reworked XP Condenser with a new interface and functionality.

---

## BLOCKS
### General
- Added Crushed Blackstone
- Added four levels of Compressed Crushed Blackstone
- Area-based blocks, such as Pedestal with Clock, now show an outline briefly after being placed, indicating the area that will be affected by the block.
  - Using a Wrench, it is possible to show the outline again, for an undefined amount of time.
  - Harvester, Block Breaker and Block Placer are also affected by that.
- Bountiful Crops
  - Crops now support Fortune enchantment.
- Reworked Bonsais:
  - Improved performance by optimizing its model and scripts.
  - Growth time now scales properly based on the used soil.
  - No longer ejects its loot if the container below it is full.

### Generators
- Wind Turbine
  - Basic, Advanced, Expert
    - Decreased maximum altitude multiplier from 3x (300%) to 2x (200%).
  - Ultimate
    - Decreased maximum altitude multiplier from 4x (400%) to 2.5x (250%).

### Machines
- Completely redesigned every machine and generator interface.
  - Added dedicated tabs for:
    - **Information**: A small panel containing useful info about the machine
    - **I/O Configuration**: A dedicated panel for controlling the input and output of items and fluids, replacing the function of the Smart Filter.
    - **Upgrades**: A dedicated panel for upgrade slots.
    - **Recipes**: A new panel including recipes, drops and other possible uses for a machine.
- Machines are now compatible with custom upgrades, such as [Ascendant Technology](https://github.com/DoriosStudios/Ascendant-Technology)'s Hyper Processing Upgrade.
- Machines can now be fully upgraded by interacting with them.
  - While holding a supported upgrade, the player can interact with the machine to apply one upgrade. Interacting while sneaking will apply all upgrades of the same type.
- Autosieve
  - Changed most of its drops and progression line, including resources that weren't used anywhere in the addon.
- Mechanical Hopper
  - Improved its settings form and quick-settings flow.
- Way Center
  - Reworked its funcionality and interface.
    - Balanced teleport cost and added max distance limits.
    - Improved destination handling with a more precise and safer teleportation system.
- XP Condenser
  - Completely Reworked its interface and funcionality.
    - No longer work with forms. Instead, it has a dedicated UI just like any other machine.
    - No longer resets your XP.
    - Now uses a fixed 256.0B tank instead of having four tank slots.

### Transportation
- Added Creative Blocks
  - Creative blocks are used to provide infinite resources for testing and creative purposes.
  - There are three types of creative blocks: **Creative Battery**, **Creative Liquid Tank** and **Creative Gas Tank**.
- Added Gas Pipes
  - Gas pipes are used to transport and extract gases from their containers, such as Gas Tanks.
  - There are five colored gas pipes: **Purple** *(Default)*, **Blue**, **Yellow**, **Red** and **Green**.
    - Just like items and liquids, different colored pipes cannot interfere with each other.
- Added Gas Tanks
  - Gas tanks are used to store gases, such as Steam, used by Heavy Machinery extension to store and control gas flow.
  - There are four levels: Basic, Advanced, Expert and Ultimate.
  - Their capacity are the same as their liquid counterparts, but they are not interchangeable.
- Improved Exporter, Importer and Liquid Extractor interfaces.
- Improved transfer caching and endpoint handling.
- Fixed Item Importer filters repeatedly checking only the first three eligible source slots, preventing matching items in later slots from being transferred.
- Reworked Item Conduits and Fluid Pipes around the new machine I/O system.
  - Exporters and importers respect configured machine faces, preventing items from entering faces that are not input faces.
  - Added native Item Ducts Redux compatibility through DoriosCore.
  - Pipes can now be configured using a Wrench.

## FLUIDS
- Renamed Fluid terminology to Liquid.

## ITEMS
### General
- Added the **Copy/Paste Tool**.
  - Copies and pastes compatible settings from Item Exporters, Liquid and Gas Extractors, Mechanical Hoppers, Droppers, Uppers, machines, generators, and pipes.
  - Sneak + Interact opens a localized menu to choose which Item, Liquid, Gas, filter, and direction settings are copied, switch between Copy and Paste modes, or clear the saved configuration.
  - When direction copying is disabled, machine I/O is rotated relative to the target block so each configured face is preserved correctly.
  - Pasting copied filters requires the target block to have a Filter Upgrade; otherwise, the operation is canceled with a **Missing Filter Upgrade** message.
- Removed unused/paused items and blocks from creative menu.
- Reworked how Accelerator Clocks works:
  - There are now three types of Accelerator Clocks: **Gold**, **Diamond** and **Nether Star**.
  - Gold Accelerator Clock:
    - Replaced the old Accelerator Clock
    - Has a 18% chance to jump forward a crop growth stage.
  - Diamond Accelerator Clock:
    - Has a 50% chance to jump forward a crop growth stage.
  - Nether Star Clock:
    - Will always jump forward a crop growth stage.

### Upgrades
- Removed the Smart Filter Upgrade.

## RECIPES
### General
- Completed and registered the Crafter's built-in recipes, including generators, energy transfer blocks, machines, tanks, utilities, networks, elevators, fishing nets, chips, and upgrades.
- Updated the machine crafting recipe set after removing obsolete features.
- Updated the solid-fuel list and fixed all Compressed Wood tiers so they provide the intended DE values.
- Lowered the Autofisher Heart of the Sea requirement from net tier 6 to tier 5.
- Added Redstone as a Sieve drop from Sand before the larger sieving rework.
- Fixed the Electro Press recipe so Slime now requires 9 Slime Balls instead of 4.
- Changed the Ream of Paper recipe to use 6 Paper.

### Autosieve
- Added Sand Handfuls to Dirt and Grass hammer interactions.
- Added Mud Balls from Mud.
- Added Red Sand Handfuls from Red Sand and Terracotta.
- Completely reworked the sieve and Autosieve resource progression.
  - Added Crushed Blackstone and its compressed variants (Double, Triple and Quadruple).
  - Expanded the progression with Blackstone, Basalt, Calcite, Dripstone, Gilded Blackstone and Tuff Pebbles.
  - Added Geodes, Diamond Shards, Emerald Shards, Shulker Shell Shards, Nether Star Fragments, Totem Shards and Wither Skeleton Skull Shards to the progression.
  - Removed obsolete chunks, handfuls and pebbles, replacing them with a more consistent shard-based progression.
- Updated multiple drop tables.
  - Gravel and Crushed Cobbled Deepslate now produce up to 4 Lapis Lazuli directly; Gravel can also produce Diamond and Emerald Shards.
  - Sand can now produce up to four Redstone per successful roll.
  - Crushed Netherrack now has a 0.5% chance to produce Ender Pearls and no longer drops Gold Nuggets.
  - Crushed Blackstone now has its own exclusive progression, including Blackstone, Basalt and Gilded Blackstone Pebbles; Sulfur Spikes; Gold Nuggets; Magma Cream; and Ancient Debris Chunks.
  - Crushed End Stone now provides Ender Pearls and Shulker Shell Shards at Diamond Mesh tier.
  - Crushed Cobbled Deepslate now produces Geodes, Calcite and Tuff Pebbles, gem shards and direct Lapis Lazuli.
  - Added Ender Pearls to Crushed Cobbled Deepslate at Diamond Mesh tier.
  - Replaced direct Amethyst Shard drops with Geodes.
- Added Crushed Blackstone block definitions, textures, compression and decompression recipes, Crusher recipes by machine tier, Wooden Sieve states, accepted-block support, and normal and compressed Sieve loot tables.
- Removed unused Crushed Deepslate, Crushed Endstone, Crushed Netherrack and Souls Handfuls; Netherrack, Deepslate and Endstone Pebbles; obsolete Diamond, Emerald, Lapis and Redstone Chunks; their Deepslate variants; and all related recipes, definitions, textures, catalog entries and translations.

### Crusher
- Added tons of new recipes for different blocks and items
  - Ores blocks can now be crushed, resulting in their item version.
  - Ores:
    - Iron, Gold, Copper > 2x Raw Dust
    - Diamond, Emerald > 2x Gems
    - Ancient Debris > 2x Netherite Scrap Dust
    - Gold Ore, Gilded Blackstone > 2x Gold Dust
    - Coal Ore > 4x Coal Dust
    - Nether Quartz Ore > 6x Quartz
    - Lapis, Redstone > 8x Base Drop
  - Blocks:
    - Nether Gold, Gilded Blackstone > 2x Gold Dust
    - Clay, Glowstone, Quartz Blocks, Amethyst Blocks, Geodes, Sandstone, Red Sandstone, Bricks, Nether Bricks, Hay Bales, Melons, Snow, leaves, and other reversible materials.
  - Geode > 4x Amethyst Shards
  - Tree Leaves > 2x String

### Electro Press
- Changed normal ore crafting recipes to use 4 Chunks per ore.
- Added ore reconstruction from four Copper, Gold, Iron, Coal, Deepslate, Nether Quartz, Nether Gold, or Ancient Debris chunks.
- Added reconstruction recipes for pebbles, handfuls, fragments, and shards.
- Added compression recipes for Wheat, Clay Balls, Bricks, Nether Bricks, Glowstone Dust, Quartz, Amethyst, Snowballs, and Sulfur.
- Added reconstruction recipes for Nether Stars, Shulker Shells, Totems of Undying, and Wither Skeleton Skulls.
- Changed Diamond and Emerald reconstruction recipes from 9 to 4 Shards.
- Added 4 Sulfur Spikes > 1 Sulfur Block.

### Infuser
- Added separate Coal Dust and Charcoal Dust routes for Steel Ingots and Steel Dust.
- Added Brute Steel recipes using Raw Iron with Coal, Coal Dust, Charcoal, or Charcoal Dust.
- Added recipes for Eyes of Ender, Magma Cream, Golden Carrots, Golden Apples, and Glistering Melon Slices.
- Added recipes for Red Sand, Cinnabar, Warped Nylium, Crimson Nylium, Sculk, Gilded Blackstone, Podzol, Mycelium, Rooted Dirt, and Compressed Netherrack.
  - Carrot + Gold Dust > Golden Carrot
  - Apple + 4 Gold Dust > Golden Apple
  - Melon Slice + Gold Dust > Glistering Melon Slice
  - Grass Block + Spruce Sapling > Podzol
  - Grass Block + Red or Brown Mushroom > Mycelium
- Changed the Crying Obsidian recipe to consume eight Obsidian and produce eight Crying Obsidian.
- Removed outdated or duplicate Infuser routes, including the old Raw Energized Iron Dust route.

### Recipe Books
- Added additional Infuser recipes.
- Added additional Electro Press recipes.
- Improved recipe navigation.
- Removed the Grass Block recipe from Infuser.

## UI/UX
- Completely redesigned machine and generators interfaces.
  - Machine/Generator slots now have **outlines**, indicating the slot's function based on the following criteria:
    - Blue: Input and Fuel
    - Cyan: Complementary Input, such as Soil, Mesh, Blueprint, Coolant and/or Catalyst.
    - Red: Output.
  - Machines and Generators now have a built-in info panel, which usually includes information about its function, capacity and upgrades supported.- Reworked the XP Condenser interface.
  - Some machines now include a **Recipe Book**, which displays recipes, drops, and other useful information. Supported machines:
    - Autosieve: Siftable blocks, required mesh, drop chances, and drop amounts.
    - Autofisher: Required net, drop chances, and drop amounts.
    - Crusher: Recipes, output chances, and output amounts.
    - Electro Press: Recipes and output amounts.
    - Infuser: Recipes, prerequisites, success chances, and output amounts.
    - Magmatic Chamber: Smeltable blocks and their output amounts.
    - Seed Synthesizer: Plantable items, tiers, required tier, and output amounts.
    > Extensions can also add their own Recipe Book pages for seamless integration.
- Simplified transfer menus.
- Improved Quick Settings for Exporters and Importers.
- Updated Copper, Gold and Iron Dust to use the preferred textures and removed duplicate Raw Copper, Raw Gold and Raw Iron Dust textures.
- Reorganized Crusher, Electro Press and Infuser recipe interfaces.
  - Items are displayed before blocks.
  - Recipes are grouped by type and output.
  - Recipes with the same output and quantity share flipbook inputs.
  - Removed empty spaces from recipe grids.
- Corrected vanilla texture paths used by recipe interfaces.
- Added/Updated translations for:
  - English
  - Portuguese (Brazil)
  - Portuguese (Portugal)
  - Spanish (Spain)
  - Spanish (Mexico)

## DOCUMENTATION AND VALIDATION
- Updated How to Play progression text, Sieve drop tables and mesh tiers, the Crushed Blackstone drop table, contextual Hammer drop information, Crusher and Electro Press descriptions, and UtilityCraft guide renders.
- Updated item catalogs, texture atlases, translations and block registrations.
- Validated all modified JavaScript and JSON files, Recipe UI grids and panel references, and that no references to removed items remain.

## BUG FIXES
- Fixed Bonsais dropping items when connected storage was full.
- Fixed Asphalt textures.
- Fixed Asphalt mining behavior.
- Fixed the Basic Sieve failing after the expanded input list exceeded a single block-state enum.
- Fixed compressed wood fuel behavior.
- Fixed upgrade messages displaying internal identifiers.
- Fixed Wind Turbine rate text showing interval output instead of actual per-tick output.
- Fixed Way Center destination duplication, missing destinations, unsafe teleports, blocked destinations, and broken legacy data handling.
- Fixed XP Condenser level math, partial XP progress, storage overflow, and failed-transfer rollback.
- Fixed every Compressed Wood tier being detected incorrectly as Furnator fuel.
- Fixed recipe UI output slots, separators, layers, toggles, hover states, and panel alignment.
- Fixed several malformed JSON files and pack dependency declarations.
- Fixed the Harvester, Block Breaker, and Block Placer working on the wrong face.

## TECHNICAL CHANGES
> [!NOTE]
> If you're a player, there's no need to go further.
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
- Reduced unused block permutations in machines, networks, Bonsais, Cobblestone Generators, Mechanical Spawners, Creative Tanks, and Asphalt.
- Optimized cable rescans, transfers, caching, and scheduled work.
- Optimized Bonsai models and runtime processing.
- Normalized script filenames, imports, texture names, models, entity definitions, UI assets, and folder structure.
- Added documentation for the normalized Resource Pack texture structure.
- Removed duplicated and unused assets.
