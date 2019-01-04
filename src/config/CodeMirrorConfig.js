const keyMaps = {
  Enter: "newlineAndIndentContinueMarkdownList",
  Tab: "tabAndIndentMarkdownList",
  "Shift-Tab": "shiftTabAndUnindentMarkdownList"
};

const mode = {
  name: "markdown",
  gitHubSpice: false,
  highlightFormatting: true
};

export default {
  mode: "smartmd",
  backdrop:mode,
  theme: "paper",
  tabSize: 2,
  indentUnit: 2,
  indentWithTabs: true,
  lineNumbers: false,
  autofocus: false,
  extraKeys: keyMaps,
  lineWrapping: true,
  allowDropFileTypes: ["text/plain"],
  autoCloseTags: false,
  matchTags: {bothTags: true},
  placeholder: "Please enter the text ...",
  styleSelectedText: true
}
