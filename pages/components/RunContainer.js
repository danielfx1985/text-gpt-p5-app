import SandBox from "./SandBox";
import React, { useState, useRef, useEffect } from 'react';

export default function RunContainer({ sandboxRunning, clickPlay, clickStop, result, logMsg, waiting, onScreenshotReady }) {
    const iframeRef = useRef(null);
    const [screenshotDataURL, setScreenshotDataURL] = useState(null);
    const [logMessages, setLogMsg] = useState(logMsg); // 用于存储日志消息

    const handleLoad = () => {
        console.log("iframe loaded");
    };

    const handler = (event) => {
       // console.log("handler:", event.data);
        
        // 确保只处理来自特定源的消息
      //  if (event.origin !== "http://localhost:3000") { console.log("Ignored message from:", event.origin);return;}

        try {
            const data = JSON.parse(event.data);
          //  console.log("Parsed data:", data); // 查看解析后的数据
    
            if (data.type === 'screenshot') {
                setScreenshotDataURL(data.dataURL);
                //console.log("ScreenshotDataURL from RunContainer:", data.dataURL);
                // 调用回调函数，当截图准备好时
                onScreenshotReady && onScreenshotReady(data.dataURL);
            } else if (data.logMsg) {
                // 处理日志消息
                setLogMsg((msg) => (msg ? msg + '\n' + data.logMsg : data.logMsg));
            }
        } catch (error) {
            console.error("Error parsing message data:", error);
        }
    };

    useEffect(() => {
        // 添加事件监听器
        window.addEventListener('message', handler);

        return () => {
            // 清理事件监听器
            window.removeEventListener('message', handler);
        };
    }, []);
 
    return (
        <div className="rounded-md border border-gray-100 shadow-md shadow-emerald-600/30 bg-white p-3 flex flex-col gap-2  min-w-[530px]">
            <div className="flex justify-between">
                <h3 className="font-semibold text-gray-500 mb-2">运行结果：</h3>
                <div className="flex gap-2">
                {
                    waiting ?
                    <>  
                        <button className="rounded-full text-white p-2 text-sm disabled:bg-gray-300"
                        onClick={clickPlay} disabled={waiting}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-white stroke-[2]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                        </button>
                        <button className="rounded-full text-white p-2 text-sm disabled:bg-gray-300"
                        onClick={clickStop} disabled={waiting}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-white stroke-[2]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                            </svg>
                        </button>
                    </>
                    :
                    sandboxRunning ?
                    <>
                        <button className="rounded-full bg-emerald-500 text-white p-2 text-sm disabled:bg-gray-300"
                        onClick={clickPlay} disabled={waiting}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-white stroke-[2]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                        </button>
                        <button className="group rounded-full bg-gray-100 text-white p-2 text-sm ring-1 ring-emerald-500 hover:bg-emerald-200 hover:ring-emerald-700 transition-colors disabled:bg-gray-300"
                        onClick={clickStop} disabled={waiting}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-emerald-500 stroke-[2] group-hover:stroke-emerald-700 transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                            </svg>
                        </button>
                    </>
                    :
                    <>
                        <button className="group rounded-full bg-gray-100 text-white p-2 text-sm ring-1 ring-emerald-500 hover:bg-emerald-200 hover:ring-emerald-700 transition-colors disabled:bg-gray-300"
                        onClick={clickPlay} disabled={waiting}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-emerald-500 stroke-[2] group-hover:stroke-emerald-700 transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                        </button>
                        <button className="rounded-full bg-emerald-500 text-white p-2 text-sm disabled:bg-gray-300"
                        onClick={clickStop} disabled={waiting}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-white stroke-[2]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                            </svg>
                        </button>
                    </>
                }

                </div>
            </div>

            <SandBox running={sandboxRunning} result={result} ref={iframeRef} />

            <textarea className="block w-full bg-gray-100 rounded font-mono p-2 text-sm min-h-[70px] text-gray-500"
                value={logMessages} readOnly />
        </div>
    );
}
