
export async function main(mainProps) {
  { const load = await import('../_init_react.js'); await load.default() }
  const {cssBase} = await import('../style.js')

  console.log(React.version)
    
  const App = props => {
      
    const handleClick = async(e) => {
      let token
      try {
        const r = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/unsta-token/-', {
          mode: 'cors', credentials: 'include',
        })
        if (!r.ok) throw new Error(r.status + ':' + await r.json())
        token = await r.json()
      } catch(e) {
        throw new Error(`セッショントークンが取得できませんでした。(${e.message})`)
      }

      const r = await fetch(props.uri + '/?rest_route=/unsta/v1/api/test/123', {
        method: 'POST', 
        mode: 'cors', credentials: 'include',
        headers: {
          'X-CSRF-Token': token,
        }, 
        body: JSON.stringify({ok:'good'}),
      })
        
      console.log(await r.json())
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
    
  const root = createRoot(document.querySelector(mainProps.root))
  root.render(React.createElement(App, mainProps))
}
