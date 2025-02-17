import { namedMonthToYYYYMM } from "./dates";

export type InflationMeasure = "cpi" | "cpih" | "rpi";

const seriesIds: Record<InflationMeasure, string> = {
  cpi: "d7bt",
  cpih: "l522",
  rpi: "chaw",
};

const dataUrl = (measure: InflationMeasure): string =>
  `https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/${seriesIds[measure]}/mm23/data`;

export type InflationStats = {
  max: string;
  min: string;
  _stats: Map<string, number>;
};

type DataPoint = {
  date: string;
  value: string;
  label: string;
  year: string;
  month: string;
  quarter: string;
  sourceDataset: "MM23";
  updateDate: string;
};

type DataResponse = {
  years: DataPoint[];
  quarters: DataPoint[];
  months: DataPoint[];
  [key: string]: any;
};

const yyyymm = (p: DataPoint): string => namedMonthToYYYYMM(p.year, p.month);

export const getInflationStats = async (
  measure: InflationMeasure
): Promise<InflationStats> => {
  const res = await fetch(dataUrl(measure));
  const data: DataResponse = await res.json();
  const stats = data.months.reduce(
    (stats, p) => stats.set(yyyymm(p), Number(p.value)),
    new Map<string, number>()
  );
  const months = Array.from(stats.keys() ?? []);
  const orderedMonths = months.toSorted();
  return {
    max: orderedMonths[orderedMonths.length - 1],
    min: orderedMonths[0],
    _stats: stats,
  };
};

export const inflationGetter =
  (stats?: InflationStats) =>
  (start: string, end: string): number => {
    console.log(stats);
    return stats
      ? 100 *
          ((stats._stats.get(end) ?? 0) / (stats._stats.get(start) ?? 1) - 1.0)
      : 0;
  };
