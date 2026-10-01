/** The flag of a province: a committed copy served from our own site (see scripts/gen-province-flags.mjs). */
export const provinceFlagUrl = (code: string) => `flags-nl/${code.toLowerCase()}.svg`;
