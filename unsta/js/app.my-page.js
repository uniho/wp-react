
import {Const, Style, Ref} from './namespaces.js'
import {cssBase} from './style.js'
import {ModalSpinner} from './parts.spinner.js'
import {Snackbar} from './parts.snackbar.js'

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
      // touch 履歴を取得
      res.touchResponce = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/query-wp-post/-', {
        mode: 'cors', credentials: 'include',
      })
    
      if (res.touchResponce.ok) {
        const json = await res.touchResponce.json()
        res.touch = json.data
        console.log(res.touch)
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
  
  return html`<${Fragment}>

  <${ModalSpinner} ref=${e => modalSpinner = e} />
  <${Snackbar} ref=${e => snackbar = e} />

  <div className="${cssPage}">
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

    <div className="mt-8 table flex-row has-primary-background-color has-background">
      <div className="table-title">xxxxxx ホームページ アクセス分析レポート</div>
      <div className="table-title-bottom"></div>

      <div className="flex top-row">
        <div className="title">サイト名</div>
        <div className="field">医療の何か</div>
      </div>
      <div className="flex">
        <div className="title">サイトURL</div>
        <div className="field">https://iryono.net/</div>
      </div>
      <div className="flex">
        <div className="title">分析期間</div>
        <div className="field">2022-01-01 ~ 2022-05-31</div>
      </div>

      <div className="table-bottom"></div>
    </div>

    <div className="mt-8 table flex-row has-primary-background-color has-background">
      <div className="flex top-row">
        <${CommentRow} title="ユーザー" data="期間合計：35,679人、月平均：2,973人（前年比約16%増）" comment="増加傾向にある（前年同期間：30,654 人、月平均：2,555 人）"/>
      </div>
      <div className="flex">
        <${CommentRow} title="ページビュー" data="期間合計：136,290ページ、月平均：11,358ページ（前年比約29%増）" comment="増加傾向にある（前年同期間：105,280 ページ、月平均：8,773 ページ）"/>
      </div>
      <div className="flex">
        <${CommentRow} title="直帰率" data="約65%" comment="前年同期約66%"/>
      </div>
      <div className="flex">
        <${CommentRow} title="閲覧ページ" data="トップ：39%、メニュー&クーポン：14%、スタッフ（※）：6%、施術の流れ（パーマ編）：6%、施術の流れ（カラー編）：4%、髪質改善とは？：4%、初めての方へ：3%、施術の流れ（トリートメント編）：3%、よくある質問：3%、サイバートリートメント（※）：2%、ブログ：1% 他\n※アクセスエラーが発生しています。" comment=""/>
      </div>
      <div className="flex">
        <${CommentRow} title="<span>地域</span><span>（都道府県）</span>" data="東京：19%、大阪：15%、神奈川：10%、愛知：6%、福岡：5%、埼玉：4%、北海道：4%、兵庫：4%、千葉：3%、他" comment="【前年同期間】大阪：15%、東京：14%、神奈川：13%、愛知：6%、福岡：4%、埼玉：4%、北海道：4%、兵庫：3%、千葉：3%、他"/>
      </div>
      <div className="flex">
        <div className="title"><span>地域</span><span>（特定地域）</span></div>
        <div className="field">T</div>
      </div>
      <div className="flex">
        <div className="title">デバイス</div>
        <div className="field"></div>
      </div>
      <div className="flex">
        <div className="title">流入経路</div>
        <div className="field"></div>
      </div>
      <div className="flex">
        <div className="title"><span>流入</span><span>キーワード</span></div>
        <div className="field"></div>
      </div>
      <div className="flex">
        <div className="title">年齢</div>
        <div className="field"></div>
      </div>
      <div className="flex">
        <div className="title">性別</div>
        <div className="field"></div>
      </div>
      <div className="flex">
        <div className="title">総合分析</div>
        <div className="field">One For All, All For One.</div>
      </div>
      <div className="flex">
        <div className="title">備考</div>
        <div className="field">・各種四捨五入した数値が含まれています。データの性質上、数値に若干の誤差が発生する場合があります。</div>
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

  return html`<${Fragment}>
  <div className="title" dangerouslySetInnerHTML=${{__html: props.title}}></div>
  <div className="field flex-row" onClick=${handleClick}>
    <div className="data">${props.data}</div>
    <div className=${cx({show: props.comment.length > 0, showComment: stateShowComment}, "comment-button")}>🫥</div>
    <div className=${cx({show: stateShowComment}, 'comment')}>${props.comment}</div>
  </div>
  <//>`
}

//
const cssPage = css`

  .flex {
    display: flex;
  }
  .frex-row {
    flex-direction: row;
  }

  .mt-1 {
    margin-top: .25rem;
  }
  .mt-2 {
    margin-top: .5rem;
  }
  .mt-3 {
    margin-top: .75rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-8 {
    margin-top: 2rem;
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
`
