
export async function main(mainProps, mainID) {
  { const load = await import('../_init_react.js'); await load.default() }
  const {cssBase} = await import('../style.js')

  console.log(React.version)
    
  const App = props => {
      
    const handleClick = async(e) => {
      const r = await fetch('index.php?rest_route=/unsta/v1/post-api/test/123', {
        method: 'POST', 
        mode: 'cors', credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': window.unstaToken,
        }, 
        body: JSON.stringify({ok:'good'}),
      })
        
      console.log(await r.text())
    }  

    // 改行を <br/> タグに変換する
    const memo = mainProps.val2js.acf.memo.replace(/\n/g, '<br/>')

    return html`
    <div className="${cx(cssBase, cssPage)}">
      <div onClick=${handleClick}>
        メモ:
        <div dangerouslySetInnerHTML=${{__html: memo}}></div>
      </div>
    </div>`
  }

  const cssPage = css`
    div {
      background-color: var(--wp--preset--color--primary);
    }
  `
    
  const root = createRoot(document.getElementById(mainID))
  root.render(React.createElement(App))
}
