import { randomInt } from "crypto";

export function randomOTP() {
  return randomInt(1000, 10000);
}