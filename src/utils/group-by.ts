export const groupBy = <T, K extends string | number | symbol>(
  array: Array<T>,
  iteratee: (item: T) => K
): Record<K, Array<T>> =>
  array.reduce(
    (acc, curr) => {
      const key = iteratee(curr);
      return (acc[key] || (acc[key] = [])).push(curr), acc;
    },
    {} as Record<K, Array<T>>
  );
