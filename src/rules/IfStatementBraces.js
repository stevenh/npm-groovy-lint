// Missing if braces

// nvuillam: Fix not always working, especially when embedded missing If statements ...
//   let's let people correct that manually for now :)

const { getStringRange, getVariable, isValidCodeLine } = require("../utils");

const rule = {
    scope: "file",
    unitary: true,
    triggers: ["ClosingBraceNotAlone"],
    range: {
        type: "function",
        func: (errLine, errItem) => {
            return getStringRange(errLine, "if", errItem);
        }
    },
    fix: {
        label: "Add if statement braces",
        type: "function",
        func: (allLines, variables) => {
            const lineNumber = getVariable(variables, "lineNb", { mandatory: true });
            // If next line is also a if/else, this rule can not autofix for now, it has to be done manually
            if (allLines[lineNumber + 1] && (allLines[lineNumber + 1].includes("if") || allLines[lineNumber + 1].includes("else"))) {
                return allLines;
            }
            // If line
            let line = allLines[lineNumber];
            line = line.trimEnd() + " {";
            allLines[lineNumber] = line;
            // next line
            let match = false;
            let pos = 0;
            let level = 0;
            while (!match && pos < allLines.length) {
                let nextLine = allLines[lineNumber + pos + 1];
                if (isValidCodeLine(nextLine) && level === 0) {
                    if (!nextLine.trim().startsWith("if") && !nextLine.includes("{")) {
                        nextLine = nextLine + "{{{NEWLINECLOSINGBRACE}}}";
                        allLines[lineNumber + pos + 1] = nextLine;
                        match = true;
                    } else if (nextLine.includes("}") && !nextLine.includes("{")) {
                        level--;
                    } else {
                        level++;
                    }
                }
                pos++;
            }
            return allLines;
        }
    },
    tests: [
        {
            sourceBefore: `
if (a == 1)
    whatever()
`,
            sourceAfter: `
if (a == 1) {
    whatever() 
}
`
        }
    ]
};

module.exports = { rule };
