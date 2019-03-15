const MarkdownIt = require('markdown-it');
const md = new MarkdownIt()

const Purgecss = require('purgecss')
const { JSDOM } = require('jsdom')

const cssFiles = ['./src/css/custom.css','./src/css/markdown.css', './src/css/tachyons.css']

const insertCss = (html, css) => {

    const dom = new JSDOM(html)
    
    const { document } = dom.window

    let head = document.getElementsByTagName('head')[0];
    let style = document.createElement("style");
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);

    return dom.serialize()
}


module.exports = function (eleventyConfig) {
    // Copy the `img/` directory
    eleventyConfig.addPassthroughCopy('src/img')
  
    // Copy the `css/fonts/` directory
    // If you use a subdirectory, it’ll copy using the same directory structure.
    // eleventyConfig.addPassthroughCopy('src/css')
    eleventyConfig.addNunjucksShortcode("markdown", function(text) { return md.render(text) });
    eleventyConfig.addFilter('csspurge', function(code) {
      const purgecss = new Purgecss({
        content: ['_includes/*'],
        css: ['**/*.css']
      })
      return purgecssResult = purgecss.purge()
    })
    
    eleventyConfig.addTransform("purgeCSS", function(content, outputPath){
      if( outputPath.endsWith(".html") ) {
        console.log(outputPath)
        const purgecss = new Purgecss({
          content: [outputPath],
          css: cssFiles
        })
        const purgecssResult = purgecss.purge()
        let cssMerge = ''
        if(purgecssResult.length>0){
          for (let i = 0; i < purgecssResult.length; i++){
            cssMerge= cssMerge.concat(purgecssResult[i].css)
          }
          return insertCss(content, cssMerge)
        }
      }
      return content

    })

    return {
      passthroughFileCopy: true,
      dir: {
        input: 'src'
      },
      markdownTemplateEngine: 'njk'
    }
  }
  