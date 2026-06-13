import type { SlotConfig, ValidationFinding } from "../types/index.js";

export default function validateEventSchedule(
  config: SlotConfig,
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const events = config.event_schedule;

  const seenIds = new Set<string>();

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const prefix = `event_schedule[${i}]`;

    if (seenIds.has(event.event_id)) {
      findings.push({
        severity: "error",
        field: `${prefix}.event_id`,
        message: `Duplicate event_id "${event.event_id}" at index ${i}.`,
      });
    }
    seenIds.add(event.event_id);

    const start = Date.parse(event.start_date);
    const end = Date.parse(event.end_date);

    if (isNaN(start)) {
      findings.push({
        severity: "error",
        field: `${prefix}.start_date`,
        message: `Invalid start_date "${event.start_date}" — must be a valid ISO 8601 date.`,
      });
    }

    if (isNaN(end)) {
      findings.push({
        severity: "error",
        field: `${prefix}.end_date`,
        message: `Invalid end_date "${event.end_date}" — must be a valid ISO 8601 date.`,
      });
    }

    if (!isNaN(start) && !isNaN(end) && end <= start) {
      findings.push({
        severity: "error",
        field: `${prefix}.end_date`,
        message: `end_date must be after start_date for event "${event.event_id}".`,
      });
    }
  }

  return findings;
}
