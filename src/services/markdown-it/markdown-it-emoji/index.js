import emojies_defs from './lib/data/full'
import emojies_shortcuts from './lib/data/shortcuts'
import emoji_html from './lib/render'
import emoji_replace from './lib/replace'
import normalize_opts from './lib/normalize_opts'

export default function emoji_plugin(md, options) {
  const defaults = {
    defs: emojies_defs,
    shortcuts: emojies_shortcuts,
    enabled: []
  };
  const opts = normalize_opts(md.utils.assign({}, defaults, options || {}));

  md.renderer.rules.emoji = emoji_html;

  md.core.ruler.push('emoji', emoji_replace(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE));
}
