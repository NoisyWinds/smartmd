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
  if (window.mermaid) {
    markdownIt.mermaid = mermaid;
    const temp = markdownIt.renderer.rules.fence.bind(markdownIt.renderer.rules)
    markdownIt.renderer.rules.fence = (tokens, idx, options, env, slf) => {
      let token = tokens[idx];
      let code = token.content.trim();
      if (token.info === 'mermaid') {
        return mermaidChart(code);
      }

      let firstLine = code.split(/\n/)[0].trim();
      if (firstLine === 'gantt' || firstLine === 'sequenceDiagram' || firstLine.match(/^graph (?:TB|BT|RL|LR|TD);?$/)){
        return mermaidChart(code);
      }
      return temp(tokens, idx, options, env, slf)
    }
  } else {
    throw new ReferenceError('Smartmd: mermaid is used but not import')
  }
}

export default MermaidPlugin
