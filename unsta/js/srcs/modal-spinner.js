
// モーダルスピナー

export async function main(mainProps, mainID) {
  { const load = await import('../_init_react.js'); await load.default() }
  const {ModalSpinner} = await import('../parts.spinner.js')

  const App = props => html`
    <${ModalSpinner} ref=${e => window.modalSpinner = e} />
  `

  const root = ReactDOM.createRoot(document.getElementById(mainID))
  root.render(React.createElement(App))
}
