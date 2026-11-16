// Cordis inject declarations have only required dependencies. Optional board
// capabilities therefore live in child injections, not one-time presence probes.
// Children wait without blocking the board, activate when a service arrives,
// and dispose/re-register their contributions when that service is replaced.

/** Register a tool for the lifetime of the host tool registry, if available. */
export function registerToolIfSupported(ctx, definition) {
  ctx.inject(['tools'], child => child.effect(() => child.tools.register(definition)));
}

/** Register instruction text for the lifetime of the host prompt registry. */
export function addPromptIfSupported(ctx, section) {
  ctx.inject(['systemPrompt'], child => child.systemPrompt.section(section));
}
