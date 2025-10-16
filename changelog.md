# UtilityCraft 3.2 | Detailed Changelog
---
## BLOCKS

- Reworked Coal Blocks:
  - Added a new Charcoal Block and four levels of Compressed Charcoal Blocks.
  - Updated Blaze Core format and mining properties.
  - Implemented fuel behavior for Coal, Charcoal and Blaze Core block family. These blocks can now be used in any furnace.
- Reworked Sieving System:
  - Added Copper Mesh and defined Mesh Tiers.
  - Sieve Drops now scale by tier (e.g., Diamond requires at least Iron Mesh).
  - Netherite Mesh no longer drops Flint.
  - Updated mesh multipliers for balance.
  - Added the `utilitycraft:mesh` component to items to create custom meshes
    > Note: Custom meshes won't work with the basic sieve

The meshes individual stats are:
    
 | **Mesh**  | **Tier** | **Multiplier** | **Flint?** |
 |-----------|----------|----------------|------------|
 | String    | 0        | 1x             | Yes        |
 | Flint     | 1        | 1.2x           | Yes        |
 | Copper    | 2        | 1.5x           | Yes        | 
 | Iron      | 3        | 1.75x          | Yes        |
 | Gold      | 4        | 2x             | Yes        |
 | Emerald   | 5        | 2.5x           | Yes        |
 | Diamond   | 6        | 3x             | Yes        |
 | Netherite | 7        | 4x             | No         |
  > - **Mesh**: The mesh type. The more expensive, the better.
  > - **Tier**: The mesh tier. The bigger it is, the more new resources appear.
  > - **Multiplier**: The drop chance multiplier. Increases the chance of multiple resources appearing.
  > - **Flint?**: If it drops flint.
- Reworked Mob Grinder
  - Mob Grinders can now be upgraded
  - Added Damage Upgrade to increased the inflicted damage
  - Added Range Upgrade to extened the grinder's area of effect
  - Added ability to toggle the block on/off
  - It can no longer incflict damage on inanimate entities
  - Changed its texture
> [!WARNING]
> The block does not drop its upgrades after destroyed. This is a bug.

- Autosieve
  - Increased autosieve process cost from 3.2 kDE to 6.4 kDE
- Induction Anvil
  - Increased rate speed to 25 DE/t
- Infuser
  - Increased process cost from 800 DE to 1.6 kDE
  - Increased base rate speed from 20 DE/t to 40 DE/t
- Mechanical Hopper, Upper & Dropper
  - Now increases transfer speed instead of items per transfer.
  > This change also affects the Ender Dropper.
- Seed Synthesizer
  - Better soil no longer increases speed. It now multiplies the yield instead
- Updated machines UI
  - Moved energy bar to the side
  - Added screen to display warnings and information
  - Added a side upgrades bar
- General:
  - Updated breaking times for most blocks.
  - Proper tool requirements for breaking blocks applied (e.g., Compressed Dirt requires Shovel, Machines requires Pickaxe…).
  - Added descriptions for machines, listing supported upgrades.
  - Added descriptions for special blocks to improve understanding.
  - Updated display translations across multiple languages.
  - Upgrades are now added manually in the UI

---
## ITEMS

- New Item & Component Integrations:
  - Drills: introduced `utilitycraft:drill` component.
  - Knives: introduced `utilitycraft:block_loot` component, allowing extra loot definitions for blocks.
  - Hammers: introduced `utilitycraft:hammer` component.
  - Tools under `utilitycraft:` namespace now correctly support durability.

---
## BUG FIXES

  - Tools no longer get stuck after repaired in Induction Anvil
  - Mangrove Sapling now drops correctly when sieving Dirt and Compressed Dirt.
  - Compressed Dirt now drops a wider variety of saplings (previously limited to Oak and Cherry due to a bug).
  - Slime Block recipe on the Electro Press fixed.
  - Some missing translations now display correctly in Spanish and Portuguese.
  - Corrected missing item and block names.

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
