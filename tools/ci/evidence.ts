// Callable bootstrap interface. The evidence evaluator has not been implemented.
export function assessReport(_input: unknown) {
  return { state: 'unknown', reason_codes: ['implementation_not_available'] };
}

export function assessAggregate(_input: unknown) {
  return { state: 'unknown', reason_codes: ['implementation_not_available'] };
}
