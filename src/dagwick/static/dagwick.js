var DagwickBundle=(function(a,p){"use strict";const S="Dagwick",Z="0.2.0",ka="/dagwick/api",fa="dagwick";async function $(i,e,r){const c=new URL(`${ka}${i}`,document.baseURI);for(const[n,s]of Object.entries(e))c.searchParams.set(n,s);const d=await fetch(c,{signal:r,credentials:"same-origin"});if(!d.ok){let n=`HTTP ${d.status}`;try{const s=await d.json();typeof s?.detail=="string"&&(n=s.detail)}catch{}throw new Error(n)}return d.json()}const ha=(i,e)=>$("/score",{dag_id:i},e),ba=i=>$("/fleet",{},i),xa=i=>$("/config",{},i);function P(i,e){const[r,c]=p.useState(),[d,n]=p.useState(),[s,l]=p.useState(!0),[h,y]=p.useState(0);p.useEffect(()=>{const x=new AbortController;return l(!0),n(void 0),i(x.signal).then(c).catch(u=>{x.signal.aborted||n(u instanceof Error?u.message:String(u))}).finally(()=>!x.signal.aborted&&l(!1)),()=>x.abort()},[...e,h]);const b=p.useCallback(()=>y(x=>x+1),[]);return{data:r,error:d,loading:s,reload:b}}function ma(i){return{A:"radiant",B:"happy",C:"calm",D:"worried",F:"out"}[i]}function F({mood:i,size:e=150,season:r}){const c={radiant:1.15,happy:1,calm:.8,worried:.55,out:0}[i]*(r==="newroz"?1.25:1),d=i!=="out";return a.jsxs("svg",{className:`dagwick-lamp dagwick-lamp--${i}`,width:e,height:e,viewBox:"0 0 160 160",role:"img","aria-label":d?`Lantern is ${i}`:"Lantern has gone out",children:[a.jsxs("defs",{children:[a.jsxs("radialGradient",{id:"dagwick-glow",cx:"50%",cy:"50%",r:"50%",children:[a.jsx("stop",{offset:"0%",stopColor:"var(--dagwick-flame-core)",stopOpacity:"0.6"}),a.jsx("stop",{offset:"55%",stopColor:"var(--dagwick-flame)",stopOpacity:"0.2"}),a.jsx("stop",{offset:"100%",stopColor:"var(--dagwick-flame)",stopOpacity:"0"})]}),a.jsxs("linearGradient",{id:"dagwick-flame-grad",x1:"0",y1:"1",x2:"0",y2:"0",children:[a.jsx("stop",{offset:"0%",stopColor:"var(--dagwick-flame-deep)"}),a.jsx("stop",{offset:"55%",stopColor:"var(--dagwick-flame)"}),a.jsx("stop",{offset:"100%",stopColor:"var(--dagwick-flame-core)"})]}),a.jsxs("linearGradient",{id:"dagwick-metal",x1:"0",y1:"0",x2:"1",y2:"0",children:[a.jsx("stop",{offset:"0%",stopColor:"var(--dagwick-metal-dark)"}),a.jsx("stop",{offset:"45%",stopColor:"var(--dagwick-metal)"}),a.jsx("stop",{offset:"100%",stopColor:"var(--dagwick-metal-dark)"})]}),a.jsxs("linearGradient",{id:"dagwick-glass",x1:"0",y1:"0",x2:"1",y2:"0",children:[a.jsx("stop",{offset:"0%",stopColor:"var(--dagwick-glass)",stopOpacity:"0.35"}),a.jsx("stop",{offset:"30%",stopColor:"var(--dagwick-glass)",stopOpacity:"0.08"}),a.jsx("stop",{offset:"100%",stopColor:"var(--dagwick-glass)",stopOpacity:"0.22"})]})]}),a.jsx("ellipse",{cx:"80",cy:"146",rx:"44",ry:"5",fill:"var(--dagwick-shadow)"}),r&&a.jsx(ua,{season:r}),d&&a.jsx("circle",{className:"dagwick-glow",cx:"80",cy:"88",r:44*c+16,fill:"url(#dagwick-glow)"}),i==="radiant"&&a.jsxs("g",{className:"dagwick-sparkles",fill:"var(--dagwick-flame-core)",children:[a.jsx("path",{d:"M128 52 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"}),a.jsx("path",{d:"M30 70 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z"}),a.jsx("path",{d:"M132 100 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2z"})]}),a.jsxs("g",{className:"dagwick-body",children:[a.jsx("path",{d:"M56 50 C 56 16, 104 16, 104 50",fill:"none",stroke:"var(--dagwick-metal-dark)",strokeWidth:"4",strokeLinecap:"round"}),a.jsx("circle",{cx:"80",cy:"24",r:"5",fill:"none",stroke:"var(--dagwick-metal-dark)",strokeWidth:"3.5"}),a.jsx("path",{d:"M62 44 L98 44 L110 58 L50 58 Z",fill:"url(#dagwick-metal)"}),a.jsx("rect",{x:"70",y:"38",width:"20",height:"7",rx:"2",fill:"var(--dagwick-metal-dark)"}),d&&a.jsxs("g",{className:"dagwick-flame",style:{transform:`scale(${c})`},children:[a.jsx("path",{d:"M80 106 C 67 98, 71 82, 80 68 C 82 79, 93 86, 89 97 C 87 102, 84 105, 80 106 Z",fill:"url(#dagwick-flame-grad)"}),a.jsx("path",{d:"M80 104 C 75 99, 77 92, 80 86 C 81 92, 86 95, 84 99 C 83 102, 81 103, 80 104 Z",fill:"var(--dagwick-flame-core)"})]}),a.jsx("path",{d:"M70 114 L90 114 L87 106 L73 106 Z",fill:"var(--dagwick-metal-dark)"}),a.jsx("path",{d:"M80 106 L80 102",stroke:"var(--dagwick-wick)",strokeWidth:"2.5",strokeLinecap:"round"}),a.jsx("path",{d:"M58 58 C 40 72, 40 100, 58 114 L102 114 C 120 100, 120 72, 102 58 Z",fill:"url(#dagwick-glass)",stroke:"var(--dagwick-glass-edge)",strokeWidth:"1.5"}),a.jsx("path",{d:"M54 72 C 50 82, 50 92, 54 102",fill:"none",stroke:"var(--dagwick-glass)",strokeOpacity:"0.55",strokeWidth:"3",strokeLinecap:"round"}),a.jsx("path",{d:"M66 58 C 58 76, 58 96, 66 114",fill:"none",stroke:"var(--dagwick-metal-dark)",strokeWidth:"2.5"}),a.jsx("path",{d:"M94 58 C 102 76, 102 96, 94 114",fill:"none",stroke:"var(--dagwick-metal-dark)",strokeWidth:"2.5"}),a.jsx("path",{d:"M48 114 L112 114 L116 134 C 116 141, 44 141, 44 134 Z",fill:"url(#dagwick-metal)"}),a.jsx("rect",{x:"44",y:"132",width:"72",height:"5",rx:"2.5",fill:"var(--dagwick-metal-dark)",opacity:"0.6"}),a.jsx(va,{mood:i})]}),r&&a.jsx(ya,{season:r}),!d&&a.jsx("g",{className:"dagwick-smoke",fill:"none",stroke:"var(--dagwick-smoke)",strokeWidth:"3",strokeLinecap:"round",children:a.jsx("path",{d:"M80 36 C 72 28, 88 22, 80 14 C 72 6, 88 0, 82 -6"})})]})}function va({mood:i}){const r="var(--dagwick-ink)",c={radiant:"M73 127 Q 80 134 87 127",happy:"M74 128 Q 80 132 86 128",calm:"M75 129 L 85 129",worried:"M74 131 Q 80 126 86 131",out:"M75 131 Q 80 128 85 131"}[i];return a.jsxs("g",{className:"dagwick-face",children:[i==="radiant"||i==="happy"?a.jsxs(a.Fragment,{children:[a.jsx("path",{d:"M65 122 q4 -4.5 8 0",stroke:r,strokeWidth:"2.6",fill:"none",strokeLinecap:"round"}),a.jsx("path",{d:"M87 122 q4 -4.5 8 0",stroke:r,strokeWidth:"2.6",fill:"none",strokeLinecap:"round"})]}):i==="out"?a.jsxs(a.Fragment,{children:[a.jsx("path",{d:"M65 121 l8 2",stroke:r,strokeWidth:"2.6",strokeLinecap:"round"}),a.jsx("path",{d:"M87 123 l8 -2",stroke:r,strokeWidth:"2.6",strokeLinecap:"round"})]}):a.jsxs("g",{className:"dagwick-eyes",children:[a.jsx("circle",{cx:"69",cy:122,r:"3",fill:r}),a.jsx("circle",{cx:"91",cy:122,r:"3",fill:r})]}),a.jsx("path",{d:c,stroke:r,strokeWidth:"2.6",fill:"none",strokeLinecap:"round"}),(i==="radiant"||i==="happy")&&a.jsxs(a.Fragment,{children:[a.jsx("circle",{cx:"60",cy:"127",r:"3.5",fill:"var(--dagwick-blush)"}),a.jsx("circle",{cx:"100",cy:"127",r:"3.5",fill:"var(--dagwick-blush)"})]}),i==="worried"&&a.jsx("path",{d:"M100 116 q3 5 0 8 q-3 -3 0 -8z",fill:"var(--dagwick-tear)"})]})}function ua({season:i}){return i==="ramadan"||i==="eid"?a.jsxs("g",{fill:"#fde68a",children:[a.jsx("path",{d:"M128 4 a15 15 0 1 0 13 24 a12 12 0 1 1 -13 -24z"}),a.jsx("path",{d:"M148 40 l1.5 4 4.3 .2 -3.4 2.6 1.2 4.2 -3.6 -2.4 -3.6 2.4 1.2 -4.2 -3.4 -2.6 4.3 -.2z"})]}):null}function ya({season:i}){switch(i){case"christmas":return a.jsxs("g",{className:"dagwick-acc",children:[a.jsx("path",{d:"M54 40 C 60 10, 96 2, 124 18 C 112 16, 104 22, 106 40 Z",fill:"#dc2626"}),a.jsx("circle",{cx:"126",cy:"19",r:"7",fill:"#fff"}),a.jsx("rect",{x:"48",y:"36",width:"64",height:"12",rx:"6",fill:"#fff"}),a.jsx("path",{d:"M48 114 q6 -5 12 0 q6 -5 12 0 q6 -5 12 0 q6 -5 12 0 q6 -5 16 0 Z",fill:"#fff"}),a.jsxs("g",{transform:"translate(104 117)",children:[a.jsx("path",{d:"M0 0 q6 -8 12 -2 q-6 0 -12 2z",fill:"#16a34a"}),a.jsx("path",{d:"M0 0 q-2 -10 6 -12 q-2 6 -6 12z",fill:"#15803d"}),a.jsx("circle",{cx:"1",cy:"-1",r:"2.4",fill:"#dc2626"}),a.jsx("circle",{cx:"4.5",cy:"1",r:"2.2",fill:"#ef4444"})]})]});case"new-year":case"birthday":return a.jsxs("g",{className:"dagwick-acc",transform:"rotate(-12 80 40)",children:[a.jsx("polygon",{points:"68,42 92,42 80,2",fill:i==="birthday"?"#ec4899":"#7c3aed"}),a.jsx("path",{d:"M71 34 L89 34 M74 24 L86 24 M77 14 L83 14",stroke:"#fde047",strokeWidth:"3"}),a.jsx("circle",{cx:"80",cy:"2",r:"4.5",fill:i==="birthday"?"#60a5fa":"#f472b6"})]});case"newroz":return a.jsxs("g",{className:"dagwick-acc",children:[a.jsx("path",{d:"M66 44 q4 -7 8 -2 M94 44 q-4 -7 -8 -2",stroke:"#22c55e",strokeWidth:"2",fill:"none"}),a.jsx("circle",{cx:"60",cy:"43",r:"5",fill:"#f9a8d4"}),a.jsx("circle",{cx:"60",cy:"43",r:"2",fill:"#fde047"}),a.jsx("circle",{cx:"80",cy:"37",r:"5.5",fill:"#fef08a"}),a.jsx("circle",{cx:"80",cy:"37",r:"2.2",fill:"#f97316"}),a.jsx("circle",{cx:"100",cy:"43",r:"5",fill:"#ffffff"}),a.jsx("circle",{cx:"100",cy:"43",r:"2",fill:"#fde047"})]});case"halloween":return a.jsxs("g",{className:"dagwick-acc dagwick-spider",children:[a.jsx("path",{d:"M104 58 L112 84",stroke:"#d8d0e8",strokeWidth:".8"}),a.jsx("circle",{cx:"112",cy:"87",r:"3.4",fill:"#1a1024"}),a.jsx("path",{d:"M108 85 l-4 -2 M108 88 l-4 1 M116 85 l4 -2 M116 88 l4 1",stroke:"#1a1024",strokeWidth:"1"})]});case"eid":return a.jsxs("g",{className:"dagwick-acc",children:[a.jsx("ellipse",{cx:"128",cy:"141",rx:"20",ry:"4",fill:"#e5e7eb"}),[[118,135],[130,133],[140,137]].map(([e,r],c)=>a.jsxs("g",{children:[a.jsx("circle",{cx:e,cy:r,r:"6.5",fill:"#c98b4a",stroke:"#8a5a2b",strokeWidth:"1"}),a.jsx("path",{d:`M${e-3.5} ${r} a3.5 3.5 0 1 1 7 0`,fill:"none",stroke:"#8a5a2b",strokeWidth:"1"}),a.jsx("circle",{cx:e,cy:r,r:"1.2",fill:"#8a5a2b"})]},c))]});case"language-day":return a.jsxs("g",{className:"dagwick-acc",children:[a.jsx("rect",{x:"114",y:"104",width:"30",height:"24",rx:"3",fill:"#fff7e6",stroke:"#c9a46b"}),a.jsx("rect",{x:"112",y:"102",width:"34",height:"5",rx:"2.5",fill:"#e9d3a7"}),a.jsx("rect",{x:"112",y:"125",width:"34",height:"5",rx:"2.5",fill:"#e9d3a7"}),a.jsx("text",{x:"129",y:"122",textAnchor:"middle",fontSize:"15",fill:"#7c2d12",fontWeight:"700",children:"ک"})]});default:return null}}const U=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1;function Na(i,e=900){const[r,c]=p.useState(U()?i:0),d=p.useRef(0);return p.useEffect(()=>{if(U())return c(i);const n=performance.now(),s=d.current;let l=0;const h=b=>{const x=Math.min(1,(b-n)/e);c(s+(i-s)*(1-Math.pow(1-x,3))),x<1?l=requestAnimationFrame(h):d.current=i};l=requestAnimationFrame(h);const y=setTimeout(()=>{cancelAnimationFrame(l),d.current=i,c(i)},e+100);return()=>{cancelAnimationFrame(l),clearTimeout(y)}},[i,e]),r}function Q({score:i,grade:e}){const r=Na(i),c=52,d=2*Math.PI*c;return a.jsxs("div",{className:`dagwick-ring dagwick-grade-${e}`,"aria-label":`Score ${i} out of 100, grade ${e}`,children:[a.jsxs("svg",{width:"132",height:"132",viewBox:"0 0 132 132",children:[a.jsx("circle",{cx:"66",cy:"66",r:c,className:"dagwick-ring-track"}),a.jsx("circle",{cx:"66",cy:"66",r:c,className:"dagwick-ring-fill",strokeDasharray:d,strokeDashoffset:d*(1-r/100),transform:"rotate(-90 66 66)"})]}),a.jsxs("div",{className:"dagwick-ring-label",children:[a.jsx("span",{className:"dagwick-grade",children:e}),a.jsx("span",{className:"dagwick-score",children:Math.floor(r)})]})]})}function Ma({code:i}){const[e,r]=p.useState(!1),c=async()=>{try{await navigator.clipboard.writeText(i),r(!0),setTimeout(()=>r(!1),1500)}catch{}};return a.jsxs("div",{className:"dagwick-code",children:[a.jsx("pre",{children:a.jsx("code",{children:i})}),a.jsx("button",{className:"dagwick-copy",onClick:c,"aria-label":"Copy code",children:e?"Copied ✓":"Copy"})]})}const Ca={A:"I'm glowing! ✨",B:"Nice and warm.",C:"A little more oil?",D:"I'm flickering…",F:"It's dark in here."};function X({grade:i,size:e=150,season:r}){return a.jsxs("div",{className:"dagwick-mascot",children:[a.jsx("div",{className:"dagwick-bubble",children:Ca[i]}),a.jsx(F,{mood:ma(i),size:e,season:r})]})}function E({title:i,body:e,action:r}){return a.jsxs("div",{className:"dagwick-empty",children:[a.jsx(F,{mood:"out",size:110}),a.jsx("h3",{children:i}),a.jsx("p",{className:"dagwick-muted",children:e}),r]})}function V({label:i="Lighting the lamp…"}){return a.jsxs("div",{className:"dagwick-empty",children:[a.jsx(F,{mood:"calm",size:110}),a.jsx("p",{className:"dagwick-muted",children:i})]})}function K({grade:i,size:e="md"}){return a.jsx("span",{className:`dagwick-badge dagwick-badge--${i} dagwick-badge--${e}`,children:i})}function La({score:i,grade:e}){const c=2*Math.PI*18;return a.jsxs("div",{className:`dagwick-mini dagwick-grade-${e}`,"aria-label":`Score ${i}, grade ${e}`,children:[a.jsxs("svg",{width:"46",height:"46",viewBox:"0 0 46 46",children:[a.jsx("circle",{cx:"23",cy:"23",r:18,className:"dagwick-ring-track"}),a.jsx("circle",{cx:"23",cy:"23",r:18,className:"dagwick-ring-fill",strokeDasharray:c,strokeDashoffset:c*(1-i/100),transform:"rotate(-90 23 23)"})]}),a.jsx("span",{children:Math.floor(i)})]})}function Sa({dagId:i,children:e,className:r}){const c=globalThis.ReactRouterDOM?.Link,d=`/dags/${encodeURIComponent(i)}/plugin/${fa}`;return c?a.jsx(c,{to:d,className:r,children:e}):a.jsx("a",{href:new URL(d.slice(1),document.baseURI).href,className:r,children:e})}const J=i=>a.jsxs("div",{className:"dagwick-eyebrow",children:[a.jsx("span",{className:"dagwick-brand",children:S})," · ",i]}),g=(i,e=0)=>{const r=Math.sin(i*12.9898+e*78.233)*43758.5453;return r-Math.floor(r)},v=i=>Array.from({length:i},(e,r)=>r),m=i=>`${(i*100).toFixed(1)}%`,k=i=>`${i.toFixed(2)}s`,M=["#f472b6","#60a5fa","#fde047","#4ade80","#c084fc","#fb923c"],j=["#ef4444","#f59e0b","#22c55e","#3b82f6","#ec4899","#a855f7","#14b8a6"],R=["ڕ","ڵ","ڤ","ێ","ۆ","ژ","چ","گ","پ","ê","î","û","ş","ç","x","Kurdî","کوردی"];function Da(){return a.jsxs(a.Fragment,{children:[v(28).map(i=>a.jsx("span",{className:"dagwick-flake",style:{left:m(g(i,1)),width:3+g(i,2)*5,height:3+g(i,2)*5,opacity:.5+g(i,3)*.5,animationDuration:`${k(6+g(i,4)*7)}, ${k(2.5+g(i,5)*2)}`,animationDelay:`${k(-g(i,6)*12)}, ${k(-g(i,7)*3)}`}},i)),a.jsx("svg",{className:"dagwick-snowbank",viewBox:"0 0 400 20",preserveAspectRatio:"none",children:a.jsx("path",{d:"M0 20 V10 Q20 2 45 9 T95 8 T150 10 T205 7 T260 10 T320 6 T400 9 V20 Z"})})]})}function za({style:i}){return a.jsx("span",{className:"dagwick-bat",style:i,children:a.jsx("span",{className:"dagwick-bat-bob",children:a.jsxs("svg",{viewBox:"0 0 40 20",width:"34",height:"17",children:[a.jsx("g",{className:"dagwick-wing-l",children:a.jsx("path",{d:"M20 9 C 14 2, 6 2, 0 6 C 5 7, 7 10, 6 13 C 10 10, 14 11, 20 12 Z"})}),a.jsx("g",{className:"dagwick-wing-r",children:a.jsx("path",{d:"M20 9 C 26 2, 34 2, 40 6 C 35 7, 33 10, 34 13 C 30 10, 26 11, 20 12 Z"})}),a.jsx("ellipse",{cx:"20",cy:"10.5",rx:"3",ry:"4"}),a.jsx("path",{d:"M18 7 l-1 -3 2 2 M22 7 l1 -3 -2 2"})]})})})}function Aa(){return a.jsxs(a.Fragment,{children:[a.jsx("span",{className:"dagwick-moon"}),v(7).map(i=>a.jsx(za,{style:{top:m(.06+g(i,1)*.55),transform:`scale(${.6+g(i,2)*.7})`,animationDuration:k(9+g(i,3)*8),animationDelay:k(-g(i,4)*16)}},i))]})}function aa({n:i=30}){return a.jsx(a.Fragment,{children:v(i).map(e=>a.jsx("span",{className:"dagwick-confetti",style:{left:m(g(e,1)),background:M[e%M.length],animationDuration:`${k(4+g(e,2)*5)}, ${k(1+g(e,3)*2)}`,animationDelay:`${k(-g(e,4)*9)}, 0s`}},e))})}function $a(){return a.jsx(a.Fragment,{children:[{left:"12%",top:"18%",color:"#f472b6",delay:0},{left:"82%",top:"14%",color:"#60a5fa",delay:1.1},{left:"64%",top:"30%",color:"#fde047",delay:2.2}].map((i,e)=>a.jsx("span",{className:"dagwick-firework",style:{left:i.left,top:i.top,animationDelay:k(i.delay)},children:v(12).map(r=>a.jsx("i",{style:{background:i.color,transform:`rotate(${r*30}deg) translateY(-26px)`}},r))},e))})}function Fa(){return a.jsx(a.Fragment,{children:v(5).map(i=>a.jsx("span",{className:"dagwick-balloon",style:{left:m(.08+g(i,1)*.84),background:M[i%M.length],animationDuration:k(10+g(i,2)*6),animationDelay:k(-g(i,3)*14)}},i))})}function Ea(){return a.jsxs(a.Fragment,{children:[v(18).map(i=>a.jsx("span",{className:"dagwick-ember",style:{left:m(.05+g(i,1)*.9),animationDuration:k(4+g(i,2)*4),animationDelay:k(-g(i,3)*8)}},i)),a.jsxs("svg",{className:"dagwick-mountains",viewBox:"0 0 800 120",preserveAspectRatio:"none",children:[a.jsx("path",{className:"far",d:"M0 120 L0 70 L90 30 L170 66 L260 18 L360 64 L450 26 L560 70 L650 22 L740 60 L800 40 L800 120 Z"}),a.jsx("path",{className:"near",d:"M0 120 L0 92 L120 58 L220 90 L330 54 L440 92 L560 60 L690 94 L800 64 L800 120 Z"})]}),[[.325,.6],[.5625,.638],[.8125,.61]].map(([i,e],r)=>a.jsx("span",{className:"dagwick-fire",style:{left:m(i),top:m(e),animationDelay:k(r*.3)}},r)),a.jsx("div",{className:"dagwick-govend",children:v(9).map(i=>a.jsx("span",{className:"dagwick-dancer",style:{animationDelay:k(i*.18)},children:a.jsxs("svg",{viewBox:"0 0 20 36",width:"22",height:"40",children:[a.jsx("circle",{cx:"10",cy:"5",r:"4",fill:"#f1d3b3"}),a.jsx("path",{d:"M6 3 Q10 -1 14 3 L14 5 L6 5 Z",fill:i%2?"#1f2937":"#7c2d12"}),a.jsx("path",{d:"M10 9 L3 32 L17 32 Z",fill:j[i%j.length]}),a.jsx("path",{d:"M7 32 L7 35 M13 32 L13 35",stroke:"#1f2937",strokeWidth:"1.6"}),a.jsx("path",{d:"M-1 15 L21 15",stroke:"#f1d3b3",strokeWidth:"2",strokeLinecap:"round"}),i===0&&a.jsx("path",{d:"M-1 15 L-5 6 L1 9 Z",fill:"#facc15"})]})},i))})]})}function ia({n:i=22}){return a.jsx(a.Fragment,{children:v(i).map(e=>a.jsx("span",{className:"dagwick-star",style:{left:m(g(e,1)),top:m(g(e,2)*.7),animationDelay:k(-g(e,3)*3),animationDuration:k(2+g(e,4)*2.5)}},e))})}function Ta(){return a.jsx("div",{className:"dagwick-hanging",children:[.2,.55,.85].map((i,e)=>a.jsx("span",{style:{left:m(i),height:26+e*14,animationDelay:k(e*.6)},children:a.jsxs("svg",{viewBox:"0 0 16 26",width:"16",height:"26",children:[a.jsx("path",{d:"M8 0 L8 4",stroke:"#e9c46a"}),a.jsx("path",{d:"M3 6 L13 6 L11 4 L5 4 Z",fill:"#e9c46a"}),a.jsx("path",{d:"M3 6 Q0 13 3 20 L13 20 Q16 13 13 6 Z",fill:"#fbbf24",opacity:".85"}),a.jsx("path",{d:"M4 20 L12 20 L10 23 L6 23 Z",fill:"#e9c46a"})]})},e))})}function Ba(){return a.jsxs("svg",{className:"dagwick-bunting",viewBox:"0 0 800 40",preserveAspectRatio:"none",children:[a.jsx("path",{d:"M0 4 Q400 34 800 4",fill:"none",stroke:"#e9c46a",strokeWidth:"1.5"}),v(16).map(i=>{const e=25+i*48,r=4+30*(1-((e-400)/400)**2)*.95;return a.jsx("path",{d:`M${e-10} ${r} L${e+10} ${r} L${e} ${r+16} Z`,fill:M[i%M.length]},i)})]})}function Ga(){return a.jsx(a.Fragment,{children:v(16).map(i=>a.jsx("span",{className:"dagwick-letter",style:{left:m(.04+g(i,1)*.92),fontSize:13+g(i,2)*11,animationDuration:k(7+g(i,3)*6),animationDelay:k(-g(i,4)*12)},children:R[i%R.length]},i))})}const Oa={christmas:()=>a.jsx(Da,{}),halloween:()=>a.jsx(Aa,{}),"new-year":()=>a.jsxs(a.Fragment,{children:[a.jsx($a,{}),a.jsx(aa,{})]}),birthday:()=>a.jsxs(a.Fragment,{children:[a.jsx(Fa,{}),a.jsx(aa,{n:18})]}),newroz:()=>a.jsx(Ea,{}),ramadan:()=>a.jsxs(a.Fragment,{children:[a.jsx(ia,{}),a.jsx(Ta,{})]}),eid:()=>a.jsxs(a.Fragment,{children:[a.jsx(Ba,{}),a.jsx(ia,{n:14})]}),"language-day":()=>a.jsx(Ga,{})};function ea({season:i}){return i?a.jsx("div",{className:`dagwick-fx dagwick-fx--${i.id}`,"aria-hidden":"true",children:Oa[i.id]()}):null}function ra({state:i}){const{season:e,available:r,hidden:c,setHidden:d}=i;return e?a.jsxs("div",{className:"dagwick-greeting",children:[a.jsx("span",{"aria-hidden":"true",children:e.icon}),a.jsx("span",{children:e.greeting}),a.jsx("button",{className:"dagwick-greeting-hide",onClick:()=>d(!0),title:"Hide seasonal decorations",children:"Hide"})]}):r&&c?a.jsxs("button",{className:"dagwick-greeting-show",onClick:()=>d(!1),children:[r.icon," Show the ",r.name," mood"]}):null}const T={eid:{id:"eid",name:"Eid",greeting:"Eid Mubarak!",icon:"🍪"},newroz:{id:"newroz",name:"Newroz",greeting:"Happy Newroz!",icon:"🔥"},"language-day":{id:"language-day",name:"Kurdish Language Day",greeting:"Kurdish Language Day",icon:"✍️"},christmas:{id:"christmas",name:"Christmas",greeting:"Merry Christmas!",icon:"🎄"},"new-year":{id:"new-year",name:"New Year",greeting:"Happy New Year!",icon:"🎉"},halloween:{id:"halloween",name:"Halloween",greeting:"Happy Halloween!",icon:"🎃"},ramadan:{id:"ramadan",name:"Ramadan",greeting:"Ramadan Kareem",icon:"🌙"},birthday:{id:"birthday",name:"Dagwick's birthday",greeting:"Dagwick turns another year older!",icon:"🎂"}},ca=["newroz","eid","language-day","christmas","new-year","halloween","ramadan","birthday"],D=(i,e,r,c)=>{const d=i*100+e,n=r[0]*100+r[1],s=c[0]*100+c[1];return n<=s?d>=n&&d<=s:d>=n||d<=s};function da(i){try{const e=new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura",{month:"numeric",day:"numeric"}).formatToParts(i),r=Number(e.find(d=>d.type==="month")?.value),c=Number(e.find(d=>d.type==="day")?.value);return r&&c?{month:r,day:c}:void 0}catch{return}}const _a={eid:i=>{const e=da(i);return!!e&&(e.month===10&&e.day<=3||e.month===12&&e.day>=10&&e.day<=13)},newroz:i=>D(i.getMonth()+1,i.getDate(),[3,19],[3,23]),"language-day":i=>i.getMonth()+1===5&&i.getDate()===15,christmas:i=>D(i.getMonth()+1,i.getDate(),[12,18],[12,26]),"new-year":i=>D(i.getMonth()+1,i.getDate(),[12,31],[1,2]),halloween:i=>D(i.getMonth()+1,i.getDate(),[10,24],[11,1]),ramadan:i=>da(i)?.month===9,birthday:i=>i.getMonth()+1===11&&i.getDate()===8};function Ya(i,e="auto"){if(e==="off")return;const c=(e==="auto"?ca:ca.filter(d=>e.includes(d))).find(d=>_a[d](i));return c?T[c]:void 0}function oa(i){return!!i&&i in T}const B="dagwick.moods.hidden";function Ia(){try{return window.localStorage.getItem(B)==="1"}catch{return!1}}function Wa(i){try{i?window.localStorage.setItem(B,"1"):window.localStorage.removeItem(B)}catch{}}function Ha(){const i=new URLSearchParams(window.location.search).get("dagwick_mood");return i==="everyday"?null:oa(i)?T[i]:void 0}function ta(){const[i]=p.useState(Ha),[e,r]=p.useState(()=>i??void 0),[c,d]=p.useState(Ia);return p.useEffect(()=>{if(i!==void 0)return;const s=new AbortController;return xa(s.signal).then(l=>{const h=l.seasonal_moods==="auto"||l.seasonal_moods==="off"?l.seasonal_moods:l.seasonal_moods.filter(oa);r(Ya(new Date,h))}).catch(()=>{}),()=>s.abort()},[i]),{season:c?void 0:e,available:e,hidden:c,setHidden:s=>{Wa(s),d(s)}}}const z={reliability:"Reliability",observability:"Observability",scheduling:"Scheduling",ownership:"Ownership",structure:"Structure",performance:"Performance"},sa={fail:0,warn:1,pass:2,skip:3},qa={A:"Shining bright. This DAG is in great shape.",B:"A steady flame. A few small things to polish.",C:"Burning, but dimly. Some important habits are missing.",D:"Flickering. This DAG needs attention soon.",F:"The lamp has gone out. Start with the red items below."},Za=[["A",90],["B",75],["C",60],["D",40]],C=i=>i.weight-i.points,na=(i,e)=>sa[i.status]-sa[e.status]||C(e)-C(i);function Pa({dagId:i}){const{data:e,error:r,reload:c}=P(d=>ha(i,d),[i]);return r?a.jsx(E,{title:"Couldn't check this DAG",body:r,action:a.jsx("button",{className:"dagwick-btn",onClick:c,children:"Try again"})}):e?a.jsx(Qa,{report:e},e.dag_id):a.jsx(V,{})}function Ua(i){const e=[...Za].reverse().find(([,l])=>l>i.score);if(!e)return;const[r,c]=e;let d=c/100*i.max_points-i.points;const n=[],s=i.checks.filter(l=>l.status==="fail"||l.status==="warn").sort((l,h)=>C(h)-C(l));for(const l of s){if(d<=1e-9)break;n.push(l),d-=C(l)}return d<=1e-9?{grade:r,picks:n}:void 0}function Qa({report:i}){const e=ta(),r=e.season,c=i.counts.fail+i.counts.warn,[d,n]=p.useState(c?"attention":"all"),[s,l]=p.useState(()=>new Set(i.checks.filter(t=>t.fix).sort(na).slice(0,2).map(t=>t.id))),h=t=>l(N=>{const L=new Set(N);return L.delete(t)||L.add(t),L}),y=p.useMemo(()=>Ka(i.checks),[i]),b=p.useMemo(()=>Ua(i),[i]),x=p.useMemo(()=>i.checks.filter(t=>d==="all"?!0:d==="passed"?t.status==="pass":t.status==="fail"||t.status==="warn").sort(na),[i,d]),u=t=>{n("attention"),l(N=>new Set(N).add(t)),requestAnimationFrame(()=>document.getElementById(`dagwick-check-${t}`)?.scrollIntoView({behavior:"smooth",block:"center"}))};return a.jsxs(a.Fragment,{children:[a.jsxs("section",{className:`dagwick-hero dagwick-grade-${i.grade}${r?` dagwick-season dagwick-season-${r.id}`:""}`,children:[a.jsx(ea,{season:r}),a.jsx(X,{grade:i.grade,season:r?.id}),a.jsxs("div",{className:"dagwick-hero-text",children:[a.jsx(ra,{state:e}),J("DAG health"),a.jsx("h2",{className:"dagwick-dag",children:i.dag_id}),a.jsx("p",{className:"dagwick-headline",children:qa[i.grade]}),a.jsxs("div",{className:"dagwick-chips",children:[a.jsx(O,{status:"pass",n:i.counts.pass,label:"passing"}),a.jsx(O,{status:"warn",n:i.counts.warn,label:"to improve"}),a.jsx(O,{status:"fail",n:i.counts.fail,label:"failing"})]})]}),a.jsx("div",{className:"dagwick-hero-side",children:a.jsx(Q,{score:i.score,grade:i.grade})})]}),b?a.jsxs("section",{className:"dagwick-goal",children:[a.jsxs("div",{className:"dagwick-goal-text",children:[a.jsx("span",{className:"dagwick-goal-step",children:"Next step"}),"Fix ",b.picks.length===1?"this check":`these ${b.picks.length} checks`," to reach"," ",a.jsx("span",{className:`dagwick-badge dagwick-badge--${b.grade}`,children:b.grade})]}),a.jsx("div",{className:"dagwick-goal-picks",children:b.picks.map(t=>a.jsxs("button",{className:"dagwick-pick",onClick:()=>u(t.id),children:[t.title," ",a.jsxs("span",{className:"dagwick-pick-gain",children:["+",C(t).toFixed(t.points%1?1:0)]})]},t.id))})]}):i.score<100?a.jsx("section",{className:"dagwick-goal dagwick-goal--top",children:a.jsxs("div",{className:"dagwick-goal-text",children:[a.jsx("span",{className:"dagwick-goal-step",children:"Top grade"})," Polish the last ",c," item",c===1?"":"s"," for a perfect 100."]})}):null,a.jsx("section",{className:"dagwick-cats","aria-label":"Score by category",children:y.map(t=>a.jsxs("div",{className:"dagwick-cat",children:[a.jsxs("div",{className:"dagwick-cat-head",children:[a.jsx("span",{children:z[t.id]??t.id}),a.jsxs("span",{className:"dagwick-muted",children:[Math.round(t.pct),"%"]})]}),a.jsx("div",{className:"dagwick-bar",children:a.jsx("div",{className:"dagwick-bar-fill",style:{width:`${t.pct}%`,background:Ja(t.pct)}})})]},t.id))}),a.jsxs("section",{className:"dagwick-list",children:[a.jsxs("div",{className:"dagwick-tabs",role:"tablist",children:[a.jsxs(_,{active:d==="attention",onClick:()=>n("attention"),children:["Needs attention ",a.jsx("span",{className:"dagwick-count",children:c})]}),a.jsxs(_,{active:d==="all",onClick:()=>n("all"),children:["All checks ",a.jsx("span",{className:"dagwick-count",children:i.checks.length})]}),a.jsxs(_,{active:d==="passed",onClick:()=>n("passed"),children:["Passed ",a.jsx("span",{className:"dagwick-count",children:i.counts.pass})]})]}),x.length===0?a.jsx("div",{className:"dagwick-clear",children:"Nothing here. Every check in this view is passing. ✨"}):a.jsx("ul",{className:"dagwick-checks",children:x.map(t=>a.jsx(Va,{check:t,open:s.has(t.id),onToggle:()=>h(t.id)},t.id))})]}),a.jsxs("footer",{className:"dagwick-foot dagwick-muted",children:[i.points," / ",i.max_points," points · scored automatically from the latest parsed version of this DAG · ",S," ",Z]})]})}const Xa={pass:"✓",warn:"!",fail:"✕",skip:"–"},G=8;function Va({check:i,open:e,onToggle:r}){const[c,d]=p.useState(!1),n=!!i.fix,s=c?i.items:i.items.slice(0,G);return a.jsxs("li",{id:`dagwick-check-${i.id}`,className:`dagwick-check dagwick-check--${i.status}${e&&n?" is-open":""}`,children:[a.jsx("span",{className:"dagwick-icon","aria-label":i.status,children:Xa[i.status]}),a.jsxs("div",{className:"dagwick-check-body",children:[a.jsxs("button",{className:"dagwick-check-head",onClick:n?r:void 0,disabled:!n,"aria-expanded":n?e:void 0,children:[a.jsx("span",{className:"dagwick-check-title",children:i.title}),a.jsx("span",{className:"dagwick-tag",children:z[i.category]??i.category}),a.jsxs("span",{className:"dagwick-pts",children:[i.status==="skip"?"n/a":`${i.points} / ${i.weight}`,n&&a.jsx("span",{className:"dagwick-caret",children:e?"▾":"▸"})]})]}),a.jsx("div",{className:"dagwick-check-msg",children:i.message}),e&&n&&a.jsxs("div",{className:"dagwick-detail",children:[i.items.length>0&&a.jsxs("div",{className:"dagwick-items",children:[a.jsx("span",{className:"dagwick-items-label",children:"Affected"}),s.map(l=>a.jsx("code",{className:"dagwick-item",children:l},l)),i.items.length>G&&a.jsx("button",{className:"dagwick-more",onClick:()=>d(!c),children:c?"show less":`+${i.items.length-G} more`})]}),a.jsxs("div",{className:"dagwick-fix",children:[a.jsx("span",{className:"dagwick-fix-label",children:"How to fix"}),i.fix,i.example&&a.jsx(Ma,{code:i.example})]})]})]})]})}function O({status:i,n:e,label:r}){return a.jsxs("span",{className:`dagwick-chip dagwick-chip--${i}`,children:[a.jsx("strong",{children:e})," ",r]})}function _({active:i,onClick:e,children:r}){return a.jsx("button",{role:"tab","aria-selected":i,className:`dagwick-tab${i?" is-active":""}`,onClick:e,children:r})}function Ka(i){const e=new Map;for(const r of i){if(r.status==="skip")continue;const c=e.get(r.category)??{earned:0,possible:0};c.earned+=r.points,c.possible+=r.weight,e.set(r.category,c)}return Object.keys(z).filter(r=>e.has(r)).concat([...e.keys()].filter(r=>!(r in z))).map(r=>{const c=e.get(r);return{id:r,pct:c.possible?c.earned/c.possible*100:0}})}function Ja(i){return i>=90?"var(--dagwick-pass)":i>=60?"var(--dagwick-warn)":"var(--dagwick-fail)"}const la=["A","B","C","D","F"],ja={A:"Shining",B:"Steady",C:"Dim",D:"Flickering",F:"Out"},Ra={A:"The whole fleet is shining.",B:"Most DAGs burn steady.",C:"The fleet glows dimly. A few DAGs need care.",D:"Many DAGs are flickering.",F:"Most of the fleet is in the dark."},ai=[{id:"worst",label:"Needs care"},{id:"best",label:"Healthiest"},{id:"name",label:"A–Z"}],Y=3,ii=6;function ei(i){return i>=90?"A":i>=75?"B":i>=60?"C":i>=40?"D":"F"}function ri(){const{data:i,error:e,reload:r}=P(c=>ba(c),[]);return e?a.jsx(E,{title:"Couldn't load the fleet",body:e,action:a.jsx("button",{className:"dagwick-btn",onClick:r,children:"Try again"})}):i?i.dags.length===0?a.jsx(E,{title:"No DAGs yet",body:"Once Airflow parses a DAG you can read, it shows up here."}):a.jsx(ci,{dags:i.dags,truncated:i.truncated}):a.jsx(V,{label:"Checking every DAG…"})}function ci({dags:i,truncated:e}){const r=ta(),c=r.season,[d,n]=p.useState(""),[s,l]=p.useState(),[h,y]=p.useState(),[b,x]=p.useState("worst"),u=i.reduce((o,w)=>o+w.score,0)/i.length,t=ei(u),N=p.useMemo(()=>Object.fromEntries(la.map(o=>[o,i.filter(w=>w.grade===o).length])),[i]),L=i.filter(o=>o.counts.fail>0).length,wa=N.A+N.B,pa=p.useMemo(()=>{const o=new Map;for(const w of i)for(const f of w.issues){const q=o.get(f.id)??{id:f.id,title:f.title,dags:0,fails:0};q.dags+=1,f.status==="fail"&&(q.fails+=1),o.set(f.id,q)}return[...o.values()].sort((w,f)=>f.dags-w.dags||f.fails-w.fails).slice(0,ii)},[i]),H=p.useMemo(()=>{const o=d.trim().toLowerCase();return i.filter(w=>(!s||w.grade===s)&&(!h||w.issues.some(f=>f.id===h.id))&&(!o||w.dag_id.toLowerCase().includes(o)||w.owners.toLowerCase().includes(o))).sort((w,f)=>b==="name"?w.dag_id.localeCompare(f.dag_id):b==="best"?f.score-w.score:w.score-f.score)},[i,d,s,h,b]),ti=!!(s||h||d.trim());return a.jsxs(a.Fragment,{children:[a.jsxs("section",{className:`dagwick-hero dagwick-grade-${t}${c?` dagwick-season dagwick-season-${c.id}`:""}`,children:[a.jsx(ea,{season:c}),a.jsx(X,{grade:t,season:c?.id}),a.jsxs("div",{className:"dagwick-hero-text",children:[a.jsx(ra,{state:r}),J("Fleet health"),a.jsx("h2",{className:"dagwick-dag",children:"All DAGs"}),a.jsx("p",{className:"dagwick-headline",children:Ra[t]}),a.jsxs("div",{className:"dagwick-stats",children:[a.jsx(A,{value:i.length,label:"DAGs"}),a.jsx(A,{value:(Math.floor(u*10)/10).toFixed(1),label:"average score"}),a.jsx(A,{value:L,label:"need care",tone:L?"fail":void 0}),a.jsx(A,{value:wa,label:"healthy (A–B)",tone:wa?"pass":void 0})]})]}),a.jsxs("div",{className:"dagwick-hero-side",children:[a.jsx(Q,{score:u,grade:t}),a.jsx("span",{className:"dagwick-muted dagwick-ring-caption",children:"fleet average"})]})]}),a.jsx("section",{className:"dagwick-grades","aria-label":"Filter by grade",children:la.map(o=>{const w=N[o],f=s===o;return a.jsxs("button",{className:`dagwick-gcard dagwick-gcard--${o}${f?" is-active":""}${s&&!f?" is-dim":""}`,disabled:w===0,onClick:()=>l(f?void 0:o),"aria-pressed":f,children:[a.jsx(K,{grade:o,size:"lg"}),a.jsxs("div",{className:"dagwick-gcard-text",children:[a.jsx("span",{className:"dagwick-gcard-n",children:w}),a.jsx("span",{className:"dagwick-muted",children:ja[o]})]}),a.jsx("div",{className:"dagwick-gcard-bar",children:a.jsx("div",{style:{width:`${w/i.length*100}%`}})})]},o)})}),a.jsxs("div",{className:"dagwick-fleet-grid",children:[a.jsxs("section",{className:"dagwick-list",children:[a.jsxs("div",{className:"dagwick-toolbar",children:[a.jsxs("div",{className:"dagwick-search-wrap",children:[a.jsxs("svg",{viewBox:"0 0 24 24",width:"16",height:"16","aria-hidden":"true",children:[a.jsx("circle",{cx:"11",cy:"11",r:"7",fill:"none",stroke:"currentColor",strokeWidth:"2"}),a.jsx("path",{d:"M20 20l-4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})]}),a.jsx("input",{className:"dagwick-search",type:"search",placeholder:"Search DAGs or owners",value:d,onChange:o=>n(o.target.value),"aria-label":"Search DAGs"})]}),a.jsx("div",{className:"dagwick-seg",role:"radiogroup","aria-label":"Sort",children:ai.map(o=>a.jsx("button",{role:"radio","aria-checked":b===o.id,className:b===o.id?"is-active":"",onClick:()=>x(o.id),children:o.label},o.id))})]}),ti&&a.jsxs("div",{className:"dagwick-filters",children:[a.jsxs("span",{className:"dagwick-muted",children:[H.length," of ",i.length," DAGs"]}),s&&a.jsxs(I,{onClear:()=>l(void 0),children:["Grade ",s]}),h&&a.jsx(I,{onClear:()=>y(void 0),children:h.title}),d.trim()&&a.jsxs(I,{onClear:()=>n(""),children:["“",d.trim(),"”"]})]}),H.length===0?a.jsx("div",{className:"dagwick-clear",children:"No DAG matches."}):a.jsx("ul",{className:"dagwick-rows",children:H.map(o=>a.jsx("li",{children:a.jsxs(Sa,{dagId:o.dag_id,className:`dagwick-row dagwick-row--${o.grade}`,children:[a.jsx(La,{score:o.score,grade:o.grade}),a.jsxs("div",{className:"dagwick-row-main",children:[a.jsxs("div",{className:"dagwick-row-title",children:[a.jsx("span",{className:"dagwick-row-name",children:o.dag_id}),o.is_paused&&a.jsx("span",{className:"dagwick-tag",children:"paused"})]}),a.jsxs("div",{className:"dagwick-row-sub dagwick-muted",children:[o.owners&&a.jsx("span",{children:o.owners}),a.jsx("span",{children:o.counts.fail+o.counts.warn===0?"All checks passing":`${o.counts.fail} failing · ${o.counts.warn} to improve`})]}),o.issues.length>0&&a.jsxs("div",{className:"dagwick-row-issues",children:[o.issues.slice(0,Y).map(w=>a.jsx("span",{className:`dagwick-ichip dagwick-ichip--${w.status}`,children:w.title},w.id)),o.issues.length>Y&&a.jsxs("span",{className:"dagwick-ichip dagwick-ichip--more",children:["+",o.issues.length-Y]})]})]}),a.jsx(K,{grade:o.grade}),a.jsx("span",{className:"dagwick-row-go","aria-hidden":"true",children:"›"})]})},o.dag_id))})]}),a.jsx("aside",{className:"dagwick-side",children:a.jsxs("div",{className:"dagwick-side-card",children:[a.jsx("h3",{className:"dagwick-side-title",children:"Most common issues"}),pa.length===0?a.jsx("p",{className:"dagwick-muted dagwick-side-empty",children:"No issues anywhere. ✨"}):a.jsx("ul",{className:"dagwick-common",children:pa.map(o=>{const w=h?.id===o.id;return a.jsx("li",{children:a.jsxs("button",{className:`dagwick-common-item${w?" is-active":""}`,onClick:()=>y(w?void 0:{id:o.id,title:o.title}),"aria-pressed":w,children:[a.jsxs("div",{className:"dagwick-common-head",children:[a.jsx("span",{children:o.title}),a.jsxs("span",{className:"dagwick-muted",children:[o.dags,"/",i.length]})]}),a.jsx("div",{className:"dagwick-bar",children:a.jsx("div",{className:"dagwick-bar-fill",style:{width:`${o.dags/i.length*100}%`,background:o.fails>=o.dags/2?"var(--dagwick-fail)":"var(--dagwick-warn)"}})})]})},o.id)})}),a.jsx("p",{className:"dagwick-side-hint dagwick-muted",children:"Click an issue to see which DAGs have it."})]})})]}),a.jsxs("footer",{className:"dagwick-foot dagwick-muted",children:[e?`Showing the first ${i.length} DAGs. `:"","Scored automatically from the latest parsed version of each DAG. · ",S," ",Z]})]})}function A({value:i,label:e,tone:r}){return a.jsxs("div",{className:`dagwick-stat${r?` dagwick-stat--${r}`:""}`,children:[a.jsx("span",{className:"dagwick-stat-value",children:i}),a.jsx("span",{className:"dagwick-stat-label",children:e})]})}function I({children:i,onClear:e}){return a.jsxs("button",{className:"dagwick-fchip",onClick:e,"aria-label":"Remove filter",children:[i," ",a.jsx("span",{"aria-hidden":"true",children:"✕"})]})}const di=`
.dagwick {
  --dagwick-bg: #ffffff;
  --dagwick-surface: #f8f7f4;
  --dagwick-border: #e7e3dc;
  --dagwick-text: #1d2129;
  --dagwick-muted: #6b6f78;
  --dagwick-pass: #15803d;
  --dagwick-pass-bg: #e8f5ec;
  --dagwick-warn: #b45309;
  --dagwick-warn-bg: #fdf3e2;
  --dagwick-fail: #c2410c;
  --dagwick-fail-bg: #fdece4;
  --dagwick-accent: #d97706;
  --dagwick-flame: #f59e0b;
  --dagwick-flame-deep: #ea580c;
  --dagwick-flame-core: #fde68a;
  --dagwick-metal: #e0a040;
  --dagwick-metal-dark: #8a5a1c;
  --dagwick-glass: #bfe3f7;
  --dagwick-glass-edge: rgba(120, 150, 170, 0.55);
  --dagwick-wick: #3f2a1d;
  --dagwick-ink: #3b1f12;
  --dagwick-blush: #f4a28c;
  --dagwick-tear: #60a5fa;
  --dagwick-smoke: #a8a29e;
  --dagwick-shadow: rgba(60, 40, 20, 0.12);
  color: var(--dagwick-text);
  font: inherit;
  padding: 8px 4px 24px;
  width: 100%;
  max-width: 1440px;
}
html.dark .dagwick {
  --dagwick-bg: #171a21;
  --dagwick-surface: #1e222b;
  --dagwick-border: #2c313c;
  --dagwick-text: #ebe7e0;
  --dagwick-muted: #9a9fab;
  --dagwick-pass: #4ade80;
  --dagwick-pass-bg: rgba(74, 222, 128, 0.1);
  --dagwick-warn: #fbbf24;
  --dagwick-warn-bg: rgba(251, 191, 36, 0.1);
  --dagwick-fail: #fb7c4c;
  --dagwick-fail-bg: rgba(251, 124, 76, 0.12);
  --dagwick-accent: #fbbf24;
  --dagwick-shadow: rgba(0, 0, 0, 0.35);
  --dagwick-glass: #dbeefa;
  --dagwick-glass-edge: rgba(200, 225, 240, 0.4);
  --dagwick-smoke: #6b7280;
}
.dagwick * { box-sizing: border-box; }
.dagwick-muted { color: var(--dagwick-muted); }

.dagwick-hero {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;
  padding: 20px 24px;
  border: 1px solid var(--dagwick-border);
  border-radius: 16px;
  background:
    radial-gradient(600px 220px at 0% 0%, color-mix(in srgb, var(--dagwick-flame) 14%, transparent), transparent 70%),
    var(--dagwick-bg);
}
.dagwick-grade-D, .dagwick-grade-F { background: var(--dagwick-bg); }
.dagwick-eyebrow { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--dagwick-muted); }
.dagwick-brand { color: var(--dagwick-accent); font-weight: 700; }
.dagwick-dag { margin: 4px 0 6px; font-size: 22px; font-weight: 700; word-break: break-all; }
.dagwick-headline { margin: 0 0 12px; font-size: 15px; }
.dagwick-potential { margin: 10px 0 0; font-size: 13px; color: var(--dagwick-muted); }
.dagwick-potential strong { color: var(--dagwick-accent); }
.dagwick-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.dagwick-chip { font-size: 13px; padding: 3px 10px; border-radius: 999px; }
.dagwick-chip--pass { color: var(--dagwick-pass); background: var(--dagwick-pass-bg); }
.dagwick-chip--warn { color: var(--dagwick-warn); background: var(--dagwick-warn-bg); }
.dagwick-chip--fail { color: var(--dagwick-fail); background: var(--dagwick-fail-bg); }
.dagwick-hero-side { display: flex; flex-direction: column; align-items: center; gap: 12px; }

.dagwick-ring { position: relative; width: 132px; height: 132px; }
.dagwick-ring-track { fill: none; stroke: var(--dagwick-border); stroke-width: 10; }
.dagwick-ring-fill { fill: none; stroke: var(--dagwick-accent); stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1); }
.dagwick-grade-A .dagwick-ring-fill { stroke: var(--dagwick-pass); }
.dagwick-grade-D .dagwick-ring-fill, .dagwick-grade-F .dagwick-ring-fill { stroke: var(--dagwick-fail); }
.dagwick-ring-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; }
.dagwick-grade { font-size: 40px; font-weight: 800; }
.dagwick-score { font-size: 13px; color: var(--dagwick-muted); margin-top: 4px; }

.dagwick-btn {
  font: inherit; font-size: 13px; padding: 6px 14px; border-radius: 8px; cursor: pointer;
  color: var(--dagwick-text); background: var(--dagwick-surface); border: 1px solid var(--dagwick-border);
}
.dagwick-btn:hover:not(:disabled) { border-color: var(--dagwick-accent); }
.dagwick-btn:disabled { opacity: .6; cursor: progress; }
.dagwick-btn:focus-visible, .dagwick-tab:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: 2px; }

.dagwick-cats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 16px 0; }
.dagwick-cat { padding: 12px 14px; border: 1px solid var(--dagwick-border); border-radius: 12px; background: var(--dagwick-bg); }
.dagwick-cat-head { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.dagwick-bar { height: 6px; border-radius: 99px; background: var(--dagwick-border); overflow: hidden; }
.dagwick-bar-fill { height: 100%; border-radius: 99px; transition: width .9s cubic-bezier(.2,.8,.2,1); }

.dagwick-list { border: 1px solid var(--dagwick-border); border-radius: 16px; background: var(--dagwick-bg); overflow: hidden; }
.dagwick-tabs { display: flex; gap: 4px; padding: 8px; border-bottom: 1px solid var(--dagwick-border); background: var(--dagwick-surface); flex-wrap: wrap; }
.dagwick-tab { font: inherit; font-size: 13px; padding: 6px 12px; border-radius: 8px; border: 0; background: transparent; color: var(--dagwick-muted); cursor: pointer; }
.dagwick-tab.is-active { background: var(--dagwick-bg); color: var(--dagwick-text); box-shadow: 0 1px 2px var(--dagwick-shadow); }
.dagwick-count { margin-left: 4px; font-size: 11px; padding: 1px 6px; border-radius: 99px; background: var(--dagwick-border); }
.dagwick-checks { list-style: none; margin: 0; padding: 0; }
.dagwick-check { display: flex; gap: 14px; padding: 14px 18px; border-top: 1px solid var(--dagwick-border); }
.dagwick-check:first-child { border-top: 0; }
.dagwick-icon { flex: none; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; font-weight: 700; }
.dagwick-check--pass .dagwick-icon { color: var(--dagwick-pass); background: var(--dagwick-pass-bg); }
.dagwick-check--warn .dagwick-icon { color: var(--dagwick-warn); background: var(--dagwick-warn-bg); }
.dagwick-check--fail .dagwick-icon { color: var(--dagwick-fail); background: var(--dagwick-fail-bg); }
.dagwick-check--skip .dagwick-icon { color: var(--dagwick-muted); background: var(--dagwick-surface); }
.dagwick-check--skip { opacity: .7; }
.dagwick-check-body { flex: 1; min-width: 0; }
.dagwick-check-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dagwick-check-title { font-weight: 600; }
.dagwick-tag { font-size: 11px; padding: 1px 8px; border-radius: 99px; border: 1px solid var(--dagwick-border); color: var(--dagwick-muted); }
.dagwick-pts { margin-left: auto; font-size: 12px; color: var(--dagwick-muted); font-variant-numeric: tabular-nums; }
.dagwick-check-msg { font-size: 14px; color: var(--dagwick-muted); margin-top: 2px; }
.dagwick-fix { margin-top: 8px; font-size: 13px; padding: 8px 12px; border-radius: 8px; background: var(--dagwick-surface); border-left: 3px solid var(--dagwick-accent); }
.dagwick-fix-label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--dagwick-accent); margin-bottom: 2px; }
.dagwick-clear { padding: 28px; text-align: center; color: var(--dagwick-muted); }
.dagwick-foot { font-size: 12px; margin-top: 12px; text-align: right; }
.dagwick-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 48px 16px; text-align: center; }
.dagwick-empty h3 { margin: 8px 0 0; }

/* Mascot + speech bubble */
.dagwick-mascot { position: relative; display: flex; flex-direction: column; align-items: center; }
.dagwick-bubble {
  position: relative; margin-bottom: -6px; padding: 5px 12px; border-radius: 12px; font-size: 13px; white-space: nowrap;
  background: var(--dagwick-surface); border: 1px solid var(--dagwick-border); box-shadow: 0 2px 6px var(--dagwick-shadow);
  animation: dagwick-pop .5s cubic-bezier(.2,1.4,.4,1) both;
}
.dagwick-bubble::after {
  content: ""; position: absolute; left: 50%; bottom: -6px; width: 10px; height: 10px; transform: translateX(-50%) rotate(45deg);
  background: var(--dagwick-surface); border-right: 1px solid var(--dagwick-border); border-bottom: 1px solid var(--dagwick-border);
}
@keyframes dagwick-pop { from { opacity: 0; transform: scale(.6) translateY(6px); } to { opacity: 1; transform: none; } }

/* Grade badges */
.dagwick-badge { display: inline-grid; place-items: center; min-width: 26px; height: 26px; padding: 0 6px; border-radius: 8px; font-weight: 800; font-size: 14px; color: #fff; }
.dagwick-badge--A { background: #16a34a; } .dagwick-badge--B { background: #65a30d; } .dagwick-badge--C { background: #d97706; }
.dagwick-badge--D { background: #ea580c; } .dagwick-badge--F { background: #dc2626; }
.dagwick-ring.dagwick-grade-B .dagwick-ring-fill { stroke: #84cc16; }

/* Next goal */
.dagwick-goal {
  display: flex; align-items: center; gap: 12px 16px; flex-wrap: wrap; margin-top: 16px; padding: 12px 16px; border-radius: 12px;
  border: 1px dashed color-mix(in srgb, var(--dagwick-accent) 55%, transparent);
  background: color-mix(in srgb, var(--dagwick-flame) 7%, var(--dagwick-bg));
}
.dagwick-goal-text { display: flex; align-items: center; gap: 8px; font-size: 14px; flex-wrap: wrap; }
.dagwick-goal-step { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--dagwick-accent); }
.dagwick-goal-picks { display: flex; gap: 8px; flex-wrap: wrap; margin-left: auto; }
.dagwick-pick {
  font: inherit; font-size: 13px; padding: 4px 10px; border-radius: 99px; cursor: pointer;
  color: var(--dagwick-text); background: var(--dagwick-bg); border: 1px solid var(--dagwick-border);
}
.dagwick-pick:hover { border-color: var(--dagwick-accent); }
.dagwick-pick-gain { color: var(--dagwick-pass); font-weight: 700; margin-left: 2px; }

/* Expandable check rows */
.dagwick-check-head { all: unset; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; width: 100%; cursor: pointer; }
.dagwick-check-head:disabled { cursor: default; }
.dagwick-check-head:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: 4px; border-radius: 4px; }
.dagwick-caret { margin-left: 8px; color: var(--dagwick-muted); }
.dagwick-check { transition: background .2s; }
.dagwick-check.is-open { background: color-mix(in srgb, var(--dagwick-surface) 60%, transparent); }
.dagwick-detail { margin-top: 10px; display: flex; flex-direction: column; gap: 10px; animation: dagwick-fade .25s ease both; }
@keyframes dagwick-fade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.dagwick-items { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.dagwick-items-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--dagwick-muted); margin-right: 2px; }
.dagwick-item { font-size: 12px; padding: 2px 8px; border-radius: 6px; background: var(--dagwick-fail-bg); color: var(--dagwick-fail); }
.dagwick-check--warn .dagwick-item { background: var(--dagwick-warn-bg); color: var(--dagwick-warn); }
.dagwick-more { all: unset; font-size: 12px; color: var(--dagwick-accent); cursor: pointer; }
.dagwick-fix { margin-top: 0; }
.dagwick-code { position: relative; margin-top: 8px; }
.dagwick-code pre {
  margin: 0; padding: 10px 70px 10px 12px; border-radius: 8px; overflow-x: auto; font-size: 12.5px; line-height: 1.5;
  background: #11131a; color: #f3e9d7; border: 1px solid #262a35;
}
.dagwick-copy {
  position: absolute; top: 6px; right: 6px; font: inherit; font-size: 11px; padding: 3px 8px; border-radius: 6px; cursor: pointer;
  color: #f3e9d7; background: #262a35; border: 1px solid #343947;
}
.dagwick-copy:hover { border-color: var(--dagwick-flame); }

@media (max-width: 720px) {
  .dagwick-goal-picks { margin-left: 0; }
}

/* Fleet */
.dagwick-badge--sm { min-width: 20px; height: 20px; font-size: 11px; border-radius: 6px; }
.dagwick-badge--lg { min-width: 38px; height: 38px; font-size: 20px; border-radius: 11px; }
.dagwick-ring-caption { font-size: 12px; }
.dagwick-stats { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
.dagwick-stat {
  display: flex; flex-direction: column; min-width: 104px; padding: 8px 14px; border-radius: 10px;
  background: color-mix(in srgb, var(--dagwick-surface) 80%, transparent); border: 1px solid var(--dagwick-border);
}
.dagwick-stat-value { font-size: 20px; font-weight: 800; line-height: 1.2; font-variant-numeric: tabular-nums; }
.dagwick-stat-label { font-size: 12px; color: var(--dagwick-muted); }
.dagwick-stat--fail .dagwick-stat-value { color: var(--dagwick-fail); }
.dagwick-stat--pass .dagwick-stat-value { color: var(--dagwick-pass); }

.dagwick-grades { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 16px 0; }
.dagwick-gcard {
  font: inherit; color: inherit; text-align: left; cursor: pointer; position: relative; overflow: hidden;
  display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; align-items: center;
  padding: 12px 14px 16px; border-radius: 12px; border: 1px solid var(--dagwick-border); background: var(--dagwick-bg);
  transition: border-color .15s, transform .15s, opacity .2s, box-shadow .15s;
}
.dagwick-gcard:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px var(--dagwick-shadow); }
.dagwick-gcard:disabled { cursor: default; opacity: .45; }
.dagwick-gcard.is-dim { opacity: .5; }
.dagwick-gcard.is-active { border-color: var(--dagwick-accent); box-shadow: 0 0 0 1px var(--dagwick-accent) inset; }
.dagwick-gcard:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: 2px; }
.dagwick-gcard-text { display: flex; flex-direction: column; line-height: 1.15; }
.dagwick-gcard-n { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; }
.dagwick-gcard-text .dagwick-muted { font-size: 12px; }
.dagwick-gcard-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 4px; background: var(--dagwick-border); }
.dagwick-gcard-bar > div { height: 100%; transition: width .6s cubic-bezier(.2,.8,.2,1); }
.dagwick-gcard--A .dagwick-gcard-bar > div { background: #16a34a; } .dagwick-gcard--B .dagwick-gcard-bar > div { background: #65a30d; }
.dagwick-gcard--C .dagwick-gcard-bar > div { background: #d97706; } .dagwick-gcard--D .dagwick-gcard-bar > div { background: #ea580c; }
.dagwick-gcard--F .dagwick-gcard-bar > div { background: #dc2626; }

.dagwick-fleet-grid { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; align-items: start; }
.dagwick-toolbar { display: flex; gap: 10px; align-items: center; padding: 10px; border-bottom: 1px solid var(--dagwick-border); background: var(--dagwick-surface); flex-wrap: wrap; }
.dagwick-search-wrap { position: relative; flex: 1; min-width: 200px; color: var(--dagwick-muted); }
.dagwick-search-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.dagwick-search {
  width: 100%; font: inherit; font-size: 14px; padding: 7px 12px 7px 34px; border-radius: 8px;
  color: var(--dagwick-text); background: var(--dagwick-bg); border: 1px solid var(--dagwick-border); outline: none;
}
.dagwick-search:focus { border-color: var(--dagwick-accent); }
.dagwick-seg { display: inline-flex; padding: 3px; gap: 2px; border-radius: 9px; background: var(--dagwick-bg); border: 1px solid var(--dagwick-border); }
.dagwick-seg button { font: inherit; font-size: 13px; padding: 5px 12px; border-radius: 6px; border: 0; cursor: pointer; background: transparent; color: var(--dagwick-muted); }
.dagwick-seg button.is-active { background: var(--dagwick-surface); color: var(--dagwick-text); box-shadow: 0 1px 2px var(--dagwick-shadow); }
.dagwick-seg button:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: 1px; }
.dagwick-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 14px; font-size: 13px; border-bottom: 1px solid var(--dagwick-border); }
.dagwick-fchip {
  font: inherit; font-size: 12px; padding: 3px 10px; border-radius: 99px; cursor: pointer;
  color: var(--dagwick-accent); background: color-mix(in srgb, var(--dagwick-flame) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--dagwick-accent) 40%, transparent);
}

.dagwick-rows { list-style: none; margin: 0; padding: 0; }
.dagwick-rows li + li { border-top: 1px solid var(--dagwick-border); }
.dagwick-row {
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; gap: 14px; align-items: center;
  padding: 12px 16px 12px 13px; color: inherit; text-decoration: none; border-left: 3px solid transparent;
  transition: background .15s;
}
.dagwick-row--A { border-left-color: #16a34a; } .dagwick-row--B { border-left-color: #65a30d; } .dagwick-row--C { border-left-color: #d97706; }
.dagwick-row--D { border-left-color: #ea580c; } .dagwick-row--F { border-left-color: #dc2626; }
.dagwick-row:hover { background: var(--dagwick-surface); }
.dagwick-row:hover .dagwick-row-name { color: var(--dagwick-accent); }
.dagwick-row:hover .dagwick-row-go { transform: translateX(3px); color: var(--dagwick-accent); }
.dagwick-row:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: -2px; }
.dagwick-row-main { min-width: 0; }
.dagwick-row-title { display: flex; align-items: center; gap: 8px; }
.dagwick-row-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dagwick-row-sub { font-size: 12.5px; display: flex; gap: 10px; flex-wrap: wrap; margin-top: 1px; }
.dagwick-row-sub span + span::before { content: "·"; margin-right: 10px; }
.dagwick-row-issues { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 7px; }
.dagwick-ichip { font-size: 11.5px; padding: 2px 8px; border-radius: 6px; white-space: nowrap; }
.dagwick-ichip--fail { color: var(--dagwick-fail); background: var(--dagwick-fail-bg); }
.dagwick-ichip--warn { color: var(--dagwick-warn); background: var(--dagwick-warn-bg); }
.dagwick-ichip--more { color: var(--dagwick-muted); background: var(--dagwick-surface); }
.dagwick-row-go { font-size: 22px; color: var(--dagwick-muted); transition: transform .15s, color .15s; }
.dagwick-mini { position: relative; width: 46px; height: 46px; flex: none; }
.dagwick-mini .dagwick-ring-track { stroke-width: 5; }
.dagwick-mini .dagwick-ring-fill { stroke-width: 5; }
.dagwick-mini span { position: absolute; inset: 0; display: grid; place-items: center; font-size: 13px; font-weight: 800; font-variant-numeric: tabular-nums; }

.dagwick-side { position: sticky; top: 12px; }
.dagwick-side-card { padding: 16px; border: 1px solid var(--dagwick-border); border-radius: 16px; background: var(--dagwick-bg); }
.dagwick-side-title { margin: 0 0 12px; font-size: 14px; font-weight: 700; }
.dagwick-side-empty { margin: 0; font-size: 13px; }
.dagwick-side-hint { margin: 12px 0 0; font-size: 12px; }
.dagwick-common { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.dagwick-common-item { all: unset; box-sizing: border-box; display: block; width: 100%; cursor: pointer; padding: 8px 10px; border-radius: 10px; border: 1px solid transparent; }
.dagwick-common-item:hover { background: var(--dagwick-surface); }
.dagwick-common-item.is-active { background: var(--dagwick-surface); border-color: var(--dagwick-accent); }
.dagwick-common-item:focus-visible { outline: 2px solid var(--dagwick-accent); }
.dagwick-common-head { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; margin-bottom: 6px; }
.dagwick-common-head .dagwick-muted { font-variant-numeric: tabular-nums; }

@media (max-width: 1100px) {
  .dagwick-fleet-grid { grid-template-columns: 1fr; }
  .dagwick-side { position: static; order: -1; }
}
@media (max-width: 720px) {
  .dagwick-grades { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .dagwick-row { grid-template-columns: auto minmax(0, 1fr) auto; }
  .dagwick-row-go { display: none; }
}

/* Seasonal moods: decoration only, behind the hero content */
.dagwick-hero { position: relative; overflow: hidden; isolation: isolate; }
.dagwick-hero > :not(.dagwick-fx) { position: relative; z-index: 1; }
.dagwick-fx { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; border-radius: inherit; }
.dagwick-season-halloween { --dagwick-flame: #22c55e; --dagwick-flame-deep: #15803d; --dagwick-flame-core: #d9f99d; --dagwick-glass: #fb923c; }
.dagwick-season-newroz { --dagwick-flame: #f97316; --dagwick-flame-deep: #dc2626; --dagwick-flame-core: #fde68a; }
.dagwick-season-ramadan, .dagwick-season-eid { --dagwick-glass: #e6fffa; }

.dagwick-fx--christmas { background: linear-gradient(180deg, rgba(37, 66, 122, .35), transparent 80%); }
.dagwick-fx--halloween { background: radial-gradient(420px 220px at 55% 0%, rgba(124, 58, 237, .28), transparent 70%), linear-gradient(180deg, rgba(42, 22, 64, .45), transparent 90%); }
.dagwick-fx--newroz { background: linear-gradient(180deg, rgba(30, 58, 95, .28), rgba(120, 50, 70, .28)); }
.dagwick-fx--ramadan { background: linear-gradient(180deg, rgba(15, 60, 80, .4), transparent 90%); }
.dagwick-fx--eid { background: radial-gradient(500px 200px at 50% 0%, rgba(233, 196, 106, .18), transparent 70%); }
.dagwick-fx--new-year, .dagwick-fx--birthday { background: radial-gradient(500px 220px at 50% 0%, rgba(192, 132, 252, .16), transparent 70%); }
.dagwick-fx--language-day { background: radial-gradient(500px 220px at 50% 100%, rgba(251, 191, 36, .12), transparent 70%); }

.dagwick-flake { position: absolute; top: -10px; border-radius: 50%; background: #fff; box-shadow: 0 0 4px rgba(255, 255, 255, .7);
  animation-name: dagwick-fall, dagwick-sway; animation-timing-function: linear, ease-in-out;
  animation-iteration-count: infinite; animation-direction: normal, alternate; }
html:not(.dark) .dagwick-flake { background: #a9c9ea; box-shadow: none; }
.dagwick-snowbank { position: absolute; left: 0; bottom: 0; width: 100%; height: 16px; fill: #f8fbff; opacity: .9; }
html:not(.dark) .dagwick-snowbank { fill: #dceaf8; }
@keyframes dagwick-fall { from { top: -8%; } to { top: 108%; } }
@keyframes dagwick-sway { from { transform: translateX(-10px); } to { transform: translateX(10px); } }

.dagwick-moon { position: absolute; right: 30%; top: 14px; width: 54px; height: 54px; border-radius: 50%;
  background: radial-gradient(circle at 38% 38%, #fffbea, #f5e6b8 60%, #e3cf8f); box-shadow: 0 0 40px rgba(245, 230, 184, .45); }
.dagwick-bat { position: absolute; left: -8%; animation: dagwick-fly linear infinite; }
.dagwick-bat-bob { display: block; animation: dagwick-bob 1.6s ease-in-out infinite alternate; }
.dagwick-bat svg { display: block; fill: #140b22; stroke: #140b22; filter: drop-shadow(0 0 2px rgba(190, 242, 100, .45)); }
html:not(.dark) .dagwick-bat svg { filter: none; }
.dagwick-wing-l, .dagwick-wing-r { transform-box: view-box; transform-origin: 20px 10px; animation: dagwick-flap .2s ease-in-out infinite alternate; }
@keyframes dagwick-fly { from { left: -8%; } to { left: 108%; } }
@keyframes dagwick-bob { from { transform: translateY(-9px); } to { transform: translateY(9px); } }
@keyframes dagwick-flap { from { transform: scaleY(1); } to { transform: scaleY(.25); } }

.dagwick-confetti { position: absolute; top: -10px; width: 7px; height: 4px; border-radius: 1px;
  animation-name: dagwick-fall, dagwick-spin; animation-timing-function: linear; animation-iteration-count: infinite; }
@keyframes dagwick-spin { to { transform: rotate(360deg); } }
.dagwick-firework { position: absolute; width: 0; height: 0; animation: dagwick-burst 3.3s ease-out infinite; }
.dagwick-firework i { position: absolute; width: 4px; height: 4px; border-radius: 50%; }
@keyframes dagwick-burst { 0% { transform: scale(.2); opacity: 0; } 15% { opacity: 1; } 60% { transform: scale(1.2); opacity: .9; } 100% { transform: scale(1.6); opacity: 0; } }
.dagwick-balloon { position: absolute; bottom: -60px; width: 22px; height: 28px; border-radius: 50% 50% 46% 46%; opacity: .85; animation: dagwick-rise linear infinite; }
.dagwick-balloon::after { content: ""; position: absolute; left: 50%; top: 100%; width: 1px; height: 24px; background: rgba(160, 160, 160, .6); }
@keyframes dagwick-rise { from { bottom: -60px; } to { bottom: 110%; } }

.dagwick-ember { position: absolute; bottom: 10%; width: 4px; height: 4px; border-radius: 50%; background: #fdba74; box-shadow: 0 0 6px #fb923c; animation: dagwick-ember linear infinite; }
@keyframes dagwick-ember { 0% { bottom: 12%; opacity: 0; transform: translateX(0); } 15% { opacity: 1; } 100% { bottom: 95%; opacity: 0; transform: translateX(16px); } }
.dagwick-mountains { position: absolute; left: 0; bottom: 0; width: 100%; height: 55%; }
.dagwick-mountains .far { fill: rgba(80, 44, 74, .55); }
.dagwick-mountains .near { fill: rgba(36, 20, 40, .85); }
html:not(.dark) .dagwick-mountains .far { fill: rgba(140, 100, 120, .22); }
html:not(.dark) .dagwick-mountains .near { fill: rgba(110, 70, 90, .3); }
.dagwick-fire { position: absolute; width: 14px; height: 20px; margin: -20px 0 0 -7px; border-radius: 50% 50% 45% 45% / 62% 62% 38% 38%;
  background: radial-gradient(circle at 50% 72%, #fff1b8 0 18%, #fbbf24 38%, #f97316 62%, #dc2626 100%);
  box-shadow: 0 0 14px 4px rgba(249, 115, 22, .55), 0 0 40px 10px rgba(249, 115, 22, .2);
  transform-origin: 50% 100%; animation: dagwick-flicker .45s ease-in-out infinite alternate; }
@keyframes dagwick-flicker { from { transform: scaleY(.8); } to { transform: scaleY(1.12); } }
.dagwick-govend { position: absolute; left: 54%; bottom: 0; display: flex; }
.dagwick-dancer { display: block; margin: 0 -2px; animation: dagwick-govend 1.1s ease-in-out infinite; }
.dagwick-dancer svg { display: block; overflow: visible; }
@keyframes dagwick-govend { 0%, 100% { transform: translateY(0) rotate(0); } 25% { transform: translateY(-3px) rotate(-4deg); } 75% { transform: translateY(-1px) rotate(4deg); } }

.dagwick-star { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #fde68a; box-shadow: 0 0 6px #fde68a; animation: dagwick-twinkle ease-in-out infinite; }
@keyframes dagwick-twinkle { 0%, 100% { opacity: .2; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.3); } }
.dagwick-hanging span { position: absolute; top: 0; display: flex; flex-direction: column; align-items: center; transform-origin: top center; animation: dagwick-swing 3s ease-in-out infinite alternate; }
.dagwick-hanging span::before { content: ""; width: 1px; flex: 1; background: #e9c46a; }
@keyframes dagwick-swing { from { transform: rotate(-5deg); } to { transform: rotate(5deg); } }
.dagwick-bunting { position: absolute; top: 0; left: 0; width: 100%; height: 34px; }
.dagwick-letter { position: absolute; bottom: -30px; color: var(--dagwick-accent); opacity: 0; font-weight: 700; animation: dagwick-letter linear infinite; }
@keyframes dagwick-letter { 0% { bottom: -10%; opacity: 0; } 15% { opacity: .3; } 85% { opacity: .2; } 100% { bottom: 105%; opacity: 0; } }

.dagwick-greeting {
  display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; margin-bottom: 8px; padding: 4px 6px 4px 12px;
  border-radius: 999px; font-size: 13px; border: 1px solid var(--dagwick-border);
  background: color-mix(in srgb, var(--dagwick-bg) 72%, transparent); backdrop-filter: blur(4px);
}
.dagwick-greeting-hide { font: inherit; font-size: 12px; padding: 2px 9px; border-radius: 999px; border: 0; cursor: pointer; background: var(--dagwick-surface); color: var(--dagwick-muted); }
.dagwick-greeting-hide:hover { color: var(--dagwick-text); }
.dagwick-greeting-show { all: unset; display: inline-block; margin-bottom: 8px; font-size: 12px; color: var(--dagwick-muted); cursor: pointer; }
.dagwick-greeting-show:hover { color: var(--dagwick-accent); }
.dagwick-greeting-hide:focus-visible, .dagwick-greeting-show:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: 2px; }

/* The lamp */
.dagwick-lamp { flex: none; overflow: visible; }
.dagwick-flame { transform-box: fill-box; transform-origin: 50% 100%; }
.dagwick-flame path:first-child { transform-box: fill-box; transform-origin: 50% 100%; animation: dagwick-sway 2.4s ease-in-out infinite; }
.dagwick-lamp--worried .dagwick-flame path:first-child { animation: dagwick-flicker .5s steps(2) infinite; }
.dagwick-glow { animation: dagwick-breathe 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.dagwick-sparkles path { animation: dagwick-twinkle 2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.dagwick-sparkles path:nth-child(2) { animation-delay: .6s; }
.dagwick-sparkles path:nth-child(3) { animation-delay: 1.2s; }
.dagwick-lamp--radiant .dagwick-body, .dagwick-lamp--happy .dagwick-body { animation: dagwick-bob 3s ease-in-out infinite; }
.dagwick-eyes { animation: dagwick-blink 4s infinite; transform-box: fill-box; transform-origin: center; }
.dagwick-smoke path { stroke-dasharray: 80; animation: dagwick-smoke 3.2s ease-in-out infinite; }
@keyframes dagwick-sway { 0%,100% { transform: rotate(-3deg) scaleY(1); } 50% { transform: rotate(3deg) scaleY(1.06); } }
@keyframes dagwick-flicker { 0% { opacity: 1; transform: scaleY(1); } 100% { opacity: .55; transform: scaleY(.8) rotate(4deg); } }
@keyframes dagwick-breathe { 0%,100% { opacity: .85; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
@keyframes dagwick-twinkle { 0%,100% { opacity: 0; transform: scale(.4); } 50% { opacity: 1; transform: scale(1); } }
@keyframes dagwick-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes dagwick-blink { 0%,92%,100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
@keyframes dagwick-smoke { 0% { stroke-dashoffset: 80; opacity: 0; } 30% { opacity: .9; } 100% { stroke-dashoffset: -80; opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .dagwick *, .dagwick-lamp * { animation: none !important; transition: none !important; } }

@media (max-width: 720px) {
  .dagwick-hero { grid-template-columns: 1fr; justify-items: center; text-align: center; }
  .dagwick-chips { justify-content: center; }
}
`;function oi({dagId:i}){return a.jsxs("div",{className:"dagwick",children:[a.jsx("style",{children:di}),i?a.jsx(Pa,{dagId:i},i):a.jsx(ri,{})]})}function W(i){return a.jsx(oi,{...i})}const ga=globalThis;return ga[S]=W,ga.AirflowPlugin=W,W})(ReactJSXRuntime,React);
