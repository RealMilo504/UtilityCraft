export function setQuality(block) {
    if (block.permutation.getState('twm:refreshSpeed') != 10) {
        block.setPermutation(block.permutation.withState('twm:refreshSpeed', 10))
    }
}

export const refreshSpeed = 10