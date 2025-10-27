# UtilityCraft 3.2 | Full Changelog
---
## BLOCKS
### General
- Updated machines UI
  - Moved energy bar to the side
  - Added screen to display warnings and information
  - Added a side upgrades bar
- Updated breaking times for most blocks.
- Proper tool requirements for breaking blocks applied (e.g., Compressed Dirt requires Shovel, Machines requires Pickaxe…)
- Added descriptions for machines, listing supported upgrades.
- Added descriptions for special blocks to improve understanding.
- Updated display translations across multiple languages.
- Upgrades are now added manually in the machine UI
- Improved menu of Fluid Extractors and Item Exporters
- Added liquid bars to XP and Milk
### Generators 
- Added Wind Turbine
  - It's a passive generator
  - Its base speed is 8 DE/t (compared to the Solar Panel, which has 12 DE/t)
  - The Wind Turbine gets stronger or weaker depending on the height.
  - The base height is 64 (sea level)
    - Every 10 blocks above y64, the Wind Turbine becomes 10% more efficient.
    - Every 8 blocks below y64, the Wind Turbine becomes 20% less efficient, ceasing to function completely at y20
    - All versions of the Wind Turbine have twice the capacity of a Solar Panel of the same level. 
- Furnator
  - Furnator now shows remaining burn time for the current fuel
  - Displays the total energy output of each fuel type
- Solar Panel
  - Displays the current in-game time  
  - Generation is affected by efficiency  
  - Operates from 23000(-1000) to 13000 ticks, peaking at 6000
  - Its rate was reduced by 40%
- Magmator
  - Displays remaining fuel time
- Thermo Generator
  - Displays heat source multiplier
- Added Transfer methods to Energy, Items and Fluids (Farthest, Nearest, Round)
- Use Wrench to open the Transfer Menu
### Machines
- Reworked Sieving System:
  - Added Mesh Tiers.
  - Sieve Drops now scale by tier (e.g., Diamond requires at least Iron Mesh).
  - Netherite Mesh no longer drops Flint.
  - Updated mesh multipliers for balance purposes.
  - Added the `utilitycraft:mesh` component to items to create custom meshes
> Note: Custom meshes won't work with the basic sieve
- Added Copper Cobblestone Generator
  - Produces 1 cobblestone every 4 seconds (0.25/s)
  - It is now the first tier of Cobblestone Generator. Cobble Gens now have 6 tiers.
- Autosieve
  - Increased autosieve process cost from 3.2 kDE to 6.4 kDE
- Induction Anvil
  - Increased rate speed to 25 DE/t
- Infuser
  - Increased process cost from 800 DE to 1.6 kDE
  - Increased base rate speed from 20 DE/t to 40 DE/t
- Seed Synthesizer
  - Better soil no longer increases speed. It now multiplies the yield instead
### Transportation
- Mechanical Hopper, Upper & Dropper
  - Now increases transfer speed instead of items per transfer.
- Ender Hopper
  - Now accepts Speed and Filter upgrades.
### Mob Grinding
- Reworked Mob Grinder
  - Mob Grinders can now be upgraded
  - Added Damage Upgrade to increased the inflicted damage
  - Added Range Upgrade to extend the grinder's area of effect
  - Added ability to toggle the block on/off
  - It can no longer inflict damage on inanimate entities
### Misc
- Reworked Coal Blocks:
  - Added a new Charcoal Block and four levels of Compressed Charcoal Blocks.
  - Updated Blaze Core format and mining properties.
  - Implemented fuel behavior for Coal, Charcoal and Blaze Core block family. These blocks can now be used in any furnace.

---
## ITEMS
### General
- Tools now correctly support durability.
- Reorganized items in the Creative menu.
### Tools
- Added Steel tools, including AiOT, Hammer and Paxel
- Added Copper AiOT, Hammer and Paxel
### Items
- Added Copper Mesh
- Added Compressed Items
- Removed (Custom) Copper Nugget
### Misc
- Wrench
  - Now rotates around its current facing instead of switching it (from 6 to 24 orientations)
- Minecarts with blocks (TNT, Chest, Hopper) can now be uncrafted

---
## BUG FIXES

- Fixed sand getting stuck while multi-sieving
- Fixed item conduit recipe
- Fixed being able to compress Stone using Andesite, Diorite, or Granite.
- Fixed AiOTs not being able to mine cobwebs properly.  
- Fixed a bug that caused repaired tools to get stuck after being repaired in the Induction Anvil.  
- Fixed Mangrove Saplings not dropping correctly when sieving Dirt or Compressed Dirt.  
- Fixed Compressed Dirt dropping only Oak and Cherry Saplings.  
- Fixed the Slime Block recipe in the Electro Press.  
- Fixed missing translations in Spanish and Portuguese.  
- Fixed missing item and block names.

---
## TECHNICAL CHANGES

  - Smelting Pickaxe code reworked.
  - AiOTs code reworked.
  - Dig Pebbles feature reworked.
  - Stack Refill feature reworked.
  - Bountiful Crops and Bonsais reworked.
  - Crucible code reworked.
  - Cobblestone Generators code reworked.
  - Antidote Potion reworked.
  - Guide Book improvements (still pending optimization).
  - Lantern and Big Torch code reworked.
  - Reworked the following "On Interact" Blocks: Tractor, Drill, Sink, Pedestal.
  - Asphalt and Elevator code reworked.
  - Essences (Refill) system reworked.
  - XP Magnet code reworked.
  - XP Spout & Drain reworked.
  - Crusher code reworked.
  - Electro Press code reworked.
  - Incinerator code reworked.
  - Block Breaker/Placer codes reworked.
  - Changed Rate Speed Settings of the Addon:
    - Super Fast → 2 ticks
    - Fast → 4 ticks
    - Normal → 10 ticks
    - Slow → 20 ticks
    - Super Slow → 40 ticks
    - Default → 20 ticks

---
## TEXTURES

- Changed AIOTs Item textures.
- Changed the texture of the Mob Grinder from a flat gray to a vibrant Gray with Red; Also added blades to it.
- Changed Copper tools textures. 
