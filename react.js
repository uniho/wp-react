export async function main(mainProps) {
    console.log(React.version)
      
    const App = props => {
        
      const handleClick = async(e) => {
        const r = await fetch(mainProps.postURI+'/post.php', {
          method: 'POST', 
          mode: 'cors', credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': mainProps.token,
          }, 
          body: JSON.stringify({ok:'good'}),
        })
          
        console.log(await r.text())
      }  

      // 改行を <br/> タグに変換する
      const memo = mainProps.val2js.acf.memo.replace(/\n/g, '<br/>')

      return html`
      <div className="${cssPage}">
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
    
    return App
}
