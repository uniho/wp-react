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
      
      return html`
      <div className="${cssPage}">
        <div onClick=${handleClick}>てすと ${mainProps.token}</div>
      </div>`
    }
  
    const cssPage = css`
      div {
        background-color: var(--wp--preset--color--primary);
      }
    `
    
    return App
}
