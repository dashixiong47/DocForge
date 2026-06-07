// Shared utilities used across all admin template files

export const MONACO      = 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.47.0/min/vs';
export const MONACO_BASE = 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.47.0/min/';
export const ACE_CDN     = 'https://cdn.bootcdn.net/ajax/libs/ace/1.32.6';

export function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function blockPreview(type: string, contentJson: string): string {
  try {
    const c = JSON.parse(contentJson || '{}') as Record<string, unknown>;
    switch (type) {
      case 'html':  return String(c.html || '').replace(/<[^>]+>/g, '').substring(0, 120);
      case 'code':  return `[${c.language || '?'}] ${String(c.code || '').substring(0, 80)}`;
      case 'image': return `📷 ${c.src || ''}`;
      default:      return JSON.stringify(c).substring(0, 100);
    }
  } catch { return contentJson.substring(0, 120); }
}

export function monacoEditorHTML(id: string, readOnly: boolean, content: string, language: string): string {
  const ro = readOnly ? 'true' : 'false';
  return `<div id="${id}" style="height:100%;border:1px solid var(--border);border-radius:var(--radius)"></div>
<script>
require.config({paths:{vs:'${MONACO}'}});
require(['vs/editor/editor.main'],function(){
  monaco.editor.defineTheme('docforge-dark',{base:'vs-dark',inherit:true,rules:[],colors:{'editor.background':'#0d1117','editor.foreground':'#e6edf3','editor.lineHighlightBackground':'#161b22','editor.selectionBackground':'#264f78','editor.inactiveSelectionBackground':'#1c3b5a'}});
  var ed=monaco.editor.create(document.getElementById('${id}'),{value:${JSON.stringify(content)},language:'${language}',theme:'docforge-dark',readOnly:${ro},fontSize:13,fontFamily:'"Cascadia Code","Consolas","Courier New",monospace',tabSize:2,minimap:{enabled:false},scrollBeyondLastLine:false,wordWrap:'on',automaticLayout:true});
  window['_m_${id}']=ed;
});
<\/script>`;
}

export function blocksToEditorText(blocks: any[]): string {
  if (blocks.length === 0) return '';
  return blocks.map((b: any) => {
    try {
      const c = JSON.parse(b.contentJson || '{}') as Record<string, any>;
      switch (b.type) {
        case 'html':    return `===html===\n${c.html || ''}`;
        case 'code':    return `===code:${c.language || 'cpp'}===\n${c.code || ''}`;
        case 'text':    return `===text===\nzh: ${c.textZh || ''}\nen: ${c.textEn || ''}`;
        case 'callout': return `===callout===\nzh: ${c.textZh || ''}\nen: ${c.textEn || ''}`;
        case 'list': {
          const tag = c.ordered ? 'list:ordered' : 'list';
          const lines = ((c.items || []) as Array<{ zh?: string; en?: string } | string>)
            .map(item => typeof item === 'string' ? `- zh: ${item} | en: ` : `- zh: ${item.zh || ''} | en: ${item.en || ''}`)
            .join('\n');
          return `===${tag}===\n${lines}`;
        }
        case 'card':      return `===card===\ntitle-zh: ${c.titleZh || ''}\ntitle-en: ${c.titleEn || ''}\nzh: ${c.textZh || ''}\nen: ${c.textEn || ''}`;
        case 'code-tags': return `===code-tags===\n${((c.tags || []) as string[]).join('\n')}`;
        case 'image':     return c.key ? `===image===\nkey: ${c.key}\nalt: ${c.alt || ''}` : `===image===\nsrc: ${c.src || ''}\nalt: ${c.alt || ''}`;
        case 'video':     return c.key ? `===video===\nkey: ${c.key}\nsrc: ${c.src || ''}` : `===video===\nsrc: ${c.src || ''}`;
        case 'cards':     return `===cards===\n${JSON.stringify(c.cards || [], null, 2)}`;
        default:          return `===${b.type}===\n${b.contentJson || ''}`;
      }
    } catch {
      return `===${b.type}===\n${b.contentJson || ''}`;
    }
  }).join('\n\n');
}
