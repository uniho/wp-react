import {Const, Style, Ref} from './namespaces.js'
import {cssBase} from './style.js'
import {ModalSpinner} from './parts.spinner.js'
import {Snackbar} from './parts.snackbar.js'
import IconMenu from './icons/menu.js'
import IconRight from './icons/chevron-right.js'

// User Home App
export default props => {
  Const.uri = props.uri
  Const.wp_nonce = props.wp_nonce
  Const.wp_object_id = props.wp_object_id
  Const.wp_user_is_admin = props.wp_user_is_admin
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

  if (Const.wp_object_id == Const.pageID.myPage) {
    res.userResponce = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/current-user/-', {
      mode: 'cors', credentials: 'include',
    })

    if (res.userResponce.ok) {
      const json = await res.userResponce.json()
      res.user = json.data
    }
  } else if (Const.wp_user_is_admin) { 
    // ダッシュボードから kokyaku CPT を表示する場合
    res.userResponce = await fetch(
      Const.uri + `/?rest_route=/unsta/v1/api/get-wpobj/${Const.wp_object_id}`,
      {
        mode: 'cors', credentials: 'include',
        headers: {'X-WP-Nonce': Const.wp_nonce}, // nonce が必要
      }
    )

    if (res.userResponce.ok) {
      const json = await res.userResponce.json()
      res.user = {id: Const.wp_object_id, name: json.data?.Title}
    }
  }

  if (res.user?.id) {
    // web analytics を取得
    res.waResponce = await fetch(Const.uri + `/?rest_route=/unsta/v1/api/query-wp-post/${res.user.id}`, {
      mode: 'cors', credentials: 'include',
      headers: {'X-WP-Nonce': Const.wp_nonce}, // kokyaku CPT の場合には nonce が必要
    })
  
    if (res.waResponce.ok) {
      const json = await res.waResponce.json()
      res.wa = json.data
      // console.log(res.wa)
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

  let user_name = ''
  if (data.user?.id) user_name = `${data.user.name} 様 (${data.user.id})` 

  return html`<${Fragment}>

  <${ModalSpinner} ref=${e => modalSpinner = e} />
  <${Snackbar} ref=${e => snackbar = e} />

  <${PopupMenu} show=${stateMenu} hide=${() => setStateMenu(false)} cursor=${refCursor.current}>
    <div>設定</div>
    <div onClick=${doLogoff}>
      ログオフ
    </div>
  <//>

  <div className="${cssPage}">

    <div className=${cx("flex", {show: stateMenu})} style=${{justifyContent:'end'}}>
      <div className="menu-icon" onClick=${showMenu}>
        <${IconMenu} size="2rem" />
      </div>
    </div>

    <div>
      ${user_name}
    </div>

    ${ data.wa ? html`
    <div className="mt-8 flex" style=${{justifyContent:'end'}}>
      <div>作成日: ${data.wa.date}</div>
    </div>

    <div className="table flex-col has-primary-background-color has-background">
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

    <div className="mt-8 table flex-col has-primary-background-color has-background">
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

    ` : html`
    <div className="mt-8 table flex-col has-primary-background-color has-background">
      <div className="table-title">アクセス分析レポート</div>
      <div className="table-title-bottom"></div>
      <div className="flex top-row">
        <${CommentRow} title="なし" data="なし" />
      </div>
      <div className="table-bottom"></div>
    </div>
    `}
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
  <div className="field flex-col" onClick=${handleClick}>
    <div className="flex"> 
      <div className=${cx({show: props.comment?.length > 0, showComment: stateShowComment}, "comment-button")}>
        <${IconRight} size="1.5rem"/>
      </div>
      <div className="data" dangerouslySetInnerHTML=${{__html: data}}></div>
    </div>
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
      margin: auto .25rem;
      /* padding: .5rem 0; */
      font-size: 2rem;
      &>svg {
        cursor: pointer;
        transition: transform .5s;
        transform: rotate(0deg);
      }	
      &.show {
        display: flex;
        &.showComment>svg {
          transform: rotate(90deg);
        }	 
        & + .data {
          padding-left: 0;
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
const PopupMenu = props => {
  const wx = 200, wy = menuH, mx = 16, my = 16
  let x = props.cursor.pageX + mx - wx / 2
  if (x + wx + mx > document.body.clientWidth) {
    x = document.body.clientWidth - wx - mx
  }
  if (x < mx) x = mx
  
  let y = props.cursor.pageY + my
  if (y + wy > document.documentElement.clientHeight) {
    y = document.documentElement.clientHeight - wy
  }
  if (y < my) y = my

  const scrollWidth = Math.max(
    document.body.scrollWidth, document.documentElement.scrollWidth,
    document.body.offsetWidth, document.documentElement.offsetWidth,
    document.body.clientWidth, document.documentElement.clientWidth
  )
  
  const scrollHeight = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  )
  
  // for Hiding Animation
  const [stateHiding, setStateHiding] = React.useState(false)
  const hideMenu = () => {
    setStateHiding(true)
    setTimeout(() => {
      props.hide()
      setStateHiding(false)
    }, menuClose_msec)
  }

  if (!props.show) return null;

  return ReactDOM.createPortal(html`
    <div className=${cssMenu} 
      style=${{
        position: 'absolute',
        top: 0, left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width: scrollWidth + 'px', height: scrollHeight + 'px',
      }}  
      onClick=${e => hideMenu()}
    >
      <div className=${cx({hide: stateHiding})}
        style=${{top: y, left: x, width:wx+'px', height:wy+'px'}}
      >
        ${props.children}
      </div>
    </div>
  `, Ref.desktop)
}

//
const menuH = 100
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
    opacity: 100%;
  }
  100% {
    height: 0;
    opacity: 10%;
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
    }
  }

`;
