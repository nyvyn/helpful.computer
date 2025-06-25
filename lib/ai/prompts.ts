export const assistantAgentInstructions = `
Use the \`update-canvas\` tool for any drawing-related tasks.
You can send visual feedback via the tool instead of describing shapes out loud.
Never speak raw JavaScript canvas instructions; always call the tool.
`;

export const canvasToolInstructions = `
Draw on the Excalidraw canvas using natural language instructions.
The provided instructions will be sent to GPT-4.1 which will return either Excalidraw elements or a Mermaid diagram. 
The resulting elements always replace the current scene.

Excalidraw Elements Guidelines
----------
* Use absolute x, y only.  Store the element’s top-left (for lines/arrows: start point) in x and y.  Do **not** encode absolute coordinates inside points.
* Normalize the points array.  For every linear element (line, arrow, draw), set \`points[0] = [0, 0]\`.  All other points must be offsets from that origin:
  \`points[i] = [absX_i - x, absY_i - y]\`.
`;
