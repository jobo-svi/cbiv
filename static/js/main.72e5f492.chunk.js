(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{14:function(e,t,n){},18:function(e,t,n){e.exports=n(31)},26:function(e,t,n){},31:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),i=n(16),c=n.n(i),l=(n(26),n(2)),o=n(3),u=n(5),s=n(10),m=n(13),d=n.n(m),p=n(6),f=(n(14),function(e){var t=Object(u.l)({id:e.id,data:e.data}),n=t.attributes,a=t.listeners,i=t.setNodeRef;return r.a.createElement("div",Object.assign({ref:i},a,n,{style:{touchAction:"manipulation"}}),e.children)}),g=function(e){return r.a.createElement("div",{className:"undefined-element"},r.a.createElement(p.a,{icon:"fa-solid fa-triangle-exclamation"}),r.a.createElement("span",{className:"message"},"The element '",e.element,"' could not be found"),r.a.createElement(p.a,{icon:"fa-solid fa-triangle-exclamation"}))},v={header:{type:function(e){return r.a.createElement("h1",null,e.text)},component:"header",props:{text:"My Header"},defaultHeight:48},paragraph:{type:function(e){return r.a.createElement("p",null,e.text)},component:"paragraph",props:{text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae."},defaultHeight:96},image:{type:function(e){return r.a.createElement("div",{className:"image-component",style:{justifyContent:e.horizontalAlignment,alignItems:e.verticalAlignment}},r.a.createElement("img",{src:e.src,alt:e.alt}))},component:"image",props:{src:"img/image-2.jpg",alt:"Alt Text"},defaultHeight:826},flipcard:{type:function(e){return r.a.createElement("div",{className:"flip-card-container"},r.a.createElement("div",{className:"flip-card"},r.a.createElement("div",{className:"flip-card-inner"},r.a.createElement("div",{className:"flip-card-front"},e.front),r.a.createElement("div",{className:"flip-card-back"},e.back))))},component:"flipcard",defaultHeight:300}},h=function(e){return v[e.component]&&"undefined"!==typeof v[e.component].type?r.a.createElement(v[e.component].type,function e(t){var n={key:t.id};if(!t.props)return n;for(var a=0,i=Object.entries(t.props);a<i.length;a++){var c=i[a],l=Object(o.a)(c,2),u=l[0],s=l[1],m=null!==s&&"object"===typeof s&&s.hasOwnProperty("component");n[u]=m?r.a.createElement(v[s.component].type,e(s)):s}return n}(e)):r.a.createElement(function(){return r.a.createElement(g,{element:e.component})},{key:e.id})};var b=function(e){return r.a.createElement("div",{className:"builder-elements-menu"},r.a.createElement("div",{className:"element-wrapper"},r.a.createElement(f,{id:"header-menu-item",data:{component:"header",height:v.header.defaultHeight,isNewElement:!0}},r.a.createElement("button",{className:"element"},r.a.createElement(p.a,{icon:"fa-solid fa-heading"})," HEADER"))),r.a.createElement("div",{className:"element-wrapper"},r.a.createElement(f,{id:"paragraph-menu-item",data:{component:"paragraph",height:v.paragraph.defaultHeight,isNewElement:!0}},r.a.createElement("button",{className:"element"},r.a.createElement(p.a,{icon:"fa-solid fa-paragraph"}),"PARAGRAPH"))),r.a.createElement("div",{className:"element-wrapper"},r.a.createElement(f,{id:"image-menu-item",data:{component:"image",height:v.image.defaultHeight,isNewElement:!0}},r.a.createElement("button",{className:"element"},r.a.createElement(p.a,{icon:"fa-solid fa-image"}),"IMAGE"))),r.a.createElement("div",{className:"element-wrapper"},r.a.createElement(f,{id:"flipcard-menu-item",data:{component:"flipcard",height:v.flipcard.defaultHeight,isNewElement:!0}},r.a.createElement("button",{className:"element"},r.a.createElement(p.a,{icon:"fa-solid fa-image"}),"FLIP CARD"))))},E=function(){return r.a.createElement("div",{className:"navbar"},r.a.createElement("div",{className:"course"},r.a.createElement("span",{className:"course-image"}),r.a.createElement("span",{className:"course-title"},"Course Title (edit)")),r.a.createElement("div",{className:"options"},r.a.createElement("span",{className:"option preview"},"Preview")))},w={body:[{id:"row 2",columns:[{id:"row 2 col 1",component:"header",props:{text:"row 2 col 1"}},{id:"row 2 col 2",component:"header",props:{text:"row 2 col 2"}},{id:"row 2 col 3",component:"header",props:{text:"row 2 col 3"}}]},{id:"row 1",columns:[{id:"row 1 col 1",component:"paragraph",props:{text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae."}}]},{id:"row 3",columns:[{id:"row 3 col 1",component:"header",props:{text:"row 3 col 1"}}]},{id:"row 4",columns:[{id:"row 4 col 1",component:"header",props:{text:"row 4 col 1"}}]},{id:"specialrow",columns:[{id:"specialcolumn",component:"header",props:{text:"specialcolumn"}}]}]},y=n(1),N=function(e){var t=e.activatorEvent,n=e.draggingNodeRect,a=e.transform;if(n&&t){var r=Object(y.e)(t);if(!r)return a;var i=r.x-n.left,c=r.y-n.top;return Object(l.a)({},a,{x:a.x+i-n.width,y:a.y+c-n.height/2})}return a},O=function(e){var t=e.translateTiming,n=(e.setTranslateTiming,e.columnDelayTiming),i=e.setColumnDelayTiming,c=e.slopTiming,l=(e.setSlopTiming,e.gridGap);e.setGridGap;return Object(a.useEffect)(function(){localStorage.setItem("translateTiming",t),localStorage.setItem("columnDelayTiming",n),localStorage.setItem("gridGap",l),localStorage.setItem("slopTiming",c)},[t,n,l,c]),r.a.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:"20px",marginBottom:"40px"}},r.a.createElement("label",null,r.a.createElement("div",null,"Column hover time (ms)"),r.a.createElement("input",{type:"number",value:n,onChange:function(e){return i(parseInt(e.target.value))}})))},j=n(34),x={transition:"opacity ".concat(350,"ms"),opacity:0},I={entering:{opacity:0},entered:{opacity:1},exiting:{opacity:1},exited:{opacity:0}},S=function(e){var t=Object(u.m)({id:e.id,data:{id:e.id,rowIndex:e.rowIndex,relativePosition:e.relativePosition,isParentContainer:e.isParentContainer,isPlaceholder:e.isPlaceholder}}),n=t.setNodeRef,i=t.node,c=t.active,s=t.over,m=null;i.current&&c&&s&&!e.isPlaceholder&&0===e.items[e.rowIndex].columns.length&&(m=i.current.clientHeight);var d=Object(a.useState)(!1),p=Object(o.a)(d,2),f=p[0],g=p[1];return Object(a.useEffect)(function(){g(!0)},[]),r.a.createElement(j.a,{nodeRef:i,timeout:1,in:f},function(t){return r.a.createElement("div",{className:"grid-row",ref:n,style:Object(l.a)({height:null!==m?"".concat(m,"px"):""},x,I[t])},e.children)})},P=Object(a.forwardRef)(function(e,t){return r.a.createElement("div",{id:e.id,key:e.id,ref:t,className:"grid-column ".concat(e.className),onMouseOver:function(){return e.setShowDragHandle(!0)},onMouseOut:function(){return e.setShowDragHandle(!1)},style:Object(l.a)({},e.positionStyle,e.style)},e.children)}),T=function(e){var t=Object(s.d)({id:e.id,data:{id:e.id,index:e.index,rowIndex:e.rowIndex,relativePosition:e.relativePosition}}),n=t.attributes,i=t.listeners,c=t.setNodeRef,l=t.setActivatorNodeRef,u=t.transform,m=t.transition,d=t.isDragging,f=t.active,g=Object(a.useState)(!1),v=Object(o.a)(g,2),b=v[0],E=v[1];u&&(u.scaleX=1,u.scaleY=1);var w={transform:y.a.Translate.toString(u),transition:m,opacity:d||e.id.includes("placeholder")?".5":1},N=[];return b&&!f&&N.push("drag-handle-visible"),r.a.createElement(P,Object.assign({ref:c,showDragHandle:b,setShowDragHandle:E,className:N.join(" "),style:w},e),h(e.column),r.a.createElement("div",Object.assign({ref:l},i,n,{className:"drag-handle",style:{display:b&&!f?"":"none"}}),r.a.createElement(p.a,{icon:"fa-solid fa-up-down-left-right"})))},C=function(){var e=Object(a.useState)(w.body),t=Object(o.a)(e,2),n=t[0],i=t[1],c=Object(a.useState)(null),m=Object(o.a)(c,2),f=m[0],g=m[1],y=Object(a.useRef)(null),j=Object(a.useRef)(!1),x=Object(a.useRef)(null),I=Object(u.o)(Object(u.n)(u.e),Object(u.n)(u.d,{coordinateGetter:s.c})),P=Object(a.useState)(null),C=Object(o.a)(P,2),D=C[0],H=(C[1],Object(a.useState)(null)),R=Object(o.a)(H,2),M=(R[0],R[1],Object(a.useState)(+localStorage.getItem("slopTiming")||150)),A=Object(o.a)(M,2),G=A[0],k=A[1],J=Object(a.useState)(+localStorage.getItem("translateTiming")||300),F=Object(o.a)(J,2),L=F[0],q=F[1],B=Object(a.useState)(+localStorage.getItem("columnDelayTiming")||1e3),z=Object(o.a)(B,2),W=z[0],X=z[1],Y=Object(a.useState)(+localStorage.getItem("gridGap")||24),K=Object(o.a)(Y,2),Q=K[0],U=K[1];function V(e,t){return t.flatMap(function(e){return e.columns}).find(function(t){return t.id===e})}var Z=Object(a.useCallback)(function(e){var t=Object(u.j)(e).filter(function(e){return!e.data.droppableContainer.data.current.isParentContainer}),n=Object(u.h)(t,"id");return null!=n?(y.current=n,[{id:n}]):(j.current&&(y.current=f),y.current?[{id:y.current}]:[])},[f,n]);return r.a.createElement("div",{className:"builder",style:{cursor:D?"grabbing":""}},r.a.createElement(E,null),r.a.createElement("div",{className:"lessons"},"lessons"),r.a.createElement(u.a,{sensors:I,modifiers:[N],collisionDetection:Z,onDragStart:function(e){var t=e.active;t.data.current&&t.data.current,g(t.id)},onDragOver:function(e){var t=e.active,a=e.over;if(e.collisions,clearTimeout(x.current),x.current=null,t&&a&&a.data.current.relativePosition&&t.id!==a.id){var r=a.data.current.rowIndex,c=0;"above"===a.data.current.relativePosition?c=-1:"below"===a.data.current.relativePosition&&(c=1),t.data.current.isNewElement?function(e,t,a,r){var c=JSON.parse(JSON.stringify(n));if("new-column-placeholder"!==e.id)if(c.map(function(e){e.columns=e.columns.filter(function(e){return"new-column-placeholder"!==e.id})}),c=c.filter(function(e){return e.columns.length>0}),"within"!==e.data.current.relativePosition){var o={id:"new-row-placeholder",columns:[{id:"new-column-placeholder",component:t.data.current.component,props:Object(l.a)({},v[t.data.current.component].props)}]},u=a+r<0?0:a+r;c.splice(u,0,o),i(c)}else null===x.current&&(x.current=setTimeout(function(){var e=a+r>c.length-1?c.length-1:a+r;c[e].columns.push({id:"new-column-placeholder",component:t.data.current.component,props:Object(l.a)({},v[t.data.current.component].props)}),i(c),x.current=null},W))}(a,t,r,c):function(e,t,a){var r,c,l=JSON.parse(JSON.stringify(n)),o=function(e,t){return t.find(function(t){return t.columns.find(function(t){return t.id===e})})}(t.id,l),u=function(e,t){return t.findIndex(function(t){return t.columns.find(function(t){return t.id===e})})}(t.id,l),s=V(t.id,l),m=(r=o,c=t.id,r.columns.findIndex(function(e){return e.id===c}),V(e.id,l));if(void 0!==m){var p=l.find(function(e){return e.columns.find(function(e){return e.id===m.id})}),f=l.findIndex(function(t){return t.columns.find(function(t){return t.id===e.id})}),g=l[f].columns.findIndex(function(t){return t.id===e.id});l[u].columns=l[u].columns.filter(function(e){return e.id!==s.id});var v=e&&u!==f&&t.rect.current.translated&&t.rect.current.translated.right>e.rect.right-e.rect.width/2;p.columns.splice(g+(v?1:0),0,s);var h=u!==f;h&&null===x.current?x.current=setTimeout(function(){j.current=!0,l=l.filter(function(e){return e.columns.length>0||l.findIndex(function(t){return t.id===e.id})<f}),i(l),x.current=null},W):i(l)}else{var b=e.data.current.rowIndex;if(u===b&&o.columns.length<=1)return;l[b].columns.findIndex(function(t){return t.id===e.id}),l.map(function(e){e.columns=e.columns.filter(function(e){return e.id!==t.id})});var E=b+a<0?0:b+a;l.splice(E,0,{id:d()(),columns:[s]}),l=l.filter(function(e){return e.columns.length>0}),j.current=!0,i(l)}}(a,t,c)}},onDragEnd:function(e){e.over,e.active,e.collisions,clearTimeout(x.current),x.current=null;var t=JSON.parse(JSON.stringify(n));t.map(function(e){"new-row-placeholder"===e.id&&(e.id=d()()),e.columns.map(function(e){"new-column-placeholder"===e.id&&(e.id=d()())})}),t=t.filter(function(e){return e.columns.length>0}),i(t),g(null)}},r.a.createElement("div",{className:"lesson-content"},r.a.createElement(O,{translateTiming:L,setTranslateTiming:q,columnDelayTiming:W,setColumnDelayTiming:X,slopTiming:G,setSlopTiming:k,gridGap:Q,setGridGap:U}),r.a.createElement("div",{className:"grid-wrapper"},r.a.createElement("div",{className:"grid"},r.a.createElement(S,{id:"row-placeholder-start",rowIndex:0,relativePosition:"above",isPlaceholder:!0,activeId:f,items:n},r.a.createElement("div",{style:{height:"24px",width:"100%"}})),n.map(function(e,t){return r.a.createElement("div",{key:e.id},r.a.createElement(S,{id:e.id,isPlaceholder:!1,activeId:f,isParentContainer:!0,items:n,rowIndex:t},r.a.createElement(s.a,{items:e.columns.map(function(e){return e.id}),strategy:s.b},n[t].columns.map(function(e,n){return r.a.createElement(T,{id:e.id,key:e.id,index:n,rowIndex:t,column:e,relativePosition:"within"})}))),r.a.createElement(S,{id:"row-placeholder-".concat(t),rowIndex:t,relativePosition:"below",isPlaceholder:!0,activeId:f,items:n},r.a.createElement("div",{style:{height:"24px",width:"100%"}})))})))),r.a.createElement("div",{className:"sidebar",style:{overflow:"auto"}},r.a.createElement(b,null)),r.a.createElement(u.b,{dropAnimation:null},r.a.createElement("div",{className:"drag-handle-visible"},r.a.createElement("div",{className:"dragging drag-overlay"},function(){if(null!==f){var e=n.flatMap(function(e){return e.columns}).find(function(e){return e.id===f});if(e)return h(v[e.component]);if(f.includes("-menu-item")){var t=f.replace("-menu-item","");return h(v[t])}}return null}()),r.a.createElement("div",{className:"drag-handle"},r.a.createElement(p.a,{icon:"fa-solid fa-up-down-left-right"}))))))},D=n(11),H=n(12);D.b.add(H.b,H.a,H.c,H.d,H.e);var R=function(){return r.a.createElement(C,null)},M=function(e){e&&e instanceof Function&&n.e(1).then(n.bind(null,33)).then(function(t){var n=t.getCLS,a=t.getFID,r=t.getFCP,i=t.getLCP,c=t.getTTFB;n(e),a(e),r(e),i(e),c(e)})};c.a.createRoot(document.getElementById("root")).render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(R,null))),M()}},[[18,3,2]]]);
//# sourceMappingURL=main.72e5f492.chunk.js.map