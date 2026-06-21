function elementPlusLocalDark(selector = '.dark') {
  const postcssPlugin = () => {
    return {
      postcssPlugin: 'element-plus-local-dark',
      Rule(rule) {
        if (rule.selector === 'html.dark') {
          rule.selector = `html.dark, ${selector}`
        }
      },
    }
  }
  postcssPlugin.postcss = true

  return {
    name: 'element-plus-local-dark',
    config(config) {
      config.css ??= {}
      config.css.postcss ??= {}
      config.css.postcss.plugins ??= []
      config.css.postcss.plugins.push(postcssPlugin)
    },
  }
}

export default elementPlusLocalDark
