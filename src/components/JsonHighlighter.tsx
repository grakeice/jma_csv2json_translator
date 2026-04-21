import { useEffect, useState, useRef, type ReactNode, useMemo } from "react";
import * as TreeSitter from "web-tree-sitter";
import { useVirtualizer } from "@tanstack/react-virtual";

// Use type-only imports for types, while keeping TreeSitter for values
import type { Parser as ParserType, Node, Tree } from "web-tree-sitter";

const { Parser, Language } = TreeSitter;

interface JsonHighlighterProps {
  data: any;
}

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export function JsonHighlighter({ data }: JsonHighlighterProps) {
  const jsonString = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const lines = useMemo(() => jsonString.split("\n"), [jsonString]);

  const [tree, setTree] = useState<Tree | null>(null);
  const parserRef = useRef<ParserType | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 18,
    overscan: 10,
  });

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
          const newTree = parser.parse(jsonString);
          setTree(newTree);
        }
      } catch (e) {
        console.error("Failed to initialize tree-sitter:", e);
      }
    }

    if (!parserRef.current) {
      void initParser();
    } else {
      const newTree = parserRef.current.parse(jsonString);
      setTree(newTree);
    }

    return () => {
      isMounted = false;
    };
  }, [jsonString]);

  function getClassName(node: Node): string {
    const type = node.type;

    // Correctly identify keys by checking if node belongs to the first child of a pair
    let isKey = false;
    let curr: Node | null = node;
    while (curr) {
      const parent: Node | null = curr.parent;
      if (parent?.type === "pair") {
        if (parent.firstChild?.id === curr.id) {
          isKey = true;
          break;
        }
      }
      curr = parent;
    }

    if (
      type === "{" ||
      type === "}" ||
      type === "[" ||
      type === "]" ||
      type === ":" ||
      type === ","
    ) {
      return "text-gray-500";
    }

    if (type === '"') {
      return isKey ? "text-sky-400 opacity-70" : "text-gray-500";
    }

    if (isKey) {
      return "text-sky-400 font-medium";
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

  const renderHighlightedLine = (index: number) => {
    if (!tree) return lines[index];

    const elements: ReactNode[] = [];
    const lineText = lines[index];
    let lastColumn = 0;

    function walk(node: Node) {
      // Fast path: skip subtrees that don't overlap with our line
      if (node.endPosition.row < index) return;
      if (node.startPosition.row > index) return;

      if (node.childCount === 0) {
        // This is a leaf node that overlaps with our line
        const startCol = node.startPosition.row === index ? node.startPosition.column : 0;
        const endCol = node.endPosition.row === index ? node.endPosition.column : lineText.length;

        // Add plain text between tokens
        if (startCol > lastColumn) {
          elements.push(
            <span key={`ws-${index}-${lastColumn}`} className="text-gray-500">
              {lineText.substring(lastColumn, startCol)}
            </span>,
          );
        }

        const text = lineText.substring(startCol, endCol);
        if (text.length > 0) {
          elements.push(
            <span key={`${node.id}-${index}-${startCol}`} className={getClassName(node)}>
              {text}
            </span>,
          );
        }
        lastColumn = endCol;
      } else {
        for (let i = 0; i < node.childCount; i++) {
          walk(node.child(i)!);
        }
      }
    }

    // Walk the tree for this line. Skip subtrees efficiently using walk logic.
    walk(tree.rootNode);

    // Remaining text on the line
    if (lastColumn < lineText.length) {
      elements.push(
        <span key={`ws-end-${index}`} className="text-gray-500">
          {lineText.substring(lastColumn)}
        </span>,
      );
    }

    return elements.length > 0 ? elements : lineText;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-sans">
        <span>JSON SYNTAX HIGHLIGHTER (LAZY & VIRTUAL)</span>
        {!tree && <span className="animate-pulse text-sky-400">Parsing...</span>}
      </div>

      <div
        ref={parentRef}
        className="bg-[#0d1117] rounded-lg border border-gray-800 h-[600px] overflow-auto scrollbar-thin scrollbar-thumb-gray-700 relative"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="px-4 text-[11px] font-mono whitespace-pre flex items-center hover:bg-white/5 border-b border-transparent"
            >
              <span className="inline-block w-10 mr-4 text-gray-600 text-right select-none border-r border-gray-800 pr-2 shrink-0">
                {virtualRow.index + 1}
              </span>
              <code className="block min-w-max">{renderHighlightedLine(virtualRow.index)}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
