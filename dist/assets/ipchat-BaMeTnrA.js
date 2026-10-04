import{o as e}from"./rolldown-runtime-C0FnF6B9.js";import{i as t,t as n}from"./vendor-react-TS999BkP.js";import{s as r}from"./index-DNDROIhl.js";var i=e(t(),1),a=n();function o(){return Math.random().toString(36).slice(2,10)}function s(e){return new Date(e).toLocaleTimeString(`en-US`,{hour:`2-digit`,minute:`2-digit`,hour12:!0})}function c(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#x27;`).trim().slice(0,500)}function ee(e,t=800){return new Promise((n,r)=>{let i=new Image,a=URL.createObjectURL(e);i.onload=()=>{let e=document.createElement(`canvas`),{width:r,height:o}=i;if(r>t||o>t){let e=Math.min(t/r,t/o);r=Math.round(r*e),o=Math.round(o*e)}e.width=r,e.height=o,e.getContext(`2d`).drawImage(i,0,0,r,o),URL.revokeObjectURL(a),n(e.toDataURL(`image/jpeg`,.7))},i.onerror=r,i.src=a})}function l(){let[e,t]=(0,i.useState)(`join`),[n,l]=(0,i.useState)(``),[u,d]=(0,i.useState)(``),[f,p]=(0,i.useState)(``),[ne,m]=(0,i.useState)(!1),[re,h]=(0,i.useState)([]),[g,ie]=(0,i.useState)([]),[_,v]=(0,i.useState)(``),[ae,y]=(0,i.useState)(new Set),[b,x]=(0,i.useState)(!1),[oe,S]=(0,i.useState)(null),[C,w]=(0,i.useState)(null),[se,T]=(0,i.useState)(``),[E,D]=(0,i.useState)(null),[O,k]=(0,i.useState)(null),[A,j]=(0,i.useState)(null),[M,N]=(0,i.useState)(null),[ce,P]=(0,i.useState)(!1),[le,F]=(0,i.useState)(!1),[ue,I]=(0,i.useState)(!1),L=(0,i.useRef)(``),R=(0,i.useRef)(``),de=(0,i.useRef)(o()),z=(0,i.useRef)(null),B=(0,i.useRef)(null),V=(0,i.useRef)(null),H=(0,i.useRef)(!1),U=(0,i.useRef)(null),W=(0,i.useRef)({}),G=(0,i.useRef)({}),K=(0,i.useRef)([]),fe=(0,i.useRef)(``);(0,i.useEffect)(()=>{K.current=g},[g]);let q=(0,i.useCallback)(()=>{setTimeout(()=>B.current?.scrollIntoView({behavior:`smooth`}),40)},[]),J=(0,i.useCallback)(e=>{h(t=>[...t,e])},[]),Y=(0,i.useCallback)(async()=>{z.current&&=(await r.removeChannel(z.current),null)},[]),pe=(0,i.useCallback)(e=>{let t=W.current[e];t&&(t.scrollIntoView({behavior:`smooth`,block:`center`}),t.classList.add(`ipc-msg-highlight`),setTimeout(()=>t.classList.remove(`ipc-msg-highlight`),1500))},[]),me=(0,i.useCallback)(e=>{e.type!==`message`||e.deleted||D({id:e.id,username:e.username??``,text:e.text,image:e.image})},[]),he=(0,i.useCallback)((e,t)=>{G.current[e]=t.touches[0].clientX},[]),ge=(0,i.useCallback)((e,t)=>{let n=G.current[e.id]??0,r=t.changedTouches[0].clientX-n;Math.abs(r)>=60&&e.type===`message`&&!e.deleted&&D({id:e.id,username:e.username??``,text:e.text,image:e.image})},[]),X=(0,i.useCallback)(async()=>{let e=c(n).slice(0,24),i=c(u).slice(0,64);if(!e){p(`⚠ Enter a username`);return}if(!i){p(`⚠ Enter a valid IP — e.g. 192.168.1.1`);return}if(!/^(\d{1,3}\.){3}\d{1,3}$/.test(i)){p(`⚠ Invalid IP — Enter like 192.168.1.1`);return}if(i.split(`.`).map(Number).some(e=>e<0||e>255)){p(`⚠ Each number must be 0–255 — e.g. 192.168.1.1`);return}p(``),m(!0),L.current=e,R.current=i;let a=`ipchat_${i.replace(/[^a-zA-Z0-9_-]/g,`_`)}`,s=r.channel(a,{config:{presence:{key:de.current}}});z.current=s,s.on(`presence`,{event:`sync`},()=>{let e=s.presenceState(),t=Object.entries(e).map(([e,t])=>({presenceKey:e,username:t[0]?.username??`unknown`,joinedAt:t[0]?.joinedAt??Date.now()}));ie(t)}),s.on(`presence`,{event:`join`},({newPresences:e})=>{let t=e[0]?.username;t&&t!==L.current&&(J({id:o(),type:`system`,text:`${t} joined the room`,timestamp:Date.now(),systemKind:`join`}),q())}),s.on(`presence`,{event:`leave`},({leftPresences:e})=>{let t=e[0]?.username;t&&(J({id:o(),type:`system`,text:`${t} left the room`,timestamp:Date.now(),systemKind:`leave`}),y(e=>{let n=new Set(e);return n.delete(t),n}),q())}),s.on(`broadcast`,{event:`message`},({payload:e})=>{e.username!==L.current&&(J({id:e.id??o(),type:`message`,username:e.username,text:e.text,image:e.image,timestamp:e.timestamp,isSelf:!1,replyTo:e.replyTo??void 0}),q())}),s.on(`broadcast`,{event:`typing`},({payload:e})=>{e.username!==L.current&&y(t=>{let n=new Set(t);return e.isTyping?n.add(e.username):n.delete(e.username),n})}),s.on(`broadcast`,{event:`clear`},({payload:e})=>{h([{id:o(),type:`system`,text:`${e.username} cleared the chat`,timestamp:Date.now(),systemKind:`clear`}]),q()}),s.on(`broadcast`,{event:`delete_single`},({payload:e})=>{h(t=>t.map(t=>t.id===e.msgId?{...t,deleted:!0,text:`This message was deleted.`,image:void 0,replyTo:void 0}:t))}),s.on(`broadcast`,{event:`request_all_clear`},({payload:e})=>{let t=K.current.length-1;j({requestedBy:e.requestedBy,votes:{[e.requestedBy]:`accept`},totalMembers:t}),N(null),P(!0)}),s.on(`broadcast`,{event:`all_clear_vote`},({payload:e})=>{j(t=>t&&{...t,votes:{...t.votes,[e.username]:e.vote}})}),s.on(`broadcast`,{event:`force_clear_all`},({payload:e})=>{let{requestedBy:t,acceptCount:n,rejectCount:r}=e,i=n==null?``:` (${n} accept, ${r} reject)`;h([{id:o(),type:`system`,text:`— Fresh start by ${t}${i} —`,timestamp:Date.now(),systemKind:`clear`}]),P(!1),j(null),N(null),D(null),w(null),q()}),s.subscribe(async n=>{n===`SUBSCRIBED`?(await s.track({username:e,joinedAt:Date.now()}),t(`chat`),m(!1),J({id:o(),type:`system`,text:`— Start of conversation —`,timestamp:Date.now(),systemKind:`info`}),q()):(n===`CHANNEL_ERROR`||n===`TIMED_OUT`)&&(p(`⚠ Failed to connect. Try again.`),m(!1),Y())})},[n,u,J,q,Y]),_e=(0,i.useCallback)(async()=>{let e=c(_);if(!e&&!C||!z.current)return;let t=o(),n=Date.now(),r=C??void 0,i=E??void 0;J({id:t,type:`message`,username:L.current,text:e,image:r,timestamp:n,isSelf:!0,replyTo:i}),q(),await z.current.send({type:`broadcast`,event:`message`,payload:{id:t,username:L.current,text:e,image:r,timestamp:n,replyTo:i}}),v(``),w(null),D(null),Z()},[_,C,E,J,q]),ve=(0,i.useCallback)(async e=>{let t=e.target.files?.[0];if(t){if(!t.type.startsWith(`image/`)){T(`Only image files allowed`);return}if(t.size>10485760){T(`Image too large (max 10MB)`);return}T(``);try{let e=await ee(t);w(e)}catch{T(`Failed to process image`)}e.target.value=``}},[]),Z=(0,i.useCallback)(()=>{H.current&&(H.current=!1,z.current?.send({type:`broadcast`,event:`typing`,payload:{username:L.current,isTyping:!1}})),V.current&&clearTimeout(V.current)},[]),ye=(0,i.useCallback)(e=>{v(e.target.value),H.current||(H.current=!0,z.current?.send({type:`broadcast`,event:`typing`,payload:{username:L.current,isTyping:!0}})),V.current&&clearTimeout(V.current),V.current=setTimeout(Z,2e3)},[Z]),be=(0,i.useCallback)(async e=>{z.current&&(await z.current.send({type:`broadcast`,event:`delete_single`,payload:{msgId:e}}),k(null))},[]),xe=(0,i.useCallback)(async()=>{if(!z.current)return;let e=K.current.length-1;j({requestedBy:L.current,votes:{[L.current]:`accept`},totalMembers:e}),N(`accept`),P(!1),await z.current.send({type:`broadcast`,event:`request_all_clear`,payload:{requestedBy:L.current}})},[]),Se=(0,i.useCallback)(async e=>{z.current&&!M&&(N(e),j(t=>t&&{...t,votes:{...t.votes,[L.current]:e}}),await z.current.send({type:`broadcast`,event:`all_clear_vote`,payload:{username:L.current,vote:e}}))},[M]);(0,i.useEffect)(()=>{if(!A)return;let e=JSON.stringify(A.votes);if(e===fe.current)return;fe.current=e;let t=K.current.map(e=>e.username).filter(e=>e!==A.requestedBy),n=t.map(e=>A.votes[e]).filter(e=>e===`accept`||e===`reject`),r=n.filter(e=>e===`accept`).length,i=n.filter(e=>e===`reject`).length;if(t.length>0&&n.length>=t.length){if(r>i){if(L.current===A.requestedBy&&z.current){z.current.send({type:`broadcast`,event:`force_clear_all`,payload:{requestedBy:A.requestedBy,acceptCount:r,rejectCount:i}});let e=` (${r} accept, ${i} reject)`;h([{id:o(),type:`system`,text:`— Fresh start by ${A.requestedBy}${e} —`,timestamp:Date.now(),systemKind:`clear`}]),j(null),N(null),P(!1),D(null),w(null)}}else setTimeout(()=>{P(!1),j(null),N(null)},1200),J({id:o(),type:`system`,text:`Restart rejected (${r} accept, ${i} reject) — conversation continues.`,timestamp:Date.now(),systemKind:`info`})}},[A,J]);let Ce=(0,i.useCallback)(async()=>{Z(),await Y(),t(`join`),h([]),ie([]),v(``),y(new Set),w(null),x(!1),D(null),j(null),P(!1),F(!1),I(!1),N(null),k(null),L.current=``,R.current=``},[Y,Z]);(0,i.useEffect)(()=>()=>{Y()},[Y]),(0,i.useEffect)(()=>{if(!O)return;let e=()=>k(null);return window.addEventListener(`click`,e),()=>window.removeEventListener(`click`,e)},[O]);let we=e=>{e.key===`Enter`&&X()},Te=e=>{e.key===`Enter`&&_e()},Q=Array.from(ae),$=Q.length===1?`${Q[0]} is typing`:Q.length>1?`${Q.join(`, `)} are typing`:``,Ee=g.length,De=A?Object.entries(A.votes).filter(([e,t])=>e!==A.requestedBy&&t===`accept`).length:0,Oe=A?Object.entries(A.votes).filter(([e,t])=>e!==A.requestedBy&&t===`reject`).length:0,ke=A?g.filter(e=>e.username!==A.requestedBy).length:0;return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(`style`,{children:te}),oe&&(0,a.jsxs)(`div`,{className:`ipc-lightbox`,onClick:()=>S(null),children:[(0,a.jsx)(`button`,{className:`ipc-lightbox-close`,onClick:()=>S(null),children:`✕`}),(0,a.jsx)(`img`,{src:oe,alt:`Full size`,className:`ipc-lightbox-img`})]}),O&&(0,a.jsxs)(`div`,{className:`ipc-ctx-menu`,style:{top:O.y,left:O.x},onClick:e=>e.stopPropagation(),children:[(0,a.jsx)(`button`,{className:`ipc-ctx-item ipc-ctx-danger`,onClick:()=>be(O.msgId),children:`🗑 Delete for Everyone`}),(0,a.jsx)(`button`,{className:`ipc-ctx-item`,onClick:()=>k(null),children:`Cancel`})]}),le&&(0,a.jsx)(`div`,{className:`ipc-modal-backdrop`,children:(0,a.jsxs)(`div`,{className:`ipc-modal ipc-confirm-modal`,children:[(0,a.jsx)(`div`,{className:`ipc-modal-icon`,children:`🗑`}),(0,a.jsx)(`div`,{className:`ipc-modal-title`,children:`Delete My Messages`}),(0,a.jsxs)(`div`,{className:`ipc-modal-body`,children:[`Your messages will be deleted for `,(0,a.jsx)(`strong`,{children:`everyone`}),` in this room.`,(0,a.jsx)(`br`,{}),`This cannot be undone.`]}),(0,a.jsxs)(`div`,{className:`ipc-modal-btns`,children:[(0,a.jsx)(`button`,{className:`ipc-modal-btn ipc-btn-reject`,onClick:()=>F(!1),children:`Cancel`}),(0,a.jsx)(`button`,{className:`ipc-modal-btn ipc-btn-accept`,onClick:()=>{F(!1),z.current&&h(e=>(e.filter(e=>e.type===`message`&&e.isSelf&&!e.deleted).forEach(e=>{z.current?.send({type:`broadcast`,event:`delete_single`,payload:{msgId:e.id}})}),e.map(e=>e.isSelf&&e.type===`message`&&!e.deleted?{...e,deleted:!0,text:`This message was deleted.`,image:void 0,replyTo:void 0}:e)))},children:`✓ Delete`})]})]})}),ue&&(0,a.jsx)(`div`,{className:`ipc-modal-backdrop`,children:(0,a.jsxs)(`div`,{className:`ipc-modal ipc-confirm-modal`,children:[(0,a.jsx)(`div`,{className:`ipc-modal-icon`,children:`🔄`}),(0,a.jsx)(`div`,{className:`ipc-modal-title`,children:`Request Fresh Start`}),(0,a.jsxs)(`div`,{className:`ipc-modal-body`,children:[`A vote will be sent to all room members.`,(0,a.jsx)(`br`,{}),(0,a.jsx)(`strong`,{children:`Majority accept`}),` = fresh conversation starts.`,(0,a.jsx)(`br`,{}),(0,a.jsx)(`strong`,{children:`Equal or more reject`}),` = conversation continues.`]}),(0,a.jsxs)(`div`,{className:`ipc-modal-btns`,children:[(0,a.jsx)(`button`,{className:`ipc-modal-btn ipc-btn-reject`,onClick:()=>I(!1),children:`Cancel`}),(0,a.jsx)(`button`,{className:`ipc-modal-btn ipc-btn-accept`,onClick:()=>{I(!1),xe()},children:`✓ Send Request`})]})]})}),ce&&A&&(0,a.jsx)(`div`,{className:`ipc-modal-backdrop`,children:(0,a.jsxs)(`div`,{className:`ipc-modal`,children:[(0,a.jsx)(`div`,{className:`ipc-modal-icon`,children:`🔄`}),(0,a.jsx)(`div`,{className:`ipc-modal-title`,children:`Restart Request`}),(0,a.jsxs)(`div`,{className:`ipc-modal-body`,children:[(0,a.jsx)(`strong`,{children:A.requestedBy}),` wants to start a fresh conversation.`,(0,a.jsx)(`br`,{}),`Majority accept = restart. Equal or more reject = continue.`]}),(0,a.jsxs)(`div`,{className:`ipc-modal-votes`,children:[(0,a.jsxs)(`span`,{className:`ipc-vote-accept`,children:[`✓ `,De,` accepted`]}),(0,a.jsxs)(`span`,{className:`ipc-vote-reject`,children:[`✕ `,Oe,` rejected`]}),(0,a.jsxs)(`span`,{className:`ipc-vote-total`,children:[`of `,ke]})]}),M?(0,a.jsxs)(`div`,{className:`ipc-modal-voted`,children:[`You voted: `,(0,a.jsx)(`strong`,{className:M===`accept`?`ipc-voted-yes`:`ipc-voted-no`,children:M===`accept`?`✓ Accept`:`✕ Reject`}),(0,a.jsx)(`br`,{}),(0,a.jsx)(`span`,{className:`ipc-modal-waiting`,children:`Waiting for others…`})]}):(0,a.jsxs)(`div`,{className:`ipc-modal-btns`,children:[(0,a.jsx)(`button`,{className:`ipc-modal-btn ipc-btn-accept`,onClick:()=>Se(`accept`),children:`✓ Accept`}),(0,a.jsx)(`button`,{className:`ipc-modal-btn ipc-btn-reject`,onClick:()=>Se(`reject`),children:`✕ Reject`})]})]})}),e===`join`&&(0,a.jsxs)(`div`,{className:`ipc-wrap`,children:[(0,a.jsx)(`div`,{className:`ipc-grid-bg`}),(0,a.jsxs)(`div`,{className:`ipc-join-card`,children:[(0,a.jsxs)(`div`,{className:`ipc-logo`,children:[(0,a.jsx)(`span`,{className:`ipc-br`,children:`[`}),(0,a.jsx)(`span`,{className:`ipc-lip`,children:`IP`}),(0,a.jsx)(`span`,{className:`ipc-lch`,children:`CHAT`}),(0,a.jsx)(`span`,{className:`ipc-br`,children:`]`})]}),(0,a.jsx)(`p`,{className:`ipc-sub`,children:`Enter a shared IP address to join the same room`}),(0,a.jsxs)(`div`,{className:`ipc-field`,children:[(0,a.jsx)(`label`,{className:`ipc-lbl`,children:`USERNAME`}),(0,a.jsxs)(`div`,{className:`ipc-iw`,children:[(0,a.jsx)(`span`,{className:`ipc-ii`,children:`›`}),(0,a.jsx)(`input`,{className:`ipc-in`,type:`text`,placeholder:`e.g. alice`,value:n,maxLength:24,autoComplete:`off`,spellCheck:!1,onChange:e=>l(e.target.value),onKeyDown:we})]})]}),(0,a.jsxs)(`div`,{className:`ipc-field`,children:[(0,a.jsxs)(`label`,{className:`ipc-lbl`,children:[`ROOM CODE `,(0,a.jsx)(`span`,{className:`ipc-lbl-s`,children:`(IP ADDRESS)`})]}),(0,a.jsxs)(`div`,{className:`ipc-iw`,children:[(0,a.jsx)(`span`,{className:`ipc-ii`,children:`⬡`}),(0,a.jsx)(`input`,{className:`ipc-in`,type:`text`,placeholder:`e.g. 192.168.1.1`,value:u,maxLength:15,autoComplete:`off`,spellCheck:!1,inputMode:`numeric`,onChange:e=>{let t=e.target.value.replace(/[^0-9.]/g,``).split(`.`);if(t.length>4)return;let n=t.map(e=>e.slice(0,3)).join(`.`);d(n)},onKeyDown:e=>{let t=u.split(`.`),n=t[t.length-1];if(/^[0-9]$/.test(e.key)&&n.length===3&&t.length<4){e.preventDefault(),d(u+`.`+e.key);return}e.key===`Enter`&&X()}})]}),(0,a.jsx)(`p`,{className:`ipc-hint`,children:`Enter a valid IP like 192.168.1.1 — only numbers allowed`})]}),(0,a.jsxs)(`button`,{className:`ipc-conn-btn`,onClick:X,disabled:ne,children:[(0,a.jsx)(`span`,{children:ne?`CONNECTING...`:`CONNECT`}),(0,a.jsx)(`span`,{className:`ipc-arr`,children:`→`}),(0,a.jsx)(`div`,{className:`ipc-btn-glow`})]}),f&&(0,a.jsx)(`div`,{className:`ipc-err`,children:f}),(0,a.jsxs)(`div`,{className:`ipc-footer`,children:[(0,a.jsx)(`span`,{className:`ipc-dot`}),` No data stored`,(0,a.jsx)(`span`,{className:`ipc-sep`,children:`·`}),(0,a.jsx)(`span`,{className:`ipc-dot`}),` Ephemeral sessions`,(0,a.jsx)(`span`,{className:`ipc-sep`,children:`·`}),(0,a.jsx)(`span`,{className:`ipc-dot`}),` Unlimited users`]}),(0,a.jsxs)(`div`,{className:`ipc-brand-footer`,children:[`crafted by `,(0,a.jsx)(`span`,{className:`ipc-brand-name`,children:`AxelleVault`})]})]})]}),e===`chat`&&(0,a.jsxs)(`div`,{className:`ipc-chat-root`,children:[(0,a.jsx)(`div`,{className:`ipc-grid-bg`}),b&&(0,a.jsx)(`div`,{className:`ipc-sidebar-backdrop`,onClick:()=>x(!1)}),(0,a.jsxs)(`aside`,{className:`ipc-sidebar${b?` ipc-sidebar-open`:``}`,children:[(0,a.jsxs)(`div`,{className:`ipc-sidebar-logo`,children:[(0,a.jsx)(`span`,{className:`ipc-br`,children:`[`}),(0,a.jsx)(`span`,{className:`ipc-lip`,children:`IP`}),(0,a.jsx)(`span`,{className:`ipc-lch`,children:`CHAT`}),(0,a.jsx)(`span`,{className:`ipc-br`,children:`]`})]}),(0,a.jsxs)(`div`,{className:`ipc-room-box`,children:[(0,a.jsx)(`div`,{className:`ipc-room-lbl`,children:`ACTIVE ROOM`}),(0,a.jsx)(`div`,{className:`ipc-room-ip`,children:R.current}),(0,a.jsxs)(`div`,{className:`ipc-room-online`,children:[(0,a.jsx)(`span`,{className:`ipc-pulse`}),Ee,` online`]})]}),(0,a.jsxs)(`div`,{className:`ipc-members`,children:[(0,a.jsx)(`div`,{className:`ipc-mem-lbl`,children:`MEMBERS`}),(0,a.jsx)(`ul`,{className:`ipc-mem-list`,children:g.map(e=>(0,a.jsxs)(`li`,{className:`ipc-mem-item`,children:[(0,a.jsx)(`span`,{className:`ipc-mem-dot`}),(0,a.jsx)(`span`,{className:`ipc-mem-name`,children:e.username}),e.username===L.current&&(0,a.jsx)(`span`,{className:`ipc-you`,children:`you`})]},e.presenceKey))})]}),(0,a.jsxs)(`div`,{className:`ipc-sb-bottom`,children:[(0,a.jsx)(`button`,{className:`ipc-leave-btn`,onClick:Ce,children:`← Leave Room`}),(0,a.jsxs)(`div`,{className:`ipc-ver`,children:[(0,a.jsx)(`span`,{style:{color:`var(--tm)`},children:`made by`}),(0,a.jsx)(`span`,{className:`ipc-brand-tag`,children:` AxelleVault`})]})]})]}),(0,a.jsxs)(`main`,{className:`ipc-main`,children:[(0,a.jsxs)(`header`,{className:`ipc-header`,children:[(0,a.jsx)(`button`,{className:`ipc-hamburger`,onClick:()=>x(e=>!e),children:(0,a.jsxs)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:[(0,a.jsx)(`line`,{x1:`3`,y1:`6`,x2:`21`,y2:`6`}),(0,a.jsx)(`line`,{x1:`3`,y1:`12`,x2:`21`,y2:`12`}),(0,a.jsx)(`line`,{x1:`3`,y1:`18`,x2:`21`,y2:`18`})]})}),(0,a.jsxs)(`div`,{className:`ipc-hroom`,children:[(0,a.jsx)(`span`,{className:`ipc-hpre`,children:`ROOM //`}),(0,a.jsx)(`span`,{className:`ipc-hid`,children:R.current})]}),(0,a.jsxs)(`div`,{className:`ipc-hactions`,children:[(0,a.jsxs)(`button`,{className:`ipc-clear-btn ipc-clear-mine`,onClick:()=>F(!0),children:[(0,a.jsxs)(`svg`,{width:`11`,height:`11`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:[(0,a.jsx)(`polyline`,{points:`3,6 5,6 21,6`}),(0,a.jsx)(`path`,{d:`M19,6l-1,14H6L5,6`}),(0,a.jsx)(`path`,{d:`M10,11v6M14,11v6`}),(0,a.jsx)(`path`,{d:`M9,6V4h6v2`})]}),(0,a.jsx)(`span`,{className:`ipc-clear-label`,children:`CLEAR`})]}),(0,a.jsxs)(`button`,{className:`ipc-clear-btn ipc-allclear-btn`,onClick:()=>I(!0),children:[(0,a.jsxs)(`svg`,{width:`11`,height:`11`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:[(0,a.jsx)(`path`,{d:`M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0`}),(0,a.jsx)(`path`,{d:`M9 12l2 2 4-4`})]}),(0,a.jsx)(`span`,{className:`ipc-clear-label`,children:`ALL CLEAR`})]}),(0,a.jsxs)(`div`,{className:`ipc-badge`,children:[(0,a.jsx)(`span`,{className:`ipc-badge-dot`}),L.current]})]})]}),(0,a.jsxs)(`div`,{className:`ipc-msgs`,children:[re.map(e=>e.type===`system`?(0,a.jsx)(`div`,{className:`ipc-sys ipc-sys-${e.systemKind}`,children:e.text},e.id):(0,a.jsxs)(`div`,{className:`ipc-mwrap ${e.isSelf?`ipc-self`:`ipc-other`} ${e.deleted?`ipc-deleted`:``}`,ref:t=>{W.current[e.id]=t},onDoubleClick:()=>me(e),onTouchStart:t=>he(e.id,t),onTouchEnd:t=>ge(e,t),onContextMenu:e.isSelf&&!e.deleted?t=>{t.preventDefault(),k({msgId:e.id,x:t.clientX,y:t.clientY})}:void 0,children:[(0,a.jsxs)(`div`,{className:`ipc-mmeta`,children:[!e.isSelf&&(0,a.jsx)(`span`,{className:`ipc-muser`,children:e.username}),(0,a.jsx)(`span`,{className:`ipc-mtime`,children:s(e.timestamp)}),!e.deleted&&(0,a.jsx)(`button`,{className:`ipc-reply-hint`,title:`Reply`,onClick:()=>me(e),children:`↩`})]}),e.replyTo&&!e.deleted&&(0,a.jsxs)(`div`,{className:`ipc-reply-preview`,onClick:()=>pe(e.replyTo.id),title:`Jump to original`,children:[(0,a.jsx)(`div`,{className:`ipc-reply-preview-user`,children:e.replyTo.username}),(0,a.jsxs)(`div`,{className:`ipc-reply-preview-text`,children:[e.replyTo.image&&!e.replyTo.text&&`📷 Image`,e.replyTo.text&&e.replyTo.text.slice(0,80)]})]}),e.image&&!e.deleted&&(0,a.jsxs)(`div`,{className:`ipc-img-bubble`,onClick:()=>S(e.image),children:[(0,a.jsx)(`img`,{src:e.image,alt:`shared`,className:`ipc-img-thumb`}),(0,a.jsx)(`div`,{className:`ipc-img-overlay`,children:(0,a.jsx)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:(0,a.jsx)(`path`,{d:`M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7`})})})]}),(0,a.jsx)(`div`,{className:`ipc-bubble ${e.deleted?`ipc-bubble-deleted`:``}`,children:e.text||(e.deleted?`This message was deleted.`:``)})]},e.id)),(0,a.jsx)(`div`,{ref:B})]}),(0,a.jsx)(`div`,{className:`ipc-typing ${$?`ipc-typing-on`:``}`,children:$&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(`span`,{className:`ipc-tdots`,children:[(0,a.jsx)(`span`,{}),(0,a.jsx)(`span`,{}),(0,a.jsx)(`span`,{})]}),(0,a.jsx)(`span`,{children:$})]})}),E&&(0,a.jsxs)(`div`,{className:`ipc-reply-bar`,children:[(0,a.jsxs)(`div`,{className:`ipc-reply-bar-inner`,children:[(0,a.jsx)(`div`,{className:`ipc-reply-bar-accent`}),(0,a.jsxs)(`div`,{className:`ipc-reply-bar-content`,children:[(0,a.jsxs)(`div`,{className:`ipc-reply-bar-user`,children:[`↩ Replying to `,E.username]}),(0,a.jsxs)(`div`,{className:`ipc-reply-bar-text`,children:[E.image&&!E.text&&`📷 Image`,E.text&&E.text.slice(0,80)]})]})]}),(0,a.jsx)(`button`,{className:`ipc-reply-cancel`,onClick:()=>D(null),children:`✕`})]}),C&&(0,a.jsxs)(`div`,{className:`ipc-img-preview-bar`,children:[(0,a.jsx)(`img`,{src:C,alt:`preview`,className:`ipc-img-preview-thumb`}),(0,a.jsx)(`span`,{className:`ipc-img-preview-label`,children:`Image ready to send`}),(0,a.jsx)(`button`,{className:`ipc-img-preview-remove`,onClick:()=>w(null),children:`✕`})]}),se&&(0,a.jsx)(`div`,{className:`ipc-upload-err`,children:se}),(0,a.jsxs)(`div`,{className:`ipc-bar`,children:[(0,a.jsx)(`input`,{ref:U,type:`file`,accept:`image/*`,style:{display:`none`},onChange:ve}),(0,a.jsx)(`button`,{className:`ipc-attach`,onClick:()=>U.current?.click(),title:`Send image`,children:(0,a.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:[(0,a.jsx)(`rect`,{x:`3`,y:`3`,width:`18`,height:`18`,rx:`2`,ry:`2`}),(0,a.jsx)(`circle`,{cx:`8.5`,cy:`8.5`,r:`1.5`}),(0,a.jsx)(`polyline`,{points:`21,15 16,10 5,21`})]})}),(0,a.jsx)(`input`,{className:`ipc-msg-in`,type:`text`,placeholder:`Type a message…`,value:_,maxLength:500,autoComplete:`off`,spellCheck:!1,inputMode:`text`,enterKeyHint:`send`,onChange:ye,onKeyDown:Te,onFocus:e=>{setTimeout(()=>e.target.scrollIntoView({behavior:`smooth`,block:`nearest`}),300)}}),(0,a.jsxs)(`button`,{className:`ipc-send`,onClick:_e,children:[(0,a.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,children:[(0,a.jsx)(`line`,{x1:`22`,y1:`2`,x2:`11`,y2:`13`}),(0,a.jsx)(`polygon`,{points:`22,2 15,22 11,13 2,9`})]}),(0,a.jsx)(`div`,{className:`ipc-send-glow`})]})]})]})]})]})}var te=`
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Share+Tech+Mono&display=swap');

  /* ── FULL SCREEN FIX ── */
  html, body { height:100%; margin:0; padding:0; overflow:hidden; }
  #root { height:100%; width:100%; }



  /* ── MOBILE VIEWPORT FIX ── */
  /* Use dvh (dynamic viewport height) — shrinks when keyboard opens */
  .ipc-chat-root {
    height: 100dvh;
    height: 100vh; /* fallback */
  }

  /* ── VARS ── */
  .ipc-wrap, .ipc-chat-root {
    --c:  #00d4ff; --cd:#00a8cc; --cg:rgba(0,212,255,0.08);
    --bg: #070b14; --bg2:#0c1220; --bg3:#111827;
    --bo: #1a2840; --bo2:#1e3050;
    --gr: #00ff88; --re:#ff4466;
    --tx: #c8d8f0; --td:#5a7090; --tm:#324560;
    --mo: 'Share Tech Mono', monospace;
    --sa: 'Rajdhani', sans-serif;
    --sp: 'Space Mono', monospace;
    --ra: 6px;
  }

  /* ── SCREENS ── */
  .ipc-wrap {
    width:100vw; height:100vh; position:fixed; inset:0;
    background:var(--bg); color:var(--tx); font-family:var(--sa);
    display:flex; align-items:center; justify-content:center; overflow:hidden;
  }
  .ipc-chat-root {
    width:100vw; height:100vh; position:fixed; inset:0;
    background:var(--bg); color:var(--tx); font-family:var(--sa);
    display:flex; flex-direction:row; overflow:hidden;
  }

  /* ── GRID BG ── */
  .ipc-grid-bg {
    position:absolute; inset:0; pointer-events:none; z-index:0;
    background-image:
      linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),
      linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px);
    background-size:40px 40px;
  }

  /* ── JOIN CARD ── */
  .ipc-join-card {
    position:relative; z-index:10;
    width:min(420px, 94vw);
    background:var(--bg2); border:1px solid var(--bo2); border-radius:10px;
    padding:clamp(24px,5vw,42px) clamp(20px,5vw,40px) clamp(20px,4vw,36px);
    box-shadow:0 0 0 1px rgba(0,212,255,0.06),0 0 60px rgba(0,212,255,0.06),0 24px 80px rgba(0,0,0,0.6);
    animation:ipcIn .45s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes ipcIn { from{opacity:0;transform:translateY(20px) scale(.98)} to{opacity:1;transform:none} }

  .ipc-logo  { text-align:center; font-family:var(--sp); font-size:clamp(24px,5vw,34px); font-weight:700; letter-spacing:6px; margin-bottom:10px; }
  .ipc-br    { color:var(--td); }
  .ipc-lip   { color:var(--tx); }
  .ipc-lch   { color:var(--c); text-shadow:0 0 16px var(--c); }
  .ipc-sub   { text-align:center; color:var(--td); font-family:var(--mo); font-size:11.5px; letter-spacing:.5px; margin-bottom:34px; line-height:1.6; }
  .ipc-field { margin-bottom:20px; }
  .ipc-lbl   { display:block; font-family:var(--mo); font-size:10px; letter-spacing:2px; color:var(--cd); margin-bottom:8px; }
  .ipc-lbl-s { color:var(--tm); font-size:9px; }
  .ipc-iw    { position:relative; display:flex; align-items:center; }
  .ipc-ii    { position:absolute; left:14px; color:var(--cd); font-family:var(--mo); font-size:16px; pointer-events:none; opacity:.7; }
  .ipc-in    { width:100%; background:var(--bg3); border:1px solid var(--bo); border-radius:var(--ra); color:var(--tx); font-family:var(--mo); font-size:13px; padding:13px 16px 13px 36px; outline:none; transition:border-color .2s,box-shadow .2s; letter-spacing:.5px; }
  .ipc-in::placeholder { color:var(--tm); }
  .ipc-in:focus { border-color:var(--cd); box-shadow:0 0 0 3px var(--cg); }
  .ipc-hint  { margin-top:7px; font-family:var(--mo); font-size:10.5px; color:var(--tm); letter-spacing:.3px; }

  .ipc-conn-btn {
    position:relative; width:100%; margin-top:10px; padding:15px 24px;
    background:var(--c); border:none; border-radius:var(--ra);
    color:#060e1a; font-family:var(--sp); font-size:13px; font-weight:700;
    letter-spacing:3px; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:10px;
    transition:transform .15s,box-shadow .2s,background .2s; overflow:hidden;
  }
  .ipc-conn-btn:hover:not(:disabled) { background:#22e8ff; transform:translateY(-1px); box-shadow:0 0 28px rgba(0,212,255,.45); }
  .ipc-conn-btn:disabled { opacity:.7; cursor:not-allowed; }
  .ipc-arr   { font-size:16px; transition:transform .2s; }
  .ipc-conn-btn:hover .ipc-arr { transform:translateX(4px); }
  .ipc-btn-glow { position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.15),transparent 60%); pointer-events:none; }
  .ipc-err   { margin-top:12px; font-family:var(--mo); font-size:11px; color:var(--re); text-align:center; letter-spacing:.5px; }
  .ipc-footer { margin-top:28px; text-align:center; font-family:var(--mo); font-size:9.5px; color:var(--tm); letter-spacing:.5px; display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:wrap; }
  .ipc-dot   { width:4px; height:4px; background:var(--gr); border-radius:50%; display:inline-block; box-shadow:0 0 6px var(--gr); }
  .ipc-sep   { opacity:.3; }

  /* ── HAMBURGER ── */
  .ipc-hamburger {
    display:none; background:transparent; border:1px solid var(--bo); border-radius:4px;
    color:var(--td); padding:6px 8px; cursor:pointer;
    align-items:center; justify-content:center; transition:all .2s; flex-shrink:0;
  }
  .ipc-hamburger:hover { border-color:var(--c); color:var(--c); }

  /* ── BACKDROP ── */
  .ipc-sidebar-backdrop {
    display:none; position:fixed; inset:0;
    background:rgba(0,0,0,0.6); z-index:19; backdrop-filter:blur(2px);
  }

  /* ── SIDEBAR ── */
  .ipc-sidebar {
    width:260px; min-width:260px; height:100%;
    background:var(--bg2); border-right:1px solid var(--bo);
    display:flex; flex-direction:column; flex-shrink:0; position:relative; z-index:20;
    transition:transform .3s cubic-bezier(.22,1,.36,1);
  }
  .ipc-sidebar-logo { padding:22px 20px 16px; font-family:var(--sp); font-size:17px; font-weight:700; letter-spacing:4px; border-bottom:1px solid var(--bo); }
  .ipc-room-box  { margin:12px 12px 0; background:rgba(0,212,255,.04); border:1px solid rgba(0,212,255,.12); border-radius:var(--ra); padding:12px 14px; }
  .ipc-room-lbl  { font-family:var(--mo); font-size:11px; letter-spacing:2px; color:var(--tm); margin-bottom:6px; }
  .ipc-room-ip   { font-family:var(--mo); font-size:15px; color:var(--c); letter-spacing:1px; margin-bottom:8px; word-break:break-all; }
  .ipc-room-online { font-family:var(--mo); font-size:13px; color:var(--td); display:flex; align-items:center; gap:6px; }
  .ipc-pulse { width:7px; height:7px; background:var(--gr); border-radius:50%; display:inline-block; box-shadow:0 0 6px var(--gr); animation:ipcPulse 2s ease-in-out infinite; }
  @keyframes ipcPulse { 0%,100%{opacity:1;box-shadow:0 0 6px var(--gr)} 50%{opacity:.6;box-shadow:0 0 12px var(--gr)} }

  .ipc-members   { flex:1; overflow-y:auto; padding:12px 12px 0; scrollbar-width:thin; scrollbar-color:var(--bo) transparent; }
  .ipc-mem-lbl   { font-family:var(--mo); font-size:11px; letter-spacing:2px; color:var(--tm); margin-bottom:10px; }
  .ipc-mem-list  { list-style:none; display:flex; flex-direction:column; gap:3px; }
  .ipc-mem-item  { display:flex; align-items:center; gap:8px; padding:9px 10px; border-radius:4px; font-family:var(--mo); font-size:14px; color:var(--tx); animation:ipcMemIn .3s ease both; }
  @keyframes ipcMemIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
  .ipc-mem-item:hover { background:rgba(255,255,255,.03); }
  .ipc-mem-dot   { width:7px; height:7px; background:var(--gr); border-radius:50%; box-shadow:0 0 5px var(--gr); flex-shrink:0; }
  .ipc-mem-name  { flex:1; }
  .ipc-you       { font-size:9px; letter-spacing:1px; color:var(--c); background:rgba(0,212,255,.1); border:1px solid rgba(0,212,255,.2); padding:1px 5px; border-radius:3px; }

  .ipc-sb-bottom { padding:12px; border-top:1px solid var(--bo); }
  .ipc-leave-btn { width:100%; background:transparent; border:1px solid var(--bo); border-radius:var(--ra); color:var(--td); font-family:var(--mo); font-size:11px; letter-spacing:1px; padding:9px 12px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all .2s; margin-bottom:8px; }
  .ipc-leave-btn:hover { border-color:var(--re); color:var(--re); background:rgba(255,68,102,.06); }
  .ipc-ver       { font-family:var(--mo); font-size:9px; color:var(--tm); text-align:center; letter-spacing:1px; }

  /* ── MAIN ── */
  .ipc-main { flex:1; display:flex; flex-direction:column; height:100%; overflow:hidden; position:relative; z-index:5; min-width:0; }

  .ipc-header { height:64px; background:var(--bg2); border-bottom:1px solid var(--bo); display:flex; align-items:center; justify-content:space-between; padding:0 20px; flex-shrink:0; gap:10px; }
  .ipc-hroom  { font-family:var(--mo); font-size:16px; display:flex; align-items:center; gap:8px; flex:1; min-width:0; overflow:hidden; }
  .ipc-hpre   { color:var(--tm); letter-spacing:1px; flex-shrink:0; }
  .ipc-hid    { color:var(--c); letter-spacing:1px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ipc-hactions { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .ipc-clear-btn { background:transparent; border:1px solid var(--bo); border-radius:4px; color:var(--td); font-family:var(--mo); font-size:10px; letter-spacing:1.5px; padding:5px 10px; cursor:pointer; display:flex; align-items:center; gap:5px; transition:all .2s; }
  .ipc-clear-btn:hover { border-color:rgba(255,68,102,.4); color:var(--re); background:rgba(255,68,102,.06); }
  .ipc-allclear-btn { border-color:rgba(0,212,255,.25) !important; color:var(--cd) !important; }
  .ipc-allclear-btn:hover { border-color:var(--c) !important; color:var(--c) !important; background:rgba(0,212,255,.06) !important; }
  .ipc-clear-label { display:inline; }
  .ipc-badge  { display:flex; align-items:center; gap:6px; font-family:var(--mo); font-size:14px; color:var(--tx); background:var(--bg3); border:1px solid var(--bo); border-radius:4px; padding:5px 12px; max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ipc-badge-dot { width:6px; height:6px; background:var(--gr); border-radius:50%; box-shadow:0 0 6px var(--gr); flex-shrink:0; }

  /* ── MESSAGES ── */
  .ipc-msgs { flex:1; overflow-y:auto; padding:20px 20px; display:flex; flex-direction:column; gap:2px; scrollbar-width:thin; scrollbar-color:var(--bo) transparent; }
  .ipc-msgs::-webkit-scrollbar { width:4px; }
  .ipc-msgs::-webkit-scrollbar-thumb { background:var(--bo); border-radius:2px; }

  .ipc-sys { align-self:center; font-family:var(--mo); font-size:12px; color:var(--tm); letter-spacing:.5px; padding:5px 14px; background:rgba(255,255,255,.02); border:1px solid var(--bo); border-radius:20px; text-align:center; animation:ipcMsgIn .25s ease both; margin:8px 0; }
  .ipc-sys-join  { color:rgba(0,255,136,.7);  border-color:rgba(0,255,136,.15); }
  .ipc-sys-leave { color:rgba(255,68,102,.7); border-color:rgba(255,68,102,.12); }
  .ipc-sys-clear { color:rgba(0,212,255,.6);  border-color:rgba(0,212,255,.12); }

  .ipc-mwrap {
    display:flex; flex-direction:column;
    max-width:68%;
    animation:ipcMsgIn .25s cubic-bezier(.22,1,.36,1) both;
    margin-bottom:12px;
    cursor:default;
    user-select:text;
    transition:background .15s;
  }
  @keyframes ipcMsgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  .ipc-self  { align-self:flex-end;   align-items:flex-end; }
  .ipc-other { align-self:flex-start; align-items:flex-start; }

  /* Highlight on scroll-to */
  .ipc-msg-highlight { animation:ipcHighlight .8s ease; }
  @keyframes ipcHighlight { 0%,100%{background:transparent} 30%{background:rgba(0,212,255,0.08)} }

  .ipc-mmeta { display:flex; align-items:center; gap:8px; margin-bottom:5px; }
  /* [1] Bigger username font */
  .ipc-muser { font-family:var(--mo); font-size:13px; font-weight:400; color:var(--cd); letter-spacing:.5px; }
  .ipc-mtime { font-family:var(--mo); font-size:12px; color:var(--tm); }

  /* ── REPLY HINT BUTTON ── */
  .ipc-reply-hint {
    background:transparent; border:none; color:var(--tm); font-size:14px;
    cursor:pointer; padding:0 4px; opacity:0; transition:opacity .2s, color .2s;
    line-height:1;
  }
  .ipc-mwrap:hover .ipc-reply-hint { opacity:1; }
  .ipc-reply-hint:hover { color:var(--c); }

  /* ── REPLY PREVIEW (inside bubble) ── */
  .ipc-reply-preview {
    background:rgba(0,212,255,0.05);
    border-left:3px solid var(--cd);
    border-radius:6px 6px 0 0;
    padding:7px 12px 6px;
    margin-bottom:2px;
    max-width:100%;
    cursor:pointer;
    transition:background .2s;
  }
  .ipc-self .ipc-reply-preview {
    border-left-color:#a08aff;
    background:rgba(124,92,252,0.12);
  }
  .ipc-reply-preview:hover { background:rgba(0,212,255,0.1); }
  .ipc-self .ipc-reply-preview:hover { background:rgba(124,92,252,0.2); }
  .ipc-reply-preview-user {
    font-family:var(--sa); font-size:12px; font-weight:700;
    color:var(--cd); letter-spacing:.5px; margin-bottom:2px;
  }
  .ipc-self .ipc-reply-preview-user { color:#b8a0ff; }
  .ipc-reply-preview-text {
    font-family:var(--sa); font-size:13px; color:var(--td);
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:260px;
  }

  /* ── BUBBLES — bigger, Rajdhani forced ── */
  .ipc-bubble {
    padding:13px 20px !important;
    border-radius:20px !important;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif !important;
    font-size:20px !important;
    font-weight:400 !important;
    line-height:1.5 !important;
    letter-spacing:0px !important;
    max-width:100%;
    word-break:break-word;
    min-width:60px;
    width:fit-content;
    display:block;
  }
  /* YOUR messages — solid purple */
  .ipc-self .ipc-bubble {
    background:#7c5cfc !important;
    color:#fff !important;
    border:none !important;
    border-bottom-right-radius:5px !important;
    box-shadow:0 4px 20px rgba(124,92,252,0.45) !important;
  }
  /* OTHER messages — dark card */
  .ipc-other .ipc-bubble {
    background:#1e2a40 !important;
    border:1px solid #2a3a58 !important;
    color:#e8f4ff !important;
    border-bottom-left-radius:5px !important;
  }
  /* Deleted message style */
  .ipc-bubble-deleted {
    font-style:italic !important;
    opacity:0.45 !important;
    font-size:14px !important;
  }
  .ipc-self.ipc-deleted .ipc-bubble {
    background:#3a2a6a !important;
  }

  /* ── IMAGE BUBBLE ── */
  .ipc-img-bubble { position:relative; cursor:pointer; border-radius:12px; overflow:hidden; max-width:260px; border:1px solid var(--bo); margin-bottom:4px; }
  .ipc-self .ipc-img-bubble { border-color:rgba(124,92,252,.4); }
  .ipc-img-thumb  { display:block; width:100%; height:auto; max-height:260px; object-fit:cover; }
  .ipc-img-overlay { position:absolute; inset:0; background:rgba(0,0,0,.4); opacity:0; display:flex; align-items:center; justify-content:center; color:#fff; transition:opacity .2s; }
  .ipc-img-bubble:hover .ipc-img-overlay { opacity:1; }

  /* ── LIGHTBOX ── */
  .ipc-lightbox { position:fixed; inset:0; z-index:999; background:rgba(0,0,0,.92); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; cursor:zoom-out; animation:ipcIn .2s ease both; }
  .ipc-lightbox-img { max-width:94vw; max-height:90vh; border-radius:8px; box-shadow:0 0 60px rgba(0,212,255,.2); object-fit:contain; }
  .ipc-lightbox-close { position:absolute; top:16px; right:20px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2); border-radius:50%; width:36px; height:36px; color:#fff; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .2s; }
  .ipc-lightbox-close:hover { background:rgba(255,68,102,.3); }

  /* ── CONTEXT MENU ── */
  .ipc-ctx-menu {
    position:fixed; z-index:500;
    background:var(--bg2); border:1px solid var(--bo2);
    border-radius:8px; overflow:hidden;
    box-shadow:0 8px 32px rgba(0,0,0,.6);
    animation:ipcIn .15s ease both;
    min-width:180px;
  }
  .ipc-ctx-item {
    display:block; width:100%; text-align:left;
    background:transparent; border:none;
    color:var(--tx); font-family:var(--sa); font-size:14px; font-weight:500;
    padding:11px 16px; cursor:pointer; letter-spacing:.3px;
    transition:background .15s;
  }
  .ipc-ctx-item:hover { background:rgba(255,255,255,.05); }
  .ipc-ctx-danger { color:var(--re) !important; }
  .ipc-ctx-danger:hover { background:rgba(255,68,102,.08) !important; }

  /* ── IMAGE PREVIEW BAR ── */
  .ipc-img-preview-bar { display:flex; align-items:center; gap:10px; padding:8px 16px; background:rgba(124,92,252,.08); border-top:1px solid rgba(124,92,252,.2); flex-shrink:0; }
  .ipc-img-preview-thumb { width:42px; height:42px; object-fit:cover; border-radius:6px; border:1px solid rgba(124,92,252,.3); }
  .ipc-img-preview-label { font-family:var(--mo); font-size:10px; color:var(--cd); letter-spacing:.5px; flex:1; }
  .ipc-img-preview-remove { background:transparent; border:none; color:var(--re); font-size:16px; cursor:pointer; padding:4px 8px; border-radius:4px; transition:background .2s; }
  .ipc-img-preview-remove:hover { background:rgba(255,68,102,.1); }
  .ipc-upload-err { padding:4px 16px; font-family:var(--mo); font-size:10px; color:var(--re); flex-shrink:0; }

  /* ── REPLY BAR ── */
  .ipc-reply-bar {
    display:flex; align-items:center; justify-content:space-between;
    padding:8px 14px; background:rgba(0,212,255,.04);
    border-top:1px solid rgba(0,212,255,.12); flex-shrink:0;
    animation:ipcIn .2s ease both;
  }
  .ipc-reply-bar-inner { display:flex; align-items:stretch; gap:10px; flex:1; min-width:0; }
  .ipc-reply-bar-accent { width:3px; border-radius:2px; background:var(--cd); flex-shrink:0; }
  .ipc-reply-bar-content { display:flex; flex-direction:column; gap:2px; min-width:0; }
  .ipc-reply-bar-user { font-family:var(--sa); font-size:12px; font-weight:700; color:var(--cd); letter-spacing:.5px; }
  .ipc-reply-bar-text { font-family:var(--sa); font-size:13px; color:var(--td); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:320px; }
  .ipc-reply-cancel { background:transparent; border:none; color:var(--tm); font-size:18px; cursor:pointer; padding:4px 8px; border-radius:4px; transition:all .2s; flex-shrink:0; }
  .ipc-reply-cancel:hover { color:var(--re); background:rgba(255,68,102,.08); }

  /* ── TYPING ── */
  .ipc-typing { padding:4px 20px; font-family:var(--mo); font-size:11px; color:var(--tm); display:flex; align-items:center; gap:9px; height:28px; flex-shrink:0; opacity:0; transition:opacity .2s; }
  .ipc-typing-on { opacity:1; }
  .ipc-tdots { display:flex; gap:3px; align-items:center; }
  .ipc-tdots span { width:4px; height:4px; background:var(--cd); border-radius:50%; animation:ipcTyping 1.2s infinite; }
  .ipc-tdots span:nth-child(2) { animation-delay:.2s; }
  .ipc-tdots span:nth-child(3) { animation-delay:.4s; }
  @keyframes ipcTyping { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }

  /* ── INPUT BAR ── */
  .ipc-bar { height:78px; background:var(--bg2); border-top:1px solid var(--bo); display:flex; align-items:center; gap:12px; padding:0 18px; flex-shrink:0; }
  .ipc-attach { width:46px; height:46px; min-width:46px; background:transparent; border:1px solid var(--bo); border-radius:var(--ra); color:var(--td); cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .2s; }
  .ipc-attach:hover { border-color:var(--c); color:var(--c); background:var(--cg); }
  /* [1] bigger input font — forced */
  .ipc-msg-in {
    flex:1; background:var(--bg3); border:1px solid var(--bo); border-radius:24px;
    color:var(--tx) !important;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif !important;
    font-size:16px !important;
    font-weight:400 !important;
    letter-spacing:0px;
    padding:11px 18px; outline:none;
    transition:border-color .2s,box-shadow .2s; min-width:0;
  }
  .ipc-msg-in::placeholder { color:var(--tm); font-size:14px; }
  .ipc-msg-in:focus { border-color:var(--cd); box-shadow:0 0 0 3px var(--cg); }
  .ipc-send { position:relative; width:50px; height:50px; min-width:50px; background:#7c5cfc; border:none; border-radius:50%; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; transition:transform .15s,box-shadow .2s,background .2s; }
  .ipc-send:hover { background:#9b7ffe; transform:scale(1.08); box-shadow:0 0 20px rgba(124,92,252,.5); }
  .ipc-send:active { transform:scale(.96); }
  .ipc-send-glow { position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.2),transparent 60%); pointer-events:none; }

  /* ── CONFIRM MODAL (smaller) ── */
  .ipc-confirm-modal {
    max-width:360px !important;
    padding:32px 28px !important;
  }
  .ipc-confirm-modal .ipc-modal-icon { font-size:30px; margin-bottom:10px; }
  .ipc-confirm-modal .ipc-modal-title { font-size:13px; }
  .ipc-confirm-modal .ipc-modal-body { font-size:15px; margin-bottom:20px; }

  /* ── ALL MODALS — backdrop + card ── */
  .ipc-modal-backdrop {
    position:fixed; inset:0; z-index:900;
    /* Solid enough to see modal clearly on dark bg */
    background:rgba(2,6,18,0.88);
    backdrop-filter:blur(12px);
    -webkit-backdrop-filter:blur(12px);
    display:flex; align-items:center; justify-content:center;
    padding:20px;
    animation:ipcIn .2s ease both;
  }
  .ipc-modal {
    /* Solid dark card — no transparency blending with chat bg */
    background:#0f1829;
    border:1px solid rgba(0,212,255,0.35);
    border-radius:18px;
    padding:36px 32px;
    max-width:400px; width:92vw;
    /* Strong glow so it pops on any bg */
    box-shadow:
      0 0 0 1px rgba(0,212,255,0.15),
      0 0 40px rgba(0,212,255,0.12),
      0 32px 80px rgba(0,0,0,0.9);
    text-align:center;
    animation:ipcIn .3s cubic-bezier(.22,1,.36,1) both;
    position:relative;
  }
  /* Top accent line */
  .ipc-modal::before {
    content:'';
    position:absolute; top:0; left:10%; right:10%; height:2px;
    background:linear-gradient(90deg,transparent,rgba(0,212,255,0.6),transparent);
    border-radius:2px;
  }
  .ipc-modal-icon  { font-size:36px; margin-bottom:12px; }
  .ipc-modal-title {
    font-family:var(--sp); font-size:13px; letter-spacing:4px;
    color:var(--c); text-transform:uppercase; margin-bottom:14px;
    text-shadow:0 0 12px rgba(0,212,255,0.5);
  }
  .ipc-modal-body  {
    font-family:var(--sa); font-size:16px; font-weight:500;
    color:#c8d8f0; line-height:1.65; margin-bottom:22px;
  }
  .ipc-modal-body strong { color:#fff; font-weight:700; }
  .ipc-modal-votes {
    display:flex; gap:16px; justify-content:center; margin-bottom:24px;
    font-family:var(--mo); font-size:12px; flex-wrap:wrap;
    background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06);
    border-radius:8px; padding:10px 16px;
  }
  .ipc-vote-accept { color:#00ff88; font-weight:700; }
  .ipc-vote-reject { color:#ff4466; font-weight:700; }
  .ipc-vote-total  { color:#5a7090; }
  .ipc-modal-btns  { display:flex; gap:12px; justify-content:center; }
  .ipc-modal-btn {
    flex:1; max-width:150px;
    border:none; border-radius:10px; padding:13px 20px;
    font-family:var(--sp); font-size:11px; font-weight:700;
    letter-spacing:2px; cursor:pointer; transition:all .2s;
    min-height:46px;
  }
  .ipc-btn-accept { background:#00ff88; color:#030a06; box-shadow:0 0 20px rgba(0,255,136,0.3); }
  .ipc-btn-accept:hover { background:#33ffaa; box-shadow:0 0 24px rgba(0,255,136,.5); transform:translateY(-1px); }
  .ipc-btn-reject { background:rgba(255,68,102,0.15); color:#ff6680; border:1px solid rgba(255,68,102,0.4); }
  .ipc-btn-reject:hover { background:rgba(255,68,102,0.25); box-shadow:0 0 18px rgba(255,68,102,.3); color:#fff; }
  .ipc-modal-voted { font-family:var(--sa); font-size:16px; color:#a0b4d0; }
  /* ── BRANDING ── */
  .ipc-brand-tag {
    font-family:var(--sp); font-size:9px; letter-spacing:1.5px;
    color:var(--c); text-shadow:0 0 8px rgba(0,212,255,0.5);
    font-weight:700;
  }
  .ipc-brand-footer {
    text-align:center; margin-top:14px;
    font-family:var(--mo); font-size:9.5px; color:var(--tm);
    letter-spacing:0.5px;
  }
  .ipc-brand-name {
    color:var(--c); font-weight:700; letter-spacing:1px;
    text-shadow:0 0 8px rgba(0,212,255,0.4);
  }
  .ipc-modal-voted strong { color:var(--tx); }
  .ipc-voted-yes { color:var(--gr) !important; }
  .ipc-voted-no  { color:var(--re) !important; }
  .ipc-modal-waiting { font-family:var(--mo); font-size:11px; color:var(--tm); letter-spacing:.5px; margin-top:6px; display:block; }

  /* ════════════════════════
     MOBILE RESPONSIVE — full keyboard fix
  ════════════════════════ */

  /* iOS Safari 100vh bug fix — use dvh where supported */
  @supports (height: 100dvh) {
    .ipc-wrap, .ipc-chat-root {
      height: 100dvh !important;
    }
  }

  @media (max-width: 640px) {
    /* ── Layout: use dvh, avoid fixed overflow:hidden conflicts ── */
    html, body {
      height: 100% !important;
      overflow: hidden !important;
      /* Prevent iOS bounce scroll */
      overscroll-behavior: none;
    }

    .ipc-wrap {
      height: 100svh !important;
      height: 100dvh !important;
    }

    /* Chat root — fill screen, flex column, let keyboard push it */
    .ipc-chat-root {
      position: fixed !important;
      top: 0; left: 0; right: 0; bottom: 0;
      height: 100% !important;
      /* env(safe-area-inset-bottom) for iPhone notch */
      padding-bottom: env(safe-area-inset-bottom);
    }

    /* Main area — fill remaining, flex column */
    .ipc-main {
      display: flex !important;
      flex-direction: column !important;
      height: 100% !important;
      overflow: hidden !important;
    }

    /* Messages area — flex:1 so it shrinks when keyboard opens */
    .ipc-msgs {
      flex: 1 1 0% !important;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      padding: 14px 12px !important;
      /* Prevent overscroll */
      overscroll-behavior-y: contain;
    }

    /* Input bar — always at bottom, never hidden behind keyboard */
    .ipc-bar {
      flex-shrink: 0 !important;
      position: relative !important;
      padding: 8px 10px !important;
      padding-bottom: max(8px, env(safe-area-inset-bottom)) !important;
      height: auto !important;
      min-height: 60px;
      gap: 8px;
      /* Ensure tappable */
      z-index: 10;
    }

    /* Input field — bigger tap target, no zoom on iOS (font>=16px prevents zoom) */
    .ipc-msg-in {
      font-size: 16px !important;
      padding: 10px 16px !important;
      min-height: 44px !important;
      /* Prevent iOS from zooming in */
      -webkit-text-size-adjust: 100%;
    }

    /* Send button — bigger tap target */
    .ipc-send {
      width: 44px !important;
      height: 44px !important;
      min-width: 44px !important;
      flex-shrink: 0 !important;
    }

    /* Attach button */
    .ipc-attach {
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      flex-shrink: 0 !important;
    }

    /* Sidebar — slide in from left */
    .ipc-hamburger { display:flex; }
    .ipc-sidebar {
      position:fixed; top:0; left:0; bottom:0;
      transform:translateX(-100%); z-index:20;
      box-shadow:4px 0 30px rgba(0,0,0,.5);
      height: 100% !important;
    }
    .ipc-sidebar-open { transform:translateX(0); }
    .ipc-sidebar-backdrop { display:block; }

    /* Messages */
    .ipc-mwrap { max-width:88%; }
    .ipc-img-bubble { max-width:210px; }
    .ipc-bubble { font-size:12px !important; padding:7px 12px !important; }

    /* Header */
    .ipc-clear-label { display:none; }
    .ipc-badge { max-width:80px; font-size:10px; padding:3px 8px; }
    .ipc-hid  { max-width:90px; }
    .ipc-hactions { gap:5px; }

    /* Reply bar */
    .ipc-reply-bar-text { max-width:180px; }
  }

  /* Extra small phones */
  @media (max-width: 380px) {
    .ipc-msg-in { font-size:16px !important; padding:12px 18px !important; }
    .ipc-bubble { font-size:15px !important; }
  }
`;export{l as default};