//A document is an object consisting of an array of blocks
//A block is one of 
//	{type: "heading", level: 1 | 2 | 3, text: string}
//	{type: "paragraph", runs: Run[] }
//	{type: "list", ordered: boolean, items: string[] }
//A Run is { text: string, bold?: boolean, italic?: boolean }

//Sample Docs
const sample_doc = {
	blocks: [
		{ type: "heading", level: 1, text: "Sample"},
		{ type: "paragraph", runs:[
			{ text: "This is "},
			{ text: "bold", bold:true },
			{ text: " and this is "},
			{ text: "italic", italic:true},
			{text: "."}
		]},
		{ type: "list", ordered: false, items: ["First Item", "Second Item"] }
	]
};

const sample_doc_2 = {
	blocks: [
		{ type: "heading", level: 2, text: "A shorter Doc"},
		{ type: "paragraph", runs: [{text: "Just one plain pargraph"}] }
	]
}

//Exporters
function toText(doc) {
	return doc.blocks.map(block =>{
		if (block.type === "heading") return block.text;
		if (block.type === "paragraph") return block.runs.map(r => r.text).join("");
		if (block.type === "list") return block.items.map(i => "- " + i).join("\n");
	}).join("\n\n")
}

// console.log("ToText Method\n");
// console.log(toText(sample_doc));
// console.log(toText(sample_doc_2));

function toHtml(doc) {
	return doc.blocks.map(block => {
		if (block.type === "heading") return `<h${block.level}>${block.text} </h${block.level}>`;
		if (block.type === "paragraph") return `<p>${block.runs.map(r => {
		  let t = r.text;
		  if (r.bold) t = `<strong>${t}</strong>`;
		  if (r.italic) t = `<em>${t}</em>`;
		  return t;
		}).join("")}</p>`;
		if (block.type === "list") {
			const tag = block.ordered ? "ol" : "ul";
			return `<${tag}> ${block.items.map(i => `<li>${i} </li>`).join("")} </${tag}>`;
		}
	}).join("\n\n")
}

// console.log("ToHtml Method\n");
// console.log(toHtml(sample_doc));
// console.log(toHtml(sample_doc_2));

function toMarkdown(doc) {
	return doc.blocks.map(block =>{
		if (block.type === "heading") return "#".repeat(block.level) + " " +block.text;
		if (block.type === "paragraph") return block.runs.map(r => r.text).join("");
		if (block.type === "list") return block.items.map(i => "- " + i).join("\n"); 
 	}).join("\n\n")
}

// console.log("toMarkdown Method\n");
// console.log(toMarkdown(sample_doc));
// console.log(toMarkdown(sample_doc_2));
function parseRuns(text) {
	const runs = [];
	const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|([^*]+)/g;
	let match;
	while ((match = pattern.exec(text)) != null) {
		if (match[1] !== undefined) runs.push({ text: match[1], bold: true});
		else if (match[2] !== undefined) runs.push({ text: match[2], italic: true});
		else if (match[3] !== undefined) runs.push({ text: match[3] });
	}
	return runs;
}
function parseMarkup(text) {
	const lines = text.split("\n");
	const blocks = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.trim() == "") continue;

		if (line.startsWith("#")) { //header
			let level = 0;
			while (line[level] === "#") level++;
			const text = line.replace(/^#+\s+/, "");
			blocks.push({type: "heading", level, text});
		}
		else if (line.startsWith("- ")){
			const items = [];
			while (i < lines.length && lines[i].startsWith("- ")) {
				items.push(lines[i].replace("- ", ""));
				i++;
			}
			blocks.push({ type:"list",ordered: false, items });
		}
		else {
			//paragraph
			blocks.push({ type: "paragraph", runs: parseRuns(line) });
		}
	}

	return {blocks};
}

console.log("Markup Parsing \n");
// console.log(toHtml(parseMarkup("# Hello\nThis is a paragraph")));
// console.log(toHtml(parseMarkup("# Hello\n- First\n- Second\nA paragraph")));

// const input = "# My Document\nThis is a paragraph\n- First\n- Second";
// const doc = parseMarkup(input);
// console.log(toText(doc));
// console.log(toHtml(doc));
// console.log(toMarkdown(doc));

//UI 
const sourceEl = document.getElementById("source");
const previewEl = document.getElementById("preview");

sourceEl.addEventListener("input", function() {
	previewEl.innerHTML = toHtml(parseMarkup(sourceEl.value));
} );

function download(filename, content) {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(new Blob([content]));
	a.download = filename;
	a.click();
}

document.getElementById("exportTxt").addEventListener("click", function() {
	download("document.txt", toText(parseMarkup(sourceEl.value)));
});

document.getElementById("exportHtml").addEventListener("click",function() {
	download("document.html", toHtml(parseMarkup(sourceEl.value)));
});

document.getElementById("exportMd").addEventListener("click",function() {
	download("document.md", toMarkdown(parseMarkup(sourceEl.value)));
});