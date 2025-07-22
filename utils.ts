/**
 * Converts an enum to a PostgreSQL enum.
 * @template T - The enum type.
 * @param {T} myEnum - The enum to convert.
 * @returns {[T[keyof T], ...T[keyof T][]]} An array containing the enum values as strings.
 */
export function enumToPgEnum<T extends Record<string, unknown>>(
    myEnum: T
  ): [T[keyof T], ...T[keyof T][]] {
    return Object.values(myEnum).map((value: unknown) => `${value}`) as [
      T[keyof T],
      ...T[keyof T][]
    ];
  }

/**
 * Helper function for enum values with strict typing
 * @template T - The enum type.
 * @param {T} enumType - The enum to get the values of.
 * @returns {T['enumValues'][number][]} An array containing the enum values as strings.
 */
export const getEnumValues = <T extends { enumValues: readonly string[] }>(
enumType: T
): T['enumValues'][number][] =>
Array.from(enumType.enumValues) as T['enumValues'][number][];

/**
 * Get the values of an enum as an array.
 * @param enumType - The enum to get the values of.
 * @returns {T[]} An array containing the enum values.
 */
export const getArrayFromEnum = <T extends Record<string, unknown>>(
enumType: T
) => {
return Object.values(enumType) as T[keyof T][];
};

export type TableInsert<T> = T extends { $inferInsert: infer U } ? U : never;

export type TableSelect<T> = T extends { $inferSelect: infer U } ? U : never;
