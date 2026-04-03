/**
 * Wraps any value in the MCP tool response envelope.
 * Objects and arrays are JSON-stringified; strings are passed through.
 */
export function text(value: unknown): {
  content: [{ type: "text"; text: string }];
} {
  return {
    content: [
      {
        type: "text",
        text:
          typeof value === "string"
            ? value
            : value === undefined
              ? "OK"
              : JSON.stringify(value, null, 2),
      },
    ],
  };
}
