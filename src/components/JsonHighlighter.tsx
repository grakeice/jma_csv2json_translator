import { use, useMemo, useRef, type ReactNode } from "react";
import * as TreeSitter from "web-tree-sitter";
import { useVirtualizer } from "@tanstack/react-virtual";

// Use type-only imports for types, while keeping TreeSitter for values
import type { Node } from "web-tree-sitter";

const { Parser, Language } = TreeSitter;

interface JsonHighlighterProps {
	data: unknown;
}

// Global promise for initialization to be used with React 19 `use()`
let langPromise: Promise<TreeSitter.Language> | null = null;

function getJsonLanguage() {
	if (!langPromise) {
		langPromise = (async () => {
			await Parser.init({
				locateFile(scriptName: string) {
					return `/${scriptName}`;
				},
			});
			return await Language.load("/tree-sitter-json.wasm");
		})();
	}
	return langPromise;
}

export function JsonHighlighter({ data }: JsonHighlighterProps) {
	const JSON_LANG = use(getJsonLanguage());

	const jsonString = useMemo(() => JSON.stringify(data, null, 2), [data]);
	const lines = useMemo(() => jsonString.split("\n"), [jsonString]);

	const parentRef = useRef<HTMLDivElement>(null);

	const tree = useMemo(() => {
		const parser = new Parser();
		parser.setLanguage(JSON_LANG);
		return parser.parse(jsonString);
	}, [JSON_LANG, jsonString]);

	const rowVirtualizer = useVirtualizer({
		count: lines.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 18,
		overscan: 10,
	});

	function getClassName(node: Node): string {
		const type = node.type;

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
			return isKey ? "text-blue-600 opacity-70" : "text-gray-500";
		}

		if (isKey) {
			return "text-blue-600 font-medium";
		}

		switch (type) {
			case "string_content":
				return "text-green-600";
			case "number":
				return "text-amber-600";
			case "true":
			case "false":
			case "null":
				return "text-purple-600 font-bold";
			default:
				return "text-gray-600";
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
		<div
			ref={parentRef}
			className="scrollbar-thin scrollbar-thumb-gray-400 relative h-[600px] overflow-auto bg-gray-50"
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
						className="flex items-center border-b border-gray-200/30 px-4 font-mono text-[11px] whitespace-pre transition-colors hover:bg-gray-100/50"
					>
						<span className="mr-4 inline-block w-10 shrink-0 border-r border-gray-300/50 pr-2 text-right text-gray-500 select-none">
							{virtualRow.index + 1}
						</span>
						<code className="block min-w-max text-gray-700">
							{renderHighlightedLine(virtualRow.index)}
						</code>
					</div>
				))}
			</div>
		</div>
	);
}
