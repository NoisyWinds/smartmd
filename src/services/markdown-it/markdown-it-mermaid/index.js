const mermaid = window.mermaid;

function mermaidChart(code) {
  try {
    mermaid.parse(code);
    return mermaid.mermaidAPI.render(`chart_${new Date().getTime()}`, code)
  } catch (str) {
    return `<pre>${str}</pre>`
  }
}

function MermaidPlugin(markdownIt) {
  if (mermaid) {
    markdownIt.mermaid = mermaid;

    markdownIt.renderer.rules.fence = (tokens, idx) => {
      let token = tokens[idx];
      let code = token.content.trim();
      if (token.info === 'mermaid') {
        return mermaidChart(code);
      }

      let firstLine = code.split(/\n/)[0].trim();
      if (firstLine === 'gantt' || firstLine === 'sequenceDiagram' || firstLine.match(/^graph (?:TB|BT|RL|LR|TD);?$/)) return mermaidChart(code);
      return tokens;
    }
  } else {
    console.warn('Smartmd: mermaid is used but not import')
  }
}

export default MermaidPlugin
