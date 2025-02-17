const months = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

export const namedMonthToYYYYMM = (year: string, month: string): string =>
  `${year}-${months[month.toLowerCase() as keyof typeof months]
    .toString()
    .padStart(2, "0")}`;

const YYYYMM = (year: number, month: number): string =>
  `${year}-${month.toString().padStart(2, "0")}`;

const fromYYYYMM = (yyyymm: string): [number, number] => {
  const [y, m] = yyyymm.split("-");
  return [Number(y), Number(m)];
};

const transform =
  <T extends unknown[]>(
    f: (...args: T) => (y: number, m: number) => [number, number]
  ) =>
  (yyyymm: string, ...args: T) =>
    YYYYMM(...f(...args)(...fromYYYYMM(yyyymm)));

export const addYears = transform((diff: number) => (y, m) => [y + diff, m]);

export const addMonths = transform((diff: number) => (y, m) => {
  const mdiff = 12 * y + (m - 1) + diff;
  return [Math.floor(mdiff / 12), 1 + (mdiff % 12)];
});
