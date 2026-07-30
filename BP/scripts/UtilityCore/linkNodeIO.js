import { openLinkNodeIOForm } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.blockComponent("utilitycraft:link_node_io", {
  onPlayerInteract({ block, player }) {
    if (!block || !player) return;
    void openLinkNodeIOForm(block, player);
  },
});
