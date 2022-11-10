
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
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
  `
}, [props.title, props.size, props.color])


