// Injecté dans la page : dump des styles calculés de chaque élément visible (hors carte Google et CookieYes).
// Retourne une liste { path, tag, cls, text, rect, styles }.
(() => {
  const PROPS = ['display','position','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor',
    'paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft',
    'borderTopWidth','borderTopColor','borderTopStyle','borderBottomWidth','borderBottomColor','borderRadius','boxShadow','gap','width','height',
    'maxWidth','textAlign','textDecorationLine','textTransform','opacity','transitionProperty','transitionDuration','zIndex','top','left','right','bottom','gridTemplateColumns','flexDirection','justifyContent','alignItems','overflow','whiteSpace'];
  const DEF = { position:'static', letterSpacing:'normal', opacity:'1', textTransform:'none', zIndex:'auto', top:'auto', left:'auto', right:'auto', bottom:'auto', gridTemplateColumns:'none', boxShadow:'none', gap:'normal', transitionDuration:'0s', transitionProperty:'all', textDecorationLine:'none', maxWidth:'none', overflow:'visible', whiteSpace:'normal' };
  const out = [];
  const path = (el) => { const p=[]; while (el && el !== document.body) { const i=[...el.parentElement.children].indexOf(el); p.unshift(el.tagName.toLowerCase()+':'+i); el=el.parentElement; } return p.join('>'); };
  const all = document.querySelectorAll('body *');
  for (const el of all) {
    if (el.closest('.gm-style, .leaflet-container, .cky-consent-container, .cky-modal, .cky-btn-revisit-wrapper, .pac-container, svg, script, style, noscript, next-route-announcer')) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const c = getComputedStyle(el);
    if (c.visibility === 'hidden' || c.display === 'none') continue;
    const styles = {};
    for (const p of PROPS) { const v=c[p]; if (v !== undefined && v !== '' && DEF[p] !== v && !(p.startsWith('margin')&&v==='0px') && !(p.startsWith('padding')&&v==='0px') && !(p.startsWith('border')&&(v==='0px'||v==='none'))) styles[p]=v; }
    const own = [...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
    out.push({ path: path(el), tag: el.tagName.toLowerCase(), cls: (el.getAttribute('class')||'').slice(0,300), text: own.slice(0,80),
      rect: { x: Math.round(r.x*10)/10, y: Math.round((r.y+scrollY)*10)/10, w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10 }, styles });
  }
  return { url: location.href, viewport: { w: innerWidth, h: innerHeight }, scrollHeight: document.documentElement.scrollHeight, elements: out };
})()
