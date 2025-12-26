export const withKeys = <T>(data: T[]): (T & { key: number })[] => {
  return data.map((item, index) => ({
    ...item,
    key: index,
  }));
};
