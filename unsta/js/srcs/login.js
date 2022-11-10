
// ログインする
export async function main(mainProps, mainID) {
  { const load = await import('../_init_react.js'); await load.default() }
  const app = await import('../app.login.js')
  const root = createRoot(document.getElementById(mainID))
  root.render(React.createElement(app.default, mainProps))
}
