export const isArrayOfArrays = <T>(value: unknown): value is T[][] =>
  Array.isArray(value) && value.every(Array.isArray);
