/**
 * @tgwf/co2 ships no type declarations, so `astro check` rejects the import.
 * Only the surface actually used is declared, rather than `any` for the whole
 * module: a wrong argument order to perByte would otherwise pass silently, and
 * this figure is published as our carbon footprint.
 */
declare module '@tgwf/co2' {
  export class co2 {
    constructor(options?: { model?: 'swd' | '1byte'; results?: 'segment' });
    /** Grams of CO2 for a number of bytes. `green` marks a renewable host. */
    perByte(bytes: number, green?: boolean): number;
    /** Grams of CO2 for a visit, accounting for returning-visitor caching. */
    perVisit(bytes: number, green?: boolean): number;
  }
}
