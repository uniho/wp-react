import {Const, Style, Ref} from './namespaces.js'
import {cssBase} from './style.js'
import {ModalSpinner} from './parts.spinner.js'
import {Snackbar} from './parts.snackbar.js'
import IconMenu from './icons/menu.js'

// User Home App
export default props => {
  Const.uri = props.uri
  resource = getResource()
  return html`
  <div className=${cssBase} ref=${e => Ref.desktop = e}>
    <${Suspense} fallback=${html`<div>...</div>`}>
      <${Page}/>
    <//>
  </div>
  `
}

let resource

const getResource = async function() {
  const res = {}
  res.userResponce = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/current-user/-', {
    mode: 'cors', credentials: 'include',
  })

  if (res.userResponce.ok) {
    const json = await res.userResponce.json()
    res.user = json.data

    if (res.user?.id) {
      // web analytics を取得
      res.waResponce = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/query-wp-post/-', {
        mode: 'cors', credentials: 'include',
      })
    
      if (res.waResponce.ok) {
        const json = await res.waResponce.json()
        res.wa = json.data
        console.log(res.wa)
      }
    }  
  }

  return res
}

let modalSpinner, snackbar;

//
const doLogoff = async(e) => {
  modalSpinner.show('ログオフ中です...')
  try {
    const r = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/logoff/-', {
      mode: 'cors', credentials: 'include',
    })
  } finally {
    location.href = Const.uri // Go Top
  }            
}

//
const Page = props => {
  const data = React.use(resource)

  const [stateMenu, setStateMenu] = React.useState(false)
  const refCursor = React.useRef(false) 

  const showMenu = e => {
    refCursor.current = e
    setStateMenu(true)
  }

  const hideMenu = () => {
    setTimeout(() => setStateMenu(false), menuClose_msec)
  }

  return html`<${Fragment}>

  <${ModalSpinner} ref=${e => modalSpinner = e} />
  <${Snackbar} ref=${e => snackbar = e} />

  ${function _() {
    if (!stateMenu) return null;
    return html`
    <${MenuInner} cursor=${refCursor.current} hide=${hideMenu}>
      <div>設定</div>
      <div onClick=${doLogoff}>
        ログオフ
      </div>
    <//>
    `
  }()}

  <div className="${cssPage}">

    <div className=${cx("flex", {show: stateMenu})} style=${{justifyContent:'end'}}>
      <div className="menu-icon" onClick=${showMenu}>
        <${IconMenu} size="2rem" />
      </div>
    </div>

    <div>
      ID=${data.user?.id}
    </div>
    <div>
      ${data.touch?.date}
    </div>
    <div dangerouslySetInnerHTML=${{__html:data.touch?.content}}></div>

    <div className="mt-8 flex" style=${{justifyContent:'end'}}>
      <div>作成日: ${data.wa.date}</div>
    </div>

    <div className="table flex-row has-primary-background-color has-background">
      <div className="table-title">アクセス分析レポート</div>
      <div className="table-title-bottom"></div>

      <div className="flex top-row">
        <${CommentRow} title="サイト名" data=${data.wa.site_name} />
      </div>
      <div className="flex">
        <${CommentRow} title="サイトURL" data=${data.wa.site_url} />
      </div>
      <div className="flex">
        <${CommentRow} title="分析期間" data=${data.wa.kikan} />
      </div>

      <div className="table-bottom"></div>
    </div>

    <div className="mt-8 table flex-row has-primary-background-color has-background">
      <div className="flex top-row">
        <${CommentRow} title="ユーザー" data=${data.wa.user1} comment=${data.wa.user2}/>
      </div>
      <div className="flex">
        <${CommentRow} title="ページビュー" data=${data.wa.page_view1} comment=${data.wa.page_view2}/>
      </div>
      <div className="flex">
        <${CommentRow} title="直帰率" data=${data.wa.chokki_ritsu1} comment=${data.wa.chokki_ritsu2}/>
      </div>
      <div className="flex">
        <${CommentRow} title="閲覧ページ" data=${data.wa.etsuran_page} comment=""/>
      </div>
      <div className="flex">
        <${CommentRow} title="<span>地域</span><span>（都道府県）</span>" data=${data.wa.area_pref1} comment=${data.wa.area_pref2}/>
      </div>
      <div className="flex">
        <${CommentRow} title="<span>地域</span><span>（特定地域）</span>" data=${data.wa.area_city1} comment=${data.wa.area_city2}/>
      </div>
      <div className="flex">
        <${CommentRow} title="デバイス" data=${data.wa.device1} comment=${data.wa.device2}/>
      </div>
      <div className="flex">
        <${CommentRow} title="流入経路" data=${data.wa.device1} comment=${data.wa.device2}/>
      </div>
      <div className="flex">
        <${CommentRow} title="<span>流入</span><span>キーワード</span>" data=${data.wa.keyword} />
      </div>
      <div className="flex">
        <${CommentRow} title="年齢" data=${data.wa.nenrei1} comment=${data.wa.nenrei2}/>
      </div>
      <div className="flex">
        <${CommentRow} title="性別" data=${data.wa.sex1} comment=${data.wa.sex2}/>
      </div>
      <div className="flex">
        <${CommentRow} title="総合分析" data=${data.wa.bunseki} />
      </div>
      <div className="flex">
        <${CommentRow} title="備考" data=${data.wa.biko} />
      </div>

      <div className="table-bottom"></div>

    </div>
  
  </div>
  <//>`
}

//
const CommentRow = props => {
  const [stateShowComment, setStateShowComment] = React.useState(false)
  const handleClick = e => {
    if (!props.comment) return;
    setStateShowComment(state => !state)
  }

  const data = React.useMemo(() => {
    if (!props.data) return '';
    return props.data.replace(/\n/g, '<br/>')
  }, [])

  const comment = React.useMemo(() => {
    if (!props.comment) return '';
    return props.comment.replace(/\n/g, '<br/>')
  }, [])

  return html`<${Fragment}>
  <div className="title" dangerouslySetInnerHTML=${{__html: props.title}}></div>
  <div className="field flex-row" onClick=${handleClick}>
    <div className="data" dangerouslySetInnerHTML=${{__html: data}}></div>
    <div className=${cx({show: props.comment?.length > 0, showComment: stateShowComment}, "comment-button")}>🫥</div>
    <div className=${cx({show: stateShowComment}, 'comment')} dangerouslySetInnerHTML=${{__html: comment}}></div>
  </div>
  <//>`
}

//
const cssPage = css`

  .menu-icon {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .table-title {
    display: flex;
    height: 3rem;
    justify-content: center;
    align-items: center;
  }

  .table-title-bottom {
    height: .5rem;
    background-color: var(--wp--preset--color--base);
  }

  .title {
    display: flex;
    border-top: solid 3px var(--wp--preset--color--base);
    padding: 0 .5rem;
    width: 10rem;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    color: ${Style.textColor};
    & > span {
      display: inline-block;
      white-space: nowrap;
    }
  }

  @media screen and (max-width: 600px) {
    .title {
      width: 6rem;
    }
  }

  .top-row {
    .title {
      border-color: rgba(0,0,0,0);
    }
  }

  .field {
    flex: 1;
    margin-top: 3px;
    margin-right: 3px;
    background-color: var(--wp--preset--color--base);

    .data {
      padding-left: 1rem;
    }

    .comment-button {
      display: none;
      margin: auto 1rem;
      padding: .5rem 0;
      font-size: 2rem;
      &>img {
        cursor: pointer;
        transition: transform .5s;
        transform: rotate(90deg);
      }	
      &.show {
        display: flex;
        &.showComment>img {
          transform: rotate(0deg);
        }	 
      }
    }

    & > .comment {
      height: 0;
      opacity: 0;
      overflow: hidden;
      transition: opacity 1s;
      &.show {
        height: auto;
        opacity: 100;
        border-top: solid 1px var(--wp--preset--color--primary);
        padding: .5rem 1rem;
      }
    }
  }

  .table-bottom {
    height: 3px;
  }
`;

//
const MenuInner = props => {
  const wx = 200, wy = menuH, mx = 16, my = 16
  let x = props.cursor.clientX + mx - wx / 2
  if (x + wx + mx > document.body.clientWidth) {
    x = document.body.clientWidth - wx - mx
  }
  if (x < mx) x = mx
  
  let y = props.cursor.clientY + my
  if (y + wy > document.documentElement.clientHeight) {
    y = document.documentElement.clientHeight - wy
  }
  if (y < my) y = my

  const [stateHide, setStateHide] = React.useState(false)
  React.useEffect(() => {
    if (stateHide) props.hide()
  })

  return ReactDOM.createPortal(html`
    <div className=${cx(cssMenu, "modal-desktop")} onClick=${e => setStateHide(true)}>
      <div className=${cx({hide: stateHide})}
        style=${{top: y, left: x, width:wx+'px', height:wy+'px'}}
      >
        ${props.children}
      </div>
    </div>
  `, Ref.desktop)
}

//
const menuH = 200
const menuClose_msec = 250

const kfMenuFadein = keyframes`
  0% {
    height: 0; opacity: 0%;
  }
  50% {
    opacity: 100%;
  }
  100% {
    height: ${menuH}px;
  }
`

const kfMenuFadeout = keyframes`
  0% {
    height: ${menuH}px;
  }
  100% {
    height: 0;
  }
`

const cssMenu = css`
  display: flex;
  flex-direction: column;
  /* justify-content: end; */

  & > div {
    position: absolute;
    background-color: ${Style.background};
    display: flex;
    flex-direction: column;
    border: solid 1px var(--wp--preset--color--contrast);
    /* border-radius: 2px; */
    animation: ${kfMenuFadein} 0.5s ease-in-out forwards;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);

    &.hide {
      animation: ${kfMenuFadeout} ${menuClose_msec}ms ease-in-out forwards;
      & > div {
        opacity: 0;
        transition: opacity ${menuClose_msec}ms;
      }
    }

    & > div {
      padding: .5rem 1rem;
      overflow: hidden;
      white-space: nowrap;
      cursor: pointer;
      /* transform: translate(50%);
      border: solid 1px var(--wp--preset--color--contrast);
      border-radius: 2px;
      padding: 1rem;
      animation: ${kfMenuFadein} 0.5s ease-in-out forwards; */
    }
  }

`;
