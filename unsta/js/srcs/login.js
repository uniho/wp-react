
// ログインする
export async function main(mainProps, mainID) {
  { const load = await import('../_init_react.js'); await load.default() }
  const {cssBase} = await import('../style.js')
      
  const login = async(e) => {
    const r = await fetch('index.php?rest_route=/unsta/v1/post-api/login/', {
      method: 'POST', 
      mode: 'cors', credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': window.unstaToken,
      }, 
      body: JSON.stringify({
        name: 'fuga', pass: 'hoge',
      }),
    })
    if (r.status == 200 || r.status == 403) {
      // 成功
    }          
    console.log(await r.text())
    return r
  }  

  const resource = await login()

  //
  const doLogin = e => {

  }

  //
  const App = props => {
    return html`
    <${ModalSpinner} ref=${e => modalSpinner = e} />
    <div className="${cx(cssBase, cssPage)}">
      <button className="btn--raised" onClick=${doLogin}>ログイン</button>
    </div>`
  }

  const cssPage = css`
    div {
      background-color: var(--wp--preset--color--primary);
    }
  `
  
  const root = ReactDOM.createRoot(document.getElementById(mainID))
  root.render(React.createElement(App))
}
