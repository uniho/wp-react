
import {Const, Ref, Style} from './namespaces.js'

// 共通スタイル

// ブレークポイント
Style.breakpoint = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
}

// フォント名
Style.fontFamily = '"Open Sans", Verdana, Roboto, "Droid Sans", "ヒラギノ角ゴ ProN W3", "Hiragino Kaku Gothic ProN", "メイリオ", Meiryo, sans-serif';

Style.greyNum = n => `rgb(${n*16+0x0e},${n*16+0x0e},${n*16+0x0e})`;

// テーマカラー
Style.primary = "var(--wp--preset--color--primary)"; 
Style.primaryDark = "#007fff";
Style.primaryLight = "#a8d3ff";
Style.secondary = "var(--wp--preset--color--secondary)";
Style.secondaryDark = "#7f7fff";
Style.secondaryLight = "#ff5f52";

Style.background = "var(--wp--preset--color--base)"; // 文字の背景色
Style.textColor = "var(--wp--preset--color--contrast)"; // 文字色
Style.textLight = Style.greyNum(0xa); // 薄めの文字色
Style.textDark = "black"; // 濃い目の文字色
Style.textDisable = "rgba(0,0,0,.38)"; // Disable の文字色
Style.textOnPrimary = "white"; // 背景色がprimary時の文字色
Style.textOnSecondary = "white"; // 背景色がsecondary時の文字色
Style.textOnLight = Style.textColor; // 背景色がlight時の文字色
Style.textOnDark = "white"; // 背景色がdark時の文字色

Style.errorColor = "#b00020"; 

Style.greyColor = Style.greyNum(0xa);
Style.greyDark = Style.greyNum(0x7);
Style.greyLight = Style.greyNum(0xd);

// Style.linkColor = 'rgba(' + hexToRgb(Style.primaryLight) + ',.8)';
Style.borderColor = "rgba(0,0,0,.12)"; // divider

// ボタンの色情報を取得
const button = document.querySelector('.wp-element-button')
Style.buttonColor = Style.textOnPrimary
Style.buttonBackground = 'initial'
Style.buttonBackgroundColor = Style.primary
if (button) {
  const style = getComputedStyle(button)
  Style.buttonColor = style.color
  Style.buttonBackground = style.background
  Style.buttonBackgroundColor = style.backgroundColor
}

//
export const cssBase = css`

/* DialogBox など用 */
.modal-desktop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
}

.modal-system {
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, .7);
}

.scroll-lock {
  overflow: hidden;
}

/* button 関係 */

button[class^="btn"] { /* button タグ関係 クラス名の先頭が btn であるものが対象 */
  position: relative;
  cursor: pointer;
  /*text-transform: uppercase;*/
  /*margin-bottom: 10px;*/
  /* background-image: none;
  background-size: 0;
  background-repeat: no-repeat;
  background-position: 50% 50%; */
  padding: 10px 20px;
  display: inline-block;
  /*font-family: Roboto;*/
  border: 0;
}

button.btn--float {
  border-radius:50%;
  width:50px;
  height:50px;
  box-shadow: 0 2px 5px 0 rgba(0,0,0,.14),0 2px 10px 0 rgba(0,0,0,.1);
  background: ${Style.buttonBackground};
  background-color: ${Style.buttonBackgroundColor};
  color: ${Style.buttonColor};
  transition: opacity .3s ease-out;
  will-change: opacity;
  font-family: Roboto;
  font-size:22px;
  padding:0
}

button.btn--flat {
  border-radius: 0;
  color: inherit;
  background-color: inherit;
  border: solid 1px rgba(0, 0, 0, .05);
  box-shadow: none;
  transition: box-shadow .3s ease-out;
  will-change: box-shadow;
}

button.btn--raised {
  border-radius: 2px;
  color: inherit;
  background-color: inherit;
  box-shadow: 0 2px 5px 0 rgba(0,0,0,.14),0 2px 10px 0 rgba(0,0,0,.1);
  transition: color .3s ease-out, background-color .3s ease-out;
  will-change: color, background-color;
}

button.btn--raised2 {
  border-radius: 2px;
  box-shadow: 0 2px 5px 0 rgba(0,0,0,.14),0 2px 10px 0 rgba(0,0,0,.1);
  background: ${Style.buttonBackground};
  background-color: ${Style.buttonBackgroundColor};
  color: ${Style.buttonColor};
  transition: opacity .3s ease-out;
  will-change: opacity;
}

${Const.isTouchDevice ? '' : css`
  button.btn--float:hover {
    opacity: 0.7;
  }

  button.btn--flat:hover {
    box-shadow: 0 2px 5px 0 rgba(0,0,0,.14),0 2px 10px 0 rgba(0,0,0,.1);
  }

  button.btn--raised:hover {
    color: ${Style.buttonColor};
    background-color: ${Style.buttonBackgroundColor};
    opacity: 0.5;
  }

  button.btn--raised2:hover {
    opacity: 0.7;
  }
`}
 
button[class^="btn"]:active, button[class^="btn"]:active:hover {
  box-shadow: none;
}

button:disabled {
  color: ${Style.greyColor};
  background-color: rgba(0,0,0,0);
  cursor:not-allowed;
}

button:hover:disabled {
  background-color: rgba(0,0,0,0);
}

button.btn--flat:hover:disabled {
  box-shadow: none;
}


/* input, textarea, label 関係 */

input:not([type="radio"]):not([type="checkbox"]), textarea {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: thin solid ${Style.textLight};
  border-radius: 0;
  overflow: auto;
  outline: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  font-family : inherit;
  font-size : 100%;
  color: ${Style.textColor};
  background-color: rgba(0,0,0,0);
  resize: none;  
  /*letter-spacing: .04em;*/
  line-height: 1.4;
}

input:not([type="radio"]):not([type="checkbox"]) {
  height: 2rem;
  padding: 0 .5rem;
}

textarea {
  padding: .5rem;
}

input:not([type="radio"]):not([type="checkbox"]):focus, textarea:focus {
  border-color: ${Style.primary};
}

input:not([type="radio"]):not([type="checkbox"]):disabled,
textarea:disabled, 
select:disabled {
  background-color: ${Style.greyLight};
}


/* select 関係 */

select {
  border: thin solid ${Style.textLight};
  border-radius: 0;
  overflow: auto;
  outline: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  font-family : inherit;
  font-size : 100%;
  color: ${Style.textColor};
  background-color: rgba(0,0,0,0);
  resize: none;  
  /*letter-spacing: .04em;*/
  line-height: 1.4;
  cursor: pointer;
  height: 2rem;
  /*padding: 0 .5rem;*/
}

select:focus {
  border-color: ${Style.primary};
}


/* label 関係 */

label {
  color: ${Style.textLight};
}


/* 色指定ボックス */

.text-box {
  color: ${Style.textColor};
  background-color: ${Style.background};
}

.primary-box {
  color: ${Style.textOnPrimary};
  background-color: ${Style.primary};
}

.secondary-box {
  color: ${Style.textOnSecondary};
  background-color: ${Style.secondary};
}


// shadow は tailwind v1 と同じもの(+shadow-sm)にする
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}
.shadow-outline {
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}
.shadow-none {
  box-shadow: none;
}


/* fade-in animation */

.fade-in {
  opacity: 0;
  animation: fade-in 0.5s ease-in-out forwards;
}

@keyframes fade-in {
  0% {opacity: 0;}
  100% {opacity: 1;}
}

.animation-delay0 {
  animation-delay: 0;
}

.animation-delay1 {
  animation-delay: 0.1s;
}

.animation-delay2 {
  animation-delay: 0.2s;
}

.animation-delay3 {
  animation-delay: 0.3s;
}

.animation-delay4 {
  animation-delay: 0.4s;
}

.animation-delay5 {
  animation-delay: 0.5s;
}

`
