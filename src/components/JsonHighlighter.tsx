import { useEffect, useState, useRef, type ReactNode } from "react";
import * as TreeSitter from "web-tree-sitter";

// Use type-only imports for types, while keeping TreeSitter for values
import type { Parser as ParserType, Node } from "web-tree-sitter";

const { Parser, Language } = TreeSitter;

interface JsonHighlighterProps {
  data: any;
}

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export function JsonHighlighter({ data }: JsonHighlighterProps) {
  const jsonString = JSON.stringify(data, null, 2);
  const [highlightedHtml, setHighlightedHtml] = useState<ReactNode>(
    <span className="opacity-50">{jsonString}</span>,
  );
  const parserRef = useRef<ParserType | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initParser() {
      try {
        if (!isInitialized) {
          if (!initPromise) {
            initPromise = Parser.init({
              locateFile(scriptName: string) {
                return `/${scriptName}`;
              },
            });
          }
          await initPromise;
          isInitialized = true;
        }

        const JSON_LANG = await Language.load("/tree-sitter-json.wasm");
        const parser = new Parser();
        parser.setLanguage(JSON_LANG);

        if (isMounted) {
          parserRef.current = parser;
          renderJson(parser);
        }
      } catch (e) {
        console.error("Failed to initialize tree-sitter:", e);
        if (isMounted) {
          setHighlightedHtml(<span>{jsonString}</span>);
        }
      }
    }

    function renderJson(parser: ParserType) {
      try {
        const tree = parser.parse(jsonString);
        if (!tree) {
          setHighlightedHtml(<span>{jsonString}</span>);
          return;
        }

        const elements: ReactNode[] = [];
        let lastIndex = 0;

        const MAX_NODES = 5000;
        let nodeCount = 0;

        function traverse(node: Node) {
          if (nodeCount > MAX_NODES) return;
          nodeCount++;

          if (node.childCount === 0) {
            const text = jsonString.substring(node.startIndex, node.endIndex);
            const className = getClassName(node);

            if (node.startIndex > lastIndex) {
              elements.push(
                <span key={`ws-${lastIndex}`}>
                  {jsonString.substring(lastIndex, node.startIndex)}
                </span>,
              );
            }

            elements.push(
              <span key={`${node.id}-${node.startIndex}`} className={className}>
                {text}
              </span>,
            );
            lastIndex = node.endIndex;
          } else {
            for (let i = 0; i < node.childCount; i++) {
              traverse(node.child(i)!);
            }
          }
        }

        traverse(tree.rootNode);

        if (lastIndex < jsonString.length) {
          elements.push(<span key="ws-end">{jsonString.substring(lastIndex)}</span>);
        }

        if (isMounted) {
          setHighlightedHtml(elements);
        }
      } catch (err) {
        console.error("Error during JSON parsing:", err);
        if (isMounted) {
          setHighlightedHtml(<span>{jsonString}</span>);
        }
      }
    }

    if (!parserRef.current) {
      void initParser();
    } else {
      renderJson(parserRef.current);
    }

    return () => {
      isMounted = false;
    };
  }, [data, jsonString]);

  function getClassName(node: Node): string {
    const type = node.type;
    const parentType = node.parent?.type;

    if (
      type === '"' ||
      type === "{" ||
      type === "}" ||
      type === "[" ||
      type === "]" ||
      type === ":" ||
      type === ","
    ) {
      return "text-gray-500";
    }

    if (parentType === "pair" && node.parent?.firstChild === node) {
      return "text-sky-400 font-medium"; // Key
    }

    switch (type) {
      case "string_content":
        return "text-emerald-400";
      case "number":
        return "text-amber-400";
      case "true":
      case "false":
      case "null":
        return "text-violet-400 font-bold";
      default:
        return "text-gray-200";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-sans">
        <span>JSON SYNTAX HIGHLIGHTER</span>
        {!parserRef.current && (
          <span className="animate-pulse text-sky-400">Loading parser...</span>
        )}
      </div>
      <pre className="bg-[#0d1117] text-gray-200 p-4 rounded-lg overflow-auto max-h-[600px] text-[11px] font-mono whitespace-pre selection:bg-gray-700 border border-gray-800">
        <code className="block min-w-max">{highlightedHtml}</code>
      </pre>
    </div>
  );
}
