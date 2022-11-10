
import {Const, Style, Ref} from './namespaces.js'
import {cssBase} from './style.js'
import {ModalSpinner} from './parts.spinner.js'
import {Snackbar} from './parts.snackbar.js'

// User Home App
export default props => {
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
  res.userResponce = await fetch('/index.php?rest_route=/unsta/v1/post-api/current-user/-', {
    method: 'POST', 
    mode: 'cors', credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': window.unstaToken,
    }, 
  })

  if (res.userResponce.ok) {
    const json = await res.userResponce.json()
    res.user = json.data
  }

  return res
})()

let modalSpinner, snackbar;

//
const doLogoff = async(e) => {
  modalSpinner.show('ログオフ中です...')
  try {
    const r = await fetch('index.php?rest_route=/unsta/v1/post-api/logoff/-', {
      method: 'POST', 
      mode: 'cors', credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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

  <div>ID=${data.user?.id}
  </div>
  <button className="btn--flat mt-8 w-full" onClick=${doLogoff}>
      ログオフ
  </button>
  <//>`
}
