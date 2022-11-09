
// ログインする
export async function main(mainProps) {
      
  const login = async(e) => {
    const r = await fetch('index.php?rest_route=/unsta/v1/post-api/login/', {
      method: 'POST', 
      mode: 'cors', credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': mainProps.token,
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
  const App = props => {
    return html`
    <div className="${cssPage}">
      ボタン押す
    </div>`
  }

  const cssPage = css`
    div {
      background-color: var(--wp--preset--color--primary);
    }
  `
  
  return App
}
