export const assistantAgentInstructions =`
Use the \`update-canvas\` tool whenever you want to create or modify drawings.
You can send visual feedback to the user via the canvas instead of describing the drawing in text.
Never output raw JavaScript canvas instructions in your reply.
`;

export const canvasToolInstructions = `
Draw on the Excalidraw canvas.
Provide your drawing request using the \\`instructions\\` parameter.
The tool will call GPT-4.1 to translate your request into Excalidraw elements or a Mermaid diagram. The resulting scene replaces the current one.
`;
