import React, { forwardRef } from 'react';

const SandBox = forwardRef(({ running, result }, ref) => {
  const srcdoc = (src) => `
    <!doctype html>
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/p5@1.6.0/lib/p5.js"></script>
      </head>
      <body style="background-color:#d1d5db; padding:0; margin:0; min-height: 500px;">
        <main style="display: flex; justify-content: center; align-items: center; min-height: 500px;"></main>
      </body>
      <script>
        delete window.fetch;
        delete window.XMLHttpRequest;

        console.log = function(logMsg) {
          window.parent.postMessage(JSON.stringify({ logMsg: logMsg.toString() }), '*'); 
        };

        ${src}

        if (typeof draw === 'function') {
          const originalDraw = draw;
          let frameCount = 0;
          let screenshotTaken = false;

          window.draw = function() {
            originalDraw();

            if (frameCount === 3 && !screenshotTaken) {
              const canvas = document.getElementById('defaultCanvas0');
              const dataURL = canvas.toDataURL('image/png');
              
              window.parent.postMessage(JSON.stringify({ type: 'screenshot', dataURL: dataURL }), '*');
              screenshotTaken = true;
            }

            frameCount++;
          };
        }
      </script>
    </html>
  `;

  if (!running) {
    return (
      <div className="w-full min-h-[590px] bg-gray-100 rounded text-sm text-gray-400 flex justify-center items-center">
        没有代码在运行
      </div>
    );
  }

  return (
    <div className="w-full min-h-[500px] border border-gray-300 rounded">
      <iframe
        ref={ref} // 将 ref 传递给 iframe
        width="100%"
        height="500"
        srcDoc={srcdoc(result)}
        sandbox="allow-scripts"
      />
    </div>
  );
});

export default SandBox;
