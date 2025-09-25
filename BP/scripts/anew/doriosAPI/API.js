import { system, world, BlockCustomComponent, ItemCustomComponent } from '@minecraft/server';
const NAMESPACE = 'utilitycraft'

globalThis.DoriosAPI = {
    register: {
        /**
         * Registers a custom block component into the block component registry.
         * 
         * Runs only after the world has loaded.
         * 
         * Automatically prefixes the component identifier with the namespace `"utilitycraft"`.
         *
         * @param {string} id Identifier for the component (e.g., "machine" → "utilitycraft:machine").
         * @param {BlockCustomComponent} handlers Lifecycle callbacks for the block.
         */
        blockComponent(id, handlers) {
            world.afterEvents.worldLoad.subscribe(() => {
                system.beforeEvents.startup.subscribe(e => {
                    const { blockComponentRegistry } = e;

                    blockComponentRegistry.registerCustomComponent(
                        NAMESPACE + ':' + id,
                        handlers
                    );
                });
            });
        },

        /**
         * Registers a custom item component into the item component registry.
         * 
         * Runs only after the world has loaded.
         * 
         * Automatically prefixes the component identifier with the namespace `"utilitycraft"`.
         *
         * @param {string} id Identifier for the component (e.g., "weapon" → "utilitycraft:weapon").
         * @param {ItemCustomComponent} handlers Lifecycle callbacks for the item.
         */
        itemComponent(id, handlers) {
            world.afterEvents.worldLoad.subscribe(() => {
                system.beforeEvents.startup.subscribe(e => {
                    const { itemComponentRegistry } = e;

                    itemComponentRegistry.registerCustomComponent(
                        NAMESPACE + ':' + id,
                        handlers
                    );
                });
            });
        }
    },
    utils: {

    }
}

