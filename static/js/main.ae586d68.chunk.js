(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{13:function(e,t,n){},17:function(e,t,n){e.exports=n(30)},25:function(e,t,n){},30:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),i=n(15),c=n.n(i),l=(n(25),n(2)),o=n(6),s=n(3),u=n(5),m=n(16),d=n(11),p=n.n(d),f=function(e){return r.a.createElement("div",{className:"image-component",style:{justifyContent:e.horizontalAlignment,alignItems:e.verticalAlignment}},r.a.createElement("img",{src:e.src,alt:e.alt}))},v=function(e){return r.a.createElement("h1",null,e.text)},g=function(e){return r.a.createElement("p",null,e.text)},b=n(8),E=function(e){return r.a.createElement("div",{className:"undefined-element"},r.a.createElement(b.a,{icon:"fa-solid fa-triangle-exclamation"}),r.a.createElement("span",{className:"message"},"The element '",e.element,"' could not be found"),r.a.createElement(b.a,{icon:"fa-solid fa-triangle-exclamation"}))},h={header:{type:v,component:"header",props:{text:"My Header"}},paragraph:{type:g,component:"paragraph",props:{text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae."}},image:{type:f,component:"image",props:{src:"img/image-2.jpg",alt:"Alt Text"}}},y=function(e){return h[e.component]&&"undefined"!==typeof h[e.component].type?r.a.createElement(h[e.component].type,function e(t){var n={key:t._uid};if(!t.props)return n;for(var a=0,i=Object.entries(t.props);a<i.length;a++){var c=i[a],l=Object(s.a)(c,2),o=l[0],u=l[1],m=null!==u&&"object"===typeof u&&u.hasOwnProperty("component");n[o]=m?r.a.createElement(h[u.component].type,e(u)):u}return n}(e)):r.a.createElement(function(){return r.a.createElement(E,{element:e.component})},{key:e._uid})};var O=function(e){var t=Object(u.g)({id:e.id}).setNodeRef;return r.a.createElement("div",{ref:t},e.children)},j=function(e){var t=Object(u.f)({id:e.id,data:e.data}),n=t.attributes,i=t.listeners,c=t.setNodeRef,o=e.dragHandleEnabled,m=Object(a.useState)(!1),d=Object(s.a)(m,2),p=d[0],f=d[1],v={};return o&&p&&(v.position="relative",v.border="1px solid #343536"),r.a.createElement("div",Object.assign({ref:c,onClick:e.onClick,onMouseOver:function(){return f(!0)},onMouseOut:function(){return f(!1)},id:e.id,className:e.className,style:Object(l.a)({},e.style,v)},i,n),e.children,o&&p&&r.a.createElement("div",{style:{position:"absolute",right:"0px",top:"50%",transform:"translate(50%, -50%)",background:"#343536",color:"#D7D7D7",zIndex:"1",height:25,width:25,borderRadius:"50%",display:"flex",justifyContent:"center",alignItems:"center",fontSize:"18px"}},r.a.createElement(b.a,{icon:"fa-solid fa-up-down-left-right"})))};j.defaultProps={dragHandleEnabled:!1};var x=j,N=function(e){var t=Object(u.g)({id:"initial-droppable"}),n=t.isOver,a=t.setNodeRef;return r.a.createElement("div",{id:"initial-droppable",ref:a,style:{height:"100px",background:n?"#cae4ff":"#FFF",borderStyle:"dashed",borderColor:"#A2A2A2"}})},w=function(e){var t=e.items,n=e.onGridItemClick,a=e.dropTargetIndex,i=e.placementPreviewRef,c=e.relativeHoverPosition,l=e.translateTiming,o=e.columnTimerActive;function s(e){var t={};return null===a?t:("center"!==c||e!==a||o?e>=a&&"center"!==c?(t.transition="transform ".concat(l,"ms ease 0s"),t.transform="translate3d(0px, ".concat(i.current.clientHeight+24,"px, 0px)")):(t.transition="transform ".concat(l,"ms ease 0s"),t.transform="translate3d(0px, 0px, 0px)"):(t.justifyContent="unset",t.transition="transform ".concat(l,"ms ease 0s")),t)}function u(e,n,r){var i={};if("center"===c&&e===a&&!o){i.flex="unset";var l=16*r,s=(document.getElementById(t[e]._uid).getBoundingClientRect().width-l)/(r+1);i.width="".concat(s,"px")}return i}return r.a.createElement("div",{className:"grid-wrapper"},r.a.createElement("div",{className:"grid"},0===t.length&&r.a.createElement(N,null),t.length>0&&t.map(function(e,t){return r.a.createElement(O,{id:e._uid,key:e._uid},r.a.createElement("div",{className:"grid-row",style:s(t),id:e._uid},e.columns.map(function(a,i){return r.a.createElement(x,{id:a._uid,key:a._uid,className:"grid-column",dragHandleEnabled:!0,onClick:function(){return n(a)},style:u(t,0,e.columns.length)},y(a))})))})))},S=(n(13),function(e){return r.a.createElement("div",{className:"builder-elements-menu"},r.a.createElement("div",{className:"element-wrapper"},r.a.createElement(x,{id:"header-menu-item",data:{type:"header"}},r.a.createElement("button",{className:"element"},r.a.createElement(b.a,{icon:"fa-solid fa-heading"})," HEADER"))),r.a.createElement("div",{className:"element-wrapper"},r.a.createElement(x,{id:"paragraph-menu-item",data:{type:"paragraph"}},r.a.createElement("button",{className:"element"},r.a.createElement(b.a,{icon:"fa-solid fa-paragraph"}),"PARAGRAPH"))),r.a.createElement("div",{className:"element-wrapper"},r.a.createElement(x,{id:"image-menu-item",data:{type:"image"}},r.a.createElement("button",{className:"element"},r.a.createElement(b.a,{icon:"fa-solid fa-image"}),"IMAGE"))))}),C=function(e){var t=Object(a.useState)(JSON.parse(JSON.stringify(e.item))),n=Object(s.a)(t,2),i=n[0],c=n[1];return r.a.createElement("div",{className:"item-editor",style:{display:"flex",flexDirection:"column"}},y(e.item),r.a.createElement("input",{type:"text",onChange:function(e){var t=Object(l.a)({},i);t.props.text=e.target.value,c(t)},value:i.props.text}),r.a.createElement("button",{onClick:function(){return e.onSaveChanges(i)}},"SAVE"))},_=function(){return r.a.createElement("div",{className:"navbar"},r.a.createElement("div",{className:"course"},r.a.createElement("span",{className:"course-image"}),r.a.createElement("span",{className:"course-title"},"Course Title (edit)")),r.a.createElement("div",{className:"options"},r.a.createElement("span",{className:"option"},"Cancel"),r.a.createElement("span",{className:"option"},"Save"),r.a.createElement("span",{className:"option"},"Publish"),r.a.createElement("span",{className:"option preview"},"Preview"),r.a.createElement("span",{className:"option"},"Gear icon"),r.a.createElement("span",{className:"option"},"Chart icon")))},I=Object(a.forwardRef)(function(e,t){return r.a.createElement("div",{id:"placement-preview",style:e.style,ref:t},r.a.createElement("div",{className:"overlay"}),e.children)});var T=function(){var e=Object(a.useRef)({x:null,y:null});return Object(a.useEffect)(function(){var t=function(t){e.current={x:t.clientX,y:t.clientY}};return window.addEventListener("pointermove",t),function(){window.removeEventListener("pointermove",t)}},[]),e},R={body:[]},k=function(){var e=Object(a.useState)(R.body),t=Object(s.a)(e,2),n=t[0],i=t[1],c=Object(a.useState)(null),d=Object(s.a)(c,2),f=d[0],v=d[1],g=Object(a.useState)(null),b=Object(s.a)(g,2),E=b[0],O=b[1],j=Object(a.useState)(null),x=Object(s.a)(j,2),N=x[0],k=x[1],A=T(),P=Object(a.useRef)(null),D=Object(a.useState)({display:"none"}),H=Object(s.a)(D,2),M=H[0],F=H[1],B=Object(a.useState)(null),G=Object(s.a)(B,2),L=G[0],J=G[1],z=Object(a.useState)(null),q=Object(s.a)(z,2),V=q[0],X=q[1],Y=Object(a.useState)(null),K=Object(s.a)(Y,2),Q=K[0],U=K[1],W=Object(a.useState)(!1),Z=Object(s.a)(W,2),$=Z[0],ee=Z[1],te=Object(a.useState)(+localStorage.getItem("translateTiming")||300),ne=Object(s.a)(te,2),ae=ne[0],re=ne[1],ie=Object(a.useState)(+localStorage.getItem("columnDelayTiming")||1e3),ce=Object(s.a)(ie,2),le=ce[0],oe=ce[1],se=Object(u.h)(u.c,{activationConstraint:{distance:1}}),ue=Object(u.h)(u.d,{activationConstraint:{tolerance:5}}),me=Object(u.i)(se,ue);Object(a.useEffect)(function(){localStorage.setItem("translateTiming",ae),localStorage.setItem("columnDelayTiming",le)},[ae,le]),function(e,t){var n=Object(a.useRef)(null),r=Object(a.useRef)(e);Object(a.useEffect)(function(){r.current=e},[e]),Object(a.useEffect)(function(){if("number"===typeof t)return n.current=window.setTimeout(function(){return r.current()},t),function(){return window.clearTimeout(n.current)}},[t])}(function(){U(Q),X("center"),ee(!1)},$?le:null),Object(a.useEffect)(function(){if(E&&n.length)if($&&F({display:"none"}),"center"!==V||$){if(!$){var e=n[Q];Q===n.length&&(e=n[n.length-1]);var t=0;if(Q===n.length&&(t+=E.rect.height+16),F({width:E.rect.width,left:E.rect.left,transition:"transform ".concat(ae,"ms ease 0s"),transform:"translate3d(0px, ".concat(E.rect.top+t,"px, 0px)")}),N){var a=N.find(function(t){return t.id===e._uid});if(a){a=a.data.droppableContainer.rect.current;var r=0;Q===n.length&&(r+=a.height+24),F({width:a.width,left:a.left,transition:"transform ".concat(ae,"ms ease 0s"),transform:"translate3d(0px, ".concat(a.top+r,"px, 0px)")})}}}}else{var i=n.find(function(e){return e._uid===E.id}).columns.length,c=E.rect.width/(i+1),l=E.rect.left+c*i;F({top:0,left:l,width:E.rect.width/(i+1),transition:"transform ".concat(ae,"ms ease 0s"),transform:"translate3d(0px, ".concat(E.rect.top,"px, 0px)")})}},[V,E,Q,N,$]);function de(e,t,a){var r=Object(o.a)(n);if(a){var i=r[e];i&&i.columns.push({_uid:p()(),component:t,props:Object(l.a)({},h[t].props)})}else{var c={_uid:p()(),columns:[{_uid:p()(),component:t,props:Object(l.a)({},h[t].props)}]};r.splice(e,0,c)}return r}var pe=function(){if(f){var e=fe(f.id);return y(e?h[e.component]:h[f.data.current.type])}},fe=function(e){return n.flatMap(function(e){return e.columns}).find(function(t){return t._uid===e})};return r.a.createElement("div",{className:"builder",style:{cursor:f?"grabbing":""}},r.a.createElement(_,null),r.a.createElement("div",{className:"lessons"},"lessons"),r.a.createElement(u.a,{onDragStart:function(e){var t=e.active,n=e.over,a=e.collisions;v(t),O(n),k(a)},onDragEnd:function(e){var t=e.active,a=e.over;if(a)if(0===n.length)i(de(0,t.data.current.type,!1));else{var r=n.map(function(e){return e._uid}).indexOf(a.id);if(-1!==r){"bottom"===V&&(r+=1);var c=fe(f.id);i(c?function(e,t,a){var r=Object(o.a)(n);if(r.map(function(t){var n=t.columns.find(function(t){return t._uid===e._uid});n&&(t.columns=t.columns.filter(function(e){return e._uid!=n._uid}))}),a){var i=r[t];i&&i.columns.push(e)}else{var c={_uid:p()(),columns:[e]};r.splice(t,0,c)}return r=r.filter(function(e){return e.columns.length>0})}(c,r,"center"===V):de(r,t.data.current.type,"center"===V&&!$))}}v(null),O(null),k(null),U(null),X(null),F({display:"none"})},onDragMove:function(e){var t=e.over,a=e.collisions,r=A.current;if(t){O(t),k(a);var i=t.rect,c=t.rect.height,l=i.top,o=i.bottom,s=l+c/5,u=o+c/5,m=r.y>=i.top&&r.y<=i.bottom&&r.x>=i.left&&r.x<=i.right,d=m&&r.y<=s&&r.y>=l,p=m&&r.y>=u&&r.y<=o,f=m&&!d&&!p,v=!m&&r.y<i.top+c/2,g=!m&&r.y>i.top+c/2,b=n.map(function(e){return e._uid}).indexOf(t.id),E=null;-1!==b&&(v?E="top":g?(E="bottom",b+=1):f&&(E="center"),U(b),X(E),"center"!==E&&ee(!1),"center"===E&&"center"!==V&&ee(!0))}},collisionDetection:u.e,modifiers:[m.a],sensors:me,autoScroll:!0},r.a.createElement("div",{className:"lesson-content"},r.a.createElement("div",{style:{display:"flex",gap:"20px",marginBottom:"40px"}},r.a.createElement("label",null,r.a.createElement("div",null,"Translate speed (ms)"),r.a.createElement("input",{type:"number",value:ae,onChange:function(e){return re(parseInt(e.target.value))}})),r.a.createElement("label",null,r.a.createElement("div",null,"Column hover time (ms)"),r.a.createElement("input",{type:"number",value:le,onChange:function(e){return oe(parseInt(e.target.value))}}))),r.a.createElement(w,{items:n,setItems:i,onGridItemClick:function(e){console.log("clicked grid item",e)},dropTargetIndex:Q,placementPreviewRef:P,relativeHoverPosition:V,translateTiming:ae,columnTimerActive:$})),r.a.createElement("div",{className:"sidebar"},null!==L?r.a.createElement(C,{item:L,onSaveChanges:function(e){i(n.map(function(t){return t._uid===e._uid?e:t})),J(null)}}):r.a.createElement(S,null)),r.a.createElement(u.b,{dropAnimation:null},r.a.createElement("div",{style:{opacity:".5",overflow:"hidden",maxHeight:"200px"}},pe())),r.a.createElement(I,{ref:P,style:M},pe())))},A=n(10),P=n(12);A.b.add(P.b,P.a,P.c,P.d,P.e);var D=function(){return r.a.createElement(k,null)},H=function(e){e&&e instanceof Function&&n.e(1).then(n.bind(null,31)).then(function(t){var n=t.getCLS,a=t.getFID,r=t.getFCP,i=t.getLCP,c=t.getTTFB;n(e),a(e),r(e),i(e),c(e)})};c.a.createRoot(document.getElementById("root")).render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(D,null))),H()}},[[17,3,2]]]);
//# sourceMappingURL=main.ae586d68.chunk.js.map