import type { CloudEventsContext } from "./interface.ts";

export function isBinaryCloudEvent(headers: Headers): boolean {
  return (
    headers.has('ce-type') &&
    headers.has('ce-specversion') &&
    headers.has('ce-source') &&
    headers.has('ce-id')
  );
}

export function getBinaryCloudEventContext(headers: Headers): CloudEventsContext {
  const context: CloudEventsContext = {};
  for (const [key, value] of headers) {
    if (key.startsWith('ce-')) {
      const attributeName = key.substr(
        'ce-'.length
      ) as keyof CloudEventsContext;
      context[attributeName] = value;
    }
  }
  return context;
}