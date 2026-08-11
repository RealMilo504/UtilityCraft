# Compressed Blocks Tool

Use `manage_compressed_blocks.mjs` to add four-level compressed block families without manually duplicating assets and registrations.

## Add families

1. Place each 16×16 base texture inside UtilityCraft, normally under `tools/input_textures/`.
2. Add one object per family to `tools/data/compressed_blocks.json`.
3. Run `npm run generate:compressed`.
4. Run `npm run audit:compressed`.

Example definition:

```json
{
  "key": "basalt",
  "source_item": "minecraft:basalt",
  "base_texture": "tools/input_textures/basalt.png",
  "texture_stem": "basalt",
  "type": "stone",
  "names": {
    "en_US": [
      "Compressed Basalt",
      "Double Compressed Basalt",
      "Triple Compressed Basalt",
      "Quadruple Compressed Basalt"
    ],
    "es_MX": [
      "Basalto Comprimido",
      "Basalto Doblemente Comprimido",
      "Basalto Triplemente Comprimido",
      "Basalto Cuádruplemente Comprimido"
    ]
  }
}
```

`key` controls the block identifiers. `texture_stem` controls only the PNG filenames and defaults to `key` without a trailing `_block`. `type` selects the render method, mining speeds, tags, redstone conductivity and sound from the presets in the same data file.

Each preset may define `geometry`; when omitted, the generator uses `minecraft:geometry.full_block`. The `glass` preset is the intentional exception: it uses `geometry.utilitycraft_glass` with the shared `utilitycraft:glass` culling rule so adjacent faces of the same glass block are hidden. Each compressed texture is created by alpha-compositing its 16?16 base texture with the matching `compressed_overlay/level_1.png` through `level_4.png`. Multi-face source blocks should provide a representative 16?16 side texture for their compressed family.

The generator creates four PNGs, four block JSON files, four compression recipes, four decompression recipes, terrain-atlas entries, catalog entries, sounds and localization entries. Missing locales use the complete `en_US` names as an explicit fallback.

Use `npm run generate:compressed -- --check` in validation workflows to detect generated-file drift without writing. Use repeated `--only <key>` arguments to limit generation to selected families.

The nine-level legacy cobblestone family is intentionally outside this generator.
