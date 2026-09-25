// Transforme la description (sous-ensemble HTML : <b>, <strong>, <i>, <em>, <br>, lignes « - ») en une suite de
// nœuds rendus par React, en reproduisant le découpage de l'original (segments séparés par <br>, lignes « - »
// regroupées en <ul>). AUCUN HTML brut n'est injecté dans le DOM : toute autre balise est ignorée.

export type Inline = { text: string; bold?: boolean; italic?: boolean };
export type DescNode = { kind: 'br' } | { kind: 'text'; parts: Inline[] } | { kind: 'ul'; items: Inline[][] };

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&euro;': '€' };
const decode = (s: string) => s.replace(/&(amp|lt|gt|quot|#39|nbsp|euro);/g, (m) => ENTITIES[m] ?? m);

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let bold = 0;
  let italic = 0;
  for (const tok of src.split(/(<[^>]*>)/)) {
    if (!tok) continue;
    const m = tok.match(/^<(\/?)(b|strong|i|em)\s*>$/i);
    if (m) {
      const d = m[1] ? -1 : 1;
      if (/^(b|strong)$/i.test(m[2])) bold = Math.max(0, bold + d);
      else italic = Math.max(0, italic + d);
      continue;
    }
    if (tok.startsWith('<')) continue;
    out.push({ text: decode(tok), ...(bold ? { bold: true } : {}), ...(italic ? { italic: true } : {}) });
  }
  return out;
}

export function parseDescription(html: string): DescNode[] {
  const nodes: DescNode[] = [];
  let list: Inline[][] | null = null;
  for (const seg of html.split(/(<br\s*\/?>)/i)) {
    if (/^<br\s*\/?>$/i.test(seg)) {
      if (!list) nodes.push({ kind: 'br' });
      continue;
    }
    const t = seg.trim();
    if (t.startsWith('- ')) {
      if (!list) { list = []; nodes.push({ kind: 'ul', items: list }); }
      list.push(parseInline(t.slice(2).trim()));
    } else {
      list = null;
      if (seg) nodes.push({ kind: 'text', parts: parseInline(seg) });
    }
  }
  return nodes;
}
