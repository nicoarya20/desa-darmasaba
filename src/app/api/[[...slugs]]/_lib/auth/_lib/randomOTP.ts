export function randomOTP() {
  const random = Math.floor(Math.random() * (9000 - 1000 )) + 1000
  return random;
}