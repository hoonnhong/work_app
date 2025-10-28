/**
 * @file MarkdownRenderer.tsx
 * @description 이 파일은 마크다운(Markdown) 형식의 텍스트를 예쁜 HTML로 변환하여 보여주는 컴포넌트입니다.
 * Gemini API가 반환하는 텍스트는 종종 마크다운으로 작성되어 있는데, 이 컴포넌트 덕분에
 * 사용자는 표, 목록, 코드 블록 등이 깔끔하게 스타일링된 결과를 볼 수 있습니다.
 * 또한, 텍스트에 포함된 수학 공식을 KaTeX 라이브러리를 사용해 렌더링하는 기능도 담당합니다.
 * XSS(Cross-Site Scripting) 공격을 방지하기 위해 HTML을 소독(sanitize)하는 중요한 보안 역할도 수행합니다.
 */

// React와 필요한 기능들, 그리고 외부 라이브러리들을 가져옵니다.
import React, { useEffect, useState, useRef } from 'react';
import { marked } from 'marked'; // 마크다운을 HTML로 변환해주는 라이브러리
import DOMPurify from 'dompurify'; // HTML에서 잠재적으로 위험한 코드를 제거(소독)해주는 보안 라이브러리

// TypeScript가 window 객체에 katex와 renderMathInElement가 있을 수 있다는 것을 알도록 전역 타입을 확장합니다.
// 이렇게 하지 않으면 TypeScript가 "그런 속성은 없어!"라며 에러를 발생시킬 수 있습니다.
declare global {
    interface Window {
        katex?: any; // KaTeX 핵심 객체
        renderMathInElement?: (element: HTMLElement, options?: any) => void; // 수학 공식을 렌더링하는 함수
    }
}

// MarkdownRenderer 컴포넌트가 받을 props의 타입을 정의합니다.
interface MarkdownRendererProps {
  content: string; // 마크다운 형식의 텍스트 내용
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({ content }) => {
  // 소독된 HTML 내용을 저장할 상태(state)를 만듭니다.
  const [sanitizedContent, setSanitizedContent] = useState('');
  // 렌더링된 HTML이 담길 div 요소에 접근하기 위해 useRef를 사용합니다.
  const contentRef = useRef<HTMLDivElement>(null);

  // `useEffect`는 특정 값(여기서는 `content`)이 바뀔 때마다 특정 작업을 수행하게 합니다.
  // 이 `useEffect`는 `content` props가 바뀔 때마다 마크다운을 파싱하고 소독합니다.
  useEffect(() => {
    // 비동기 함수를 useEffect 내부에 정의하고 즉시 실행합니다.
    const processContent = async () => {
      // LaTeX 수식을 마크다운 파싱으로부터 보호하는 함수
      // marked가 $...$를 잘못 처리하는 것을 방지하기 위해 임시 플레이스홀더로 변환합니다.
      // 플레이스홀더는 §§...§§ 형식을 사용하여 마크다운이 건드리지 않도록 합니다.
      const protectMath = (text: string): { protectedText: string; mathExpressions: string[] } => {
        const mathExpressions: string[] = [];
        let protectedText = text;

        // Display math 보호 ($$...$$) - 먼저 처리해야 $$가 두 개의 $로 인식되는 것을 방지
        protectedText = protectedText.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
          mathExpressions.push(match);
          return `§§MATHBLOCK${mathExpressions.length - 1}§§`;
        });

        // Inline math 보호 ($...$)
        protectedText = protectedText.replace(/\$([^\$\n]+?)\$/g, (match) => {
          mathExpressions.push(match);
          return `§§MATHINLINE${mathExpressions.length - 1}§§`;
        });

        // LaTeX 괄호 스타일도 보호 \[...\] 및 \(...\)
        protectedText = protectedText.replace(/\\\[([\s\S]+?)\\\]/g, (match) => {
          mathExpressions.push(match);
          return `§§MATHBRACKETBLOCK${mathExpressions.length - 1}§§`;
        });

        protectedText = protectedText.replace(/\\\(([^\)]+?)\\\)/g, (match) => {
          mathExpressions.push(match);
          return `§§MATHBRACKETINLINE${mathExpressions.length - 1}§§`;
        });

        return { protectedText, mathExpressions };
      };

      // 보호된 수식을 복원하는 함수
      const restoreMath = (html: string, mathExpressions: string[]): string => {
        let restored = html;
        mathExpressions.forEach((expr, i) => {
          // 모든 플레이스홀더 패턴을 원래 수식으로 복원
          // 정규식을 사용하여 전역 치환 (g 플래그)
          restored = restored.replace(new RegExp(`§§MATHBLOCK${i}§§`, 'g'), expr);
          restored = restored.replace(new RegExp(`§§MATHINLINE${i}§§`, 'g'), expr);
          restored = restored.replace(new RegExp(`§§MATHBRACKETBLOCK${i}§§`, 'g'), expr);
          restored = restored.replace(new RegExp(`§§MATHBRACKETINLINE${i}§§`, 'g'), expr);
        });
        return restored;
      };

      // 1. 수식 보호: 마크다운 파싱 전에 LaTeX 수식을 플레이스홀더로 변환
      const { protectedText: protectedContent, mathExpressions } = protectMath(content);

      // marked 라이브러리는 기본 설정 그대로 사용합니다.
      // 테이블 스타일은 파싱 후 HTML 문자열을 직접 수정합니다.

      // 2. `marked.parse`: 보호된 마크다운 텍스트를 HTML로 변환합니다.
      const parsedHtml = marked.parse(protectedContent);

      // parsedHtml이 Promise인 경우 처리
      let htmlString: string;
      if (parsedHtml instanceof Promise) {
        htmlString = await parsedHtml;
      } else if (typeof parsedHtml === 'string') {
        htmlString = parsedHtml;
      } else {
        console.error('❌ parsedHtml이 예상치 못한 타입:', parsedHtml);
        htmlString = String(parsedHtml);
      }

      // 3. 수식 복원: 플레이스홀더를 원래 LaTeX 수식으로 되돌립니다.
      let restoredHtml = restoreMath(htmlString, mathExpressions);

      // 4. 테이블 스타일링: HTML 문자열에서 테이블 태그를 찾아 Tailwind CSS 클래스를 추가합니다.
      restoredHtml = restoredHtml
        .replace(/<table>/g, '<div class="overflow-x-auto"><table class="w-full text-sm text-left text-slate-500 dark:text-slate-400 my-4 border-collapse">')
        .replace(/<\/table>/g, '</table></div>')
        .replace(/<thead>/g, '<thead class="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">')
        .replace(/<tr>/g, '<tr class="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">')
        .replace(/<th>/g, '<th scope="col" class="px-6 py-3 border border-slate-200 dark:border-slate-600">')
        .replace(/<td>/g, '<td class="px-6 py-4 border border-slate-200 dark:border-slate-600">');

      // 5. `DOMPurify.sanitize`: 변환된 HTML에서 악성 스크립트 등을 제거하여 안전하게 만듭니다.
      // KaTeX 수학 공식이 제대로 작동하도록 필요한 속성과 태그를 허용합니다.
      const cleanHtml = DOMPurify.sanitize(restoredHtml, {
        ADD_TAGS: ['span', 'annotation', 'semantics', 'mtext', 'mn', 'mo', 'mi', 'mspace', 'mrow', 'msqrt', 'mtable', 'mtr', 'mtd', 'math'],
        ADD_ATTR: ['class', 'style', 'aria-hidden', 'xmlns']
      });

      // 6. `setSanitizedContent`: 안전해진 HTML을 상태에 저장합니다. 이 상태 변경으로 인해 컴포넌트가 리렌더링됩니다.
      setSanitizedContent(cleanHtml);
    };

    // 비동기 함수 실행
    processContent();
  }, [content]); // `content` props가 변경될 때만 이 effect를 다시 실행합니다.

  // 이 `useEffect`는 `sanitizedContent`가 바뀐 후에 수학 공식 렌더링과 코드 블록 복사 버튼 추가를 담당합니다.
  // HTML이 DOM에 실제로 렌더링된 후에 실행되어야 하므로 별도의 effect로 분리합니다.
  useEffect(() => {
    // 렌더링할 콘텐츠나 DOM 요소가 없으면 작업을 중단합니다.
    if (!sanitizedContent || !contentRef.current) return;

    const contentElement = contentRef.current;
    let intervalId: number | undefined;
    let timeoutId: number | undefined;

    const renderMath = () => {
      let rendered = false;
      try {
          // KaTeX 라이브러리의 `renderMathInElement` 함수가 로드되었는지 확인합니다.
          if (window.renderMathInElement) {
              // DOM 요소 안의 수학 공식(예: $E=mc^2$)을 찾아 렌더링합니다.
              window.renderMathInElement(contentElement, {
                  delimiters: [
                      {left: '$$', right: '$$', display: true},
                      {left: '$', right: '$', display: false},
                      {left: '\\(', right: '\\)', display: false},
                      {left: '\\[', right: '\\]', display: true}
                  ],
                  throwOnError: false, // 렌더링 오류가 발생해도 중단되지 않도록 설정합니다.
                  strict: false // 엄격 모드를 비활성화하여 다양한 수식 형식 허용
              });
              rendered = true;
          }
      } catch (error) {
          console.error('❌ KaTeX 렌더링 오류:', error);
      }
      return rendered;
    };

    // 코드 블록에 '복사' 버튼을 추가하는 함수입니다.
    const addCopyButtons = () => {
        if (!contentRef.current) return;
        // 모든 `<pre>` 태그를 찾습니다.
        const preElements = contentRef.current.querySelectorAll('pre');
        preElements.forEach(pre => {
            // 이미 복사 버튼이 있다면 중복 추가를 방지합니다.
            if (pre.querySelector('.copy-button')) return;

            // pre 태그를 감싸는 div를 만들어 position: relative를 적용합니다.
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            pre.parentNode?.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            // 복사 버튼을 생성하고 스타일을 적용합니다.
            const button = document.createElement('button');
            button.innerText = '복사';
            button.className = 'copy-button absolute top-2 right-2 px-2 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors';
            
            // 버튼 클릭 시 `<pre>` 태그 내부의 `<code>` 태그 텍스트를 복사합니다.
            button.onclick = () => {
                const code = pre.querySelector('code')?.innerText || '';
                navigator.clipboard.writeText(code).then(() => {
                    button.innerText = '복사됨!';
                    setTimeout(() => { button.innerText = '복사'; }, 2000);
                });
            };
            // pre 태그 내부에 버튼을 추가합니다.
            pre.appendChild(button);
        });
    };

    // KaTeX 라이브러리가 로드되었는지 100ms 간격으로 확인하는 함수 (폴링)
    const checkForKatex = () => {
        if (window.katex && window.renderMathInElement) {
            if (intervalId) clearInterval(intervalId);
            if (timeoutId) clearTimeout(timeoutId);

            // DOM 업데이트를 위해 약간의 지연 후, 수학 렌더링과 복사 버튼 추가를 순차적으로 실행합니다.
            setTimeout(() => {
                if (renderMath()) {
                    addCopyButtons();
                }
            }, 50);
        }
    };

    // KaTeX 라이브러리 로드를 기다리기 위해 폴링을 시작합니다.
    intervalId = window.setInterval(checkForKatex, 200);

    // 10초 후에도 로드되지 않으면 폴링을 중단하는 타임아웃을 설정합니다.
    timeoutId = window.setTimeout(() => {
        if(intervalId) clearInterval(intervalId);
        if (!window.katex || !window.renderMathInElement) {
             console.error('❌ KaTeX 라이브러리 로딩 실패. 페이지를 새로고침해주세요.');
        }
    }, 10000);

    // 컴포넌트가 언마운트되거나 `sanitizedContent`가 변경될 때 타이머를 정리(clean-up)합니다.
    // 이는 메모리 누수를 방지하는 중요한 과정입니다.
    return () => {
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sanitizedContent]); // `sanitizedContent`가 변경될 때만 이 effect를 다시 실행합니다.

  // 최종적으로 렌더링될 JSX입니다.
  return (
    <div
      ref={contentRef} // 이 div를 contentRef와 연결하여 DOM에 직접 접근할 수 있게 합니다.
      // `prose`는 Tailwind CSS의 타이포그래피 플러그인으로, 가독성 좋은 기본 스타일을 적용해줍니다.
      className="prose dark:prose-invert max-w-none prose-slate prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-a:text-primary-600 hover:prose-a:text-primary-500 prose-code:bg-slate-200 prose-code:dark:bg-slate-700 prose-code:p-1 prose-code:rounded prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:pl-4 prose-blockquote:italic"
      // `dangerouslySetInnerHTML`은 문자열 형태의 HTML을 실제 DOM 요소로 렌더링할 때 사용합니다.
      // 이름에 'dangerously'가 붙은 이유는, 소독되지 않은 HTML을 사용하면 XSS 공격에 취약해지기 때문입니다.
      // 우리는 위에서 DOMPurify로 소독했기 때문에 안전하게 사용할 수 있습니다.
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
});

// 디버깅을 위한 displayName 설정
MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
