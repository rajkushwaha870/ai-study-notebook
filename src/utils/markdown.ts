import { marked } from 'marked';

function highlightSyntax(code: string, language?: string): string {
  if (!language) return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lang = language.toLowerCase();
  
  // Escape HTML characters first
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  if (lang === 'js' || lang === 'javascript' || lang === 'ts' || lang === 'typescript' || lang === 'react') {
    return escaped
      .replace(/\b(const|let|var|function|return|import|export|from|default|class|extends|new|this|async|await|try|catch|finally|if|else|for|while|switch|case|break)\b/g, '<span class="text-[#7928ca] font-semibold">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-[#0070f3] font-semibold">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-[#29bc9b] font-medium">$1</span>')
      .replace(/(\/\/.*)/g, '<span class="text-mute italic">$1</span>');
  }
  
  if (lang === 'python' || lang === 'py') {
    return escaped
      .replace(/\b(def|return|import|from|class|try|except|finally|if|elif|else|for|while|in|and|or|not|is|None|True|False|as|lambda|pass)\b/g, '<span class="text-[#7928ca] font-semibold">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-[#29bc9b] font-medium">$1</span>')
      .replace(/(#.*)/g, '<span class="text-mute italic">$1</span>');
  }

  if (lang === 'html' || lang === 'xml') {
    return escaped
      .replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, '<span class="text-[#0070f3] font-semibold">$1</span>')
      .replace(/(&gt;)/g, '<span class="text-[#0070f3] font-semibold">$1</span>')
      .replace(/([a-zA-Z:-]+)=/g, '<span class="text-[#7928ca]">$1</span>=')
      .replace(/(".*?"|'.*?')/g, '<span class="text-[#29bc9b]">$1</span>');
  }

  if (lang === 'css') {
    return escaped
      .replace(/([a-zA-Z-]+)\s*:/g, '<span class="text-[#0070f3]">$1</span>:')
      .replace(/(#\w+|rgb\([^)]+\)|hsl\([^)]+\)|\b\d+px|\b\d+rem|\b\d+%\b)/g, '<span class="text-[#7928ca]">$1</span>')
      .replace(/(\/\*.*\*\/)/g, '<span class="text-mute italic">$1</span>');
  }
  
  return escaped;
}

// Custom code renderer extension for marked
marked.use({
  renderer: {
    code(codeText: any, infostring?: any, escaped?: any) {
      let code = '';
      let lang = '';
      if (typeof codeText === 'object' && codeText !== null) {
        code = codeText.text || '';
        lang = codeText.lang || '';
      } else {
        code = codeText || '';
        lang = infostring || '';
      }
      const highlighted = highlightSyntax(code, lang);
      return `<pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
    }
  }
});

export function renderMarkdown(md: string): string {
  try {
    const html = marked.parse(md, { async: false });
    return html as string;
  } catch (error) {
    console.error('Markdown parsing failed:', error);
    return md;
  }
}
