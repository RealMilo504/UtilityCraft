export function setQuality(block) {
    if (block.permutation.getState('utilitycraft:refreshSpeed') != 20) {
        block.setPermutation(block.permutation.withState('utilitycraft:refreshSpeed', 20))
    }
}

export const refreshSpeed = 20