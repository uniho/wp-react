
export default props => React.useMemo(() => {
  const size = props.size || "1rem"
  const style = Object.assign({
    height: size, width: size,
    fill: "none",
    stroke: props.color || "currentColor",
    strokeWidth: props.strokeWidth || 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }, props.style)
  return html`
  <svg
    style=${style}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <title>${props.title}</title>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
  `
}, [props.title, props.size, props.color])


