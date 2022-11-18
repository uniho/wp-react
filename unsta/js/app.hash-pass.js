
import {Const, Style, Ref} from './namespaces.js'
import {cssBase} from './style.js'
import {ModalSpinner} from './parts.spinner.js'
import {Snackbar} from './parts.snackbar.js'
import post2rest from './submod.post2rest.js'

// パスワードをハッシュ化して返す App
export default props => {
  Const.uri = props.uri
  return html`
  <div className=${cssBase} ref=${e => Ref.desktop = e}>
    <${Page}/>
  </div>
  `
}

//
const Page = props => {

  let modalSpinner, snackbar;

  const [state, setState] = React.useState({pass: '', hash: ''})

  const handleChange = e => {
    state[e.target.name] = e.target.value;
    const newobj = Object.assign({}, state) // オブジェクトを新しくして更新を通知
    setState(newobj);
  }

  const refInputPass = React.useRef()
  const refInputHash = React.useRef()

  React.useEffect(() => {
    // on componentDidMount
    if (!Const.isTouchDevice) {  // あると、スマホでIMEが起動してうざいので PC のみ
      refInputPass.current.focus()
    }

  }, [])

  //
  const doHash = async(e) => {
    if (!state.pass) {
      refInputPass.current.focus()
      return
    }
    
    modalSpinner.show('計算中です...')
    try {
      try {
        const r = await post2rest(
          '/?rest_route=/unsta/v1/api/hash-pass/-', {
            pass: state.pass,
          },
        )
  
        const json = await r.json()
        if (json.data) {
          // 成功
          refInputHash.current.focus()
          //refInputHash.current.select()
          state.hash = json.data
          setState(Object.assign({}, state));
        } else {
          throw new Error(json.error?.message)
        }
      } catch(e) {
        snackbar.show(e.message)
      }
    } finally {
      modalSpinner.hide()
    }            
  }

  return html`<${Fragment}>

  <${ModalSpinner} ref=${e => modalSpinner = e} />
  <${Snackbar} ref=${e => snackbar = e} />

  <div className=${cssPage}>
    <div className="flex-col">
      <div className="flex-col">
        <label htmlFor="pw">パスワード</label>
        <input name="pass" id="pw" type="text" ref=${refInputPass}
          value=${state.pass} onChange=${handleChange}
          style=${{marginTop:'.25rem'}}
        />
      </div>
    </div>
    
    <div className="flex-col mt-4">
      <div className="flex-col">
        <label htmlFor="hash">HASH</label>
        <input name="hash" id="hash" type="text" ref=${refInputHash}
          value=${state.hash}
          style=${{marginTop:'.25rem'}}
        />
      </div>
    </div>

    <button className="btn--raised2 mt-8 w-full" onClick=${doHash}>ハッシュ！</button>

  </div>

  <//>`
}

//
const cssPage = css`
  /* div {
    background-color: var(--wp--preset--color--primary);
  } */
`;
