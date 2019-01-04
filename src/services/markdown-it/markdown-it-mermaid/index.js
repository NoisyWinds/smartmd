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
    mermaid.loadPreferences = (preferenceStore) => {
      let mermaidTheme = preferenceStore.get('mermaid-theme');
      if (!mermaidTheme) mermaidTheme = 'default';
      let ganttAxisFormat = preferenceStore.get('gantt-axis-format');
      if (!ganttAxisFormat) ganttAxisFormat = '%Y-%m-%d';

      mermaid.initialize({
        theme: mermaidTheme,
        gantt: {
          axisFormatter: [[ganttAxisFormat, (d) => d.getDay() === 1]]
        }
      });

      return {
        'mermaid-theme': mermaidTheme,
        'gantt-axis-format': ganttAxisFormat
      }
    };

    const temp = markdownIt.renderer.rules.fence.bind(markdownIt.renderer.rules);
    markdownIt.renderer.rules.fence = function (tokens, idx, options, env, slf) {
      let token = tokens[idx];
      let code = token.content.trim();
      if (token.info === 'mermaid') return mermaidChart(code);

      let firstLine = code.split(/\n/)[0].trim();
      if (firstLine === 'gantt' || firstLine === 'sequenceDiagram' || firstLine.match(/^graph (?:TB|BT|RL|LR|TD);?$/)) return mermaidChart(code)
      return temp(tokens, idx, options, env, slf)
    }
  } else {
    console.warn('Smartmd: mermaid is used but not import')
  }
}

export default MermaidPlugin
