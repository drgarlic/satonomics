// import { ONE_DAY_IN_MS } from "./time";

export const dateToString = (date: Date) => date.toJSON().split("T")[0];

// export const FIVE_MONTHS_IN_DAYS = 30 * 5;

// export const computeNumberOfDaysBetweenTwoDates = (
//   firstDate: Date,
//   secondDate: Date,
// ) =>
//   Math.round(
//     Math.abs((firstDate.valueOf() - secondDate.valueOf()) / ONE_DAY_IN_MS),
//   );
