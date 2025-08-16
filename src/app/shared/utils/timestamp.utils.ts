import { Timestamp } from "firebase/firestore";

  export function isTimestampPlain(obj: any): obj is { seconds: number; nanoseconds: number } {
    return obj && typeof obj.seconds === 'number' && typeof obj.nanoseconds === 'number';
  }
  export function normalizeFirestoreDate(value: any): Date {
    if (value instanceof Timestamp) return value.toDate();
    if (isTimestampPlain(value)) {
      return new Timestamp(value.seconds, value.nanoseconds).toDate();
    }
    if (value instanceof Date) return value;
    return new Date();
  }