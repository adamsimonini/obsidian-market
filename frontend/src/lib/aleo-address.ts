// Bech32m character set (excludes 1, b, i, o)
const BECH32M_CHARS = '023456789acdefghjklmnpqrstuvwxyz';
const ALEO_ADDR_RE = new RegExp(`^aleo1[${BECH32M_CHARS}]{58}$`);

/** Validate an Aleo wallet address format (aleo1… , 63 chars, bech32m). */
export function isValidAleoAddress(addr: string): boolean {
  return ALEO_ADDR_RE.test(addr);
}
