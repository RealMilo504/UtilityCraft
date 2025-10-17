# UtilityCraft 3.2 | Full Changelog
---
## BLOCKS
### General
- Updated machines UI
  - Moved energy bar to the side
  - Added screen to display warnings and information
  - Added a side upgrades bar
- Updated breaking times for most blocks.
- Proper tool requirements for breaking blocks applied (e.g., Compressed Dirt requires Shovel, Machines requires Pickaxe…).
- Added descriptions for machines, listing supported upgrades.
- Added descriptions for special blocks to improve understanding.
- Updated display translations across multiple languages.
- Upgrades are now added manually in the machine UI
### Generators
- Furnator
  - Furnator now shows remaining burn time for the current fuel
  - Displays the total energy output of each fuel type
- Solar Panel
  - Displays the current in-game time  
  - Generation is affected by efficiency  
  - Operates from 23000(-1000) to 13000 ticks, peaking at 6000
- Magmator
  - Displays remaining fuel time
- Thermo Generator
  - Displays heat source multiplier
### Machines
- Reworked Sieving System:
  - Added Mesh Tiers.
  - Sieve Drops now scale by tier (e.g., Diamond requires at least Iron Mesh).
  - Netherite Mesh no longer drops Flint.
  - Updated mesh multipliers for balance purposes.
  - Added the `utilitycraft:mesh` component to items to create custom meshes
> [!NOTE]
> Custom meshes won't work with the basic sieve
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
  - Added Range Upgrade to extened the grinder's area of effect
  - Added ability to toggle the block on/off
  - It can no longer incflict damage on inanimate entities
  - Changed its texture for better representation
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
- Removed Copper Nugget
### Misc
-

---
## BUG FIXES

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
    > (requires testing, no tank support yet).
  - Crusher code reworked.
  - Electro Press code reworked.
  - Incinerator code reworked.
  - Block Breaker/Placer codes reworked.
  > Honestly, everything was reworked since we moved from Old Custom Components to Custom Components V2.
