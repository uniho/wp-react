
import {Const, Style, Ref} from './namespaces.js'
import {cssBase} from './style.js'
import {ModalSpinner} from './parts.spinner.js'
import {Snackbar} from './parts.snackbar.js'

// User Home App
export default props => {
  Const.uri = props.uri
  return html`
  <div className=${cssBase} ref=${e => Ref.desktop = e}>
    <${Suspense} fallback=${html`<div>...</div>`}>
      <${Page}/>
    <//>
  </div>
  `
}

const resource = (async function() {
  const res = {}
  res.userResponce = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/current-user/-', {
    mode: 'cors', credentials: 'include',
    headers: {
      'X-CSRF-Token': window.unstaToken,
    }, 
  })

  if (res.userResponce.ok) {
    const json = await res.userResponce.json()
    res.user = json.data

    if (res.user?.id) {
      // touch 履歴を取得
      res.touchResponce = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/query-wp-post/-', {
        mode: 'cors', credentials: 'include',
        headers: {
          'X-CSRF-Token': window.unstaToken,
        }, 
      })
    
      if (res.touchResponce.ok) {
        const json = await res.touchResponce.json()
        res.touch = json.data
        console.log(res.touch)
      }
    }  
  }

  return res
})()

let modalSpinner, snackbar;

//
const doLogoff = async(e) => {
  modalSpinner.show('ログオフ中です...')
  try {
    const r = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/logoff/-', {
      mode: 'cors', credentials: 'include',
      headers: {
        'X-CSRF-Token': window.unstaToken,
      }, 
    })
  } finally {
    location.href = 'index.php?page_id=194' // Go Top
  }            
}

//
const Page = props => {
  const data = React.use(resource)
  
  return html`<${Fragment}>

  <${ModalSpinner} ref=${e => modalSpinner = e} />
  <${Snackbar} ref=${e => snackbar = e} />

  <div>
    ID=${data.user?.id}
  </div>
  <div>
    ${data.touch?.date}
  </div>
  <div dangerouslySetInnerHTML=${{__html:data.touch?.content}}></div>

  <button className="btn--flat mt-8 w-full" onClick=${doLogoff}>
      ログオフ
  </button>
  <//>`
}
