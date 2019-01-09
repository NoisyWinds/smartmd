import MarkdownIt from 'markdown-it'
import MarkdownItEmoji from './markdown-it-emoji'
import MarkdownItMermiad from './markdown-it-mermaid'
import MarkdownItKatex from './markdown-it-katex'

const plugins = {
  emoji: {
    plugin: MarkdownItEmoji
  },
  mermaid: {
    plugin: MarkdownItMermiad,
    options: {
      throwOnError: true,
      errorColor: '#cc0000'
    }
  },
  katex: {
    plugin: MarkdownItKatex
  }
};

export default function (editor) {
  let options = editor.options;
  let markdownOptions = options.MarkdownItConfig;

  if (options.highlight) {
    if (window.hljs) {
      markdownOptions.options.highlight = function (str) {
        return `<pre class="hljs"><code>${window.hljs.highlightAuto(str).value}</code></pre>`;
      }
    } else {
      console.warn("Smartmd: highlight used but not import")
    }
  }

  const md = MarkdownIt(markdownOptions.options);
  markdownOptions.plugins.forEach((item) => {
    if (typeof item === 'object') {
      md.use(item.plugin, item.options)
    } else if (typeof item === 'string' && item in plugins) {
      md.use(plugins[item].plugin, plugins[item].options || {})
    }
  });

  return md;
}
