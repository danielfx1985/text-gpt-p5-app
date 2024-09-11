import Head from "next/head";
import Link from 'next/link'; // 引入 Link 组件
import { useState, useCallback, useEffect, useRef } from "react";
import TextInput from "./components/TextInput";
import Editor from "./components/Editor";
import RunContainer from "./components/RunContainer";
import CodeImporterExporter from "./components/CodeImporterExporter"; // 导入新组件
import html2canvas from 'html2canvas';

// Initializing the cors middleware
const whitelist = process.env.NEXT_PUBLIC_WHITELISTED_DOMAINS ? process.env.NEXT_PUBLIC_WHITELISTED_DOMAINS.split(',') : '*';
const MODEL = process.env.NEXT_PUBLIC_MODEL;


const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const api_url = process.env.NEXT_PUBLIC_API_URL;
const temperature = process.env.NEXT_PUBLIC_TEMPERATURE;
const max_tokens = process.env.NEXT_PUBLIC_MAX_TOKENS;
//console.log("api_url ", api_url);
export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false); // 定义状态
  const [result, setResult] = useState("// 请在上面指令区输入你的指令，然后点“提交”");
  const [textInput, setTextInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [logMsg, setlogMsg] = useState("");
  const [selVal, setSelVal] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]); // New state for conversation history
  const [author, setAuthor] = useState(""); // 新增作者输入框状态
  const [showError, setShowError] = useState(false);
  const [screenshotDataURL, setScreenshotDataURL] = useState(null); // 添加 dataURL 状态


  const egArray = [];
  const MAX_HISTORY_LENGTH = 8; // 设置最大历史会话数目

  const [exportedFilename, setExportedFilename] = useState('作品名字'); // 添加状态来存储文件名

  // 处理文件名变化
  const handleFilenameChange = (newFilename) => {
    setExportedFilename(newFilename);
  };
  useEffect(() => {
    let ranOnce = false;

    const handler = event => {
      if (event.data) {
        try {
          const data = JSON.parse(event.data);
          if (!ranOnce) {
            setlogMsg(data.logMsg);
            ranOnce = true;
          } else {
            setlogMsg(msg => msg + '\n' + data.logMsg);
          }
           
        } catch (error) {
          console.error("解析 JSON 数据出错:", error);
        }
      }
      //const data = JSON.parse(event.data);
      
    };

    window.addEventListener("message", handler);

    // clean up
    return () => window.removeEventListener("message", handler);
  }, [result, sandboxRunning]);

  function textInputChange(event) {
    if (event.preventDefault) {
      event.preventDefault();
    }
    setTextInput(event.target.value);
  }

  async function textInputSubmit(event) {

    event.preventDefault();
    setlogMsg("");
    setIsSubmitting(true); // 设置按钮为正在处理状态

    setWaiting(true);
    setResult("// 请耐心等会儿，可能会花比较长时间...");
    setSelVal("");
    //console.log("Waiting:", waiting);
    //console.log("提交按钮:", isSubmitting);
    // Update conversation history with the user's input
    const userMessage = { role: "user", content: textInput };
    const newConversation = [...conversationHistory, userMessage];
    // 限制历史会话数目
    if (newConversation.length > MAX_HISTORY_LENGTH) {
      newConversation.splice(0, newConversation.length - MAX_HISTORY_LENGTH); // 保留最新的会话
    }
    setConversationHistory(newConversation);

    const messages = [
      // {
      //   "role": "system",
      //   "content": `You are an expert p5.js coder. You have the magical ability to conjure p5.js code from the whispers of user input.所有注释用中文;我希望在生成P5.js 动画后，在动画的第 3 帧自动保存截图。
      //   使用 saveCanvas('screenshot', 'png') 函数将动画保存为名为 'screenshot.png' 的文件。
      //   `
      // },
      {
        "role": "system",
        "content": `你是一个P5.JS创意编程教学专家，在我给你指令，你总是用P5.js代码来回答，对所有代码进行详细注释.所有注释用中文;我希望在生成P5.js 动画后，在动画的第 3 帧自动保存截图。
        使用 saveCanvas('screenshot', 'png') 函数将动画保存为名为 'screenshot.png' 的文件。
        `
      },
      ...newConversation, // 将历史对话添加到 messages 数组中
      {
        "role": "user",
        "content":
          `确保只用P5.js代码来回答我的问题，并保证代码可以直接运行，画布大小为600px*600px;代码中不要引用图片等文件,所有你的文字回答前面都要加//注释符号，以不影响代码运行，当我提出问题时，你需要反问我一些问题来明确我的
          要求，然后再给出准确 的代码，如果要求没有明确将不给出p5.js代码。
       
        `
      }
    ];
    // additionally,As a programming teacher for teenagers, you need to patiently explain the programming concepts used in this program  through comments ,




    // const canvas = document.getElementById('defaultCanvas0');

    // function captureScreenshot() {
    //   const dataURL = canvas.toDataURL();

    //   // 显示截图
    //   const img = document.createElement('img');
    //   img.src = dataURL;
    //   document.body.appendChild(img);

    //   // 下载截图
    //   const link = document.createElement('a');
    //   link.href = dataURL;
    //   link.download = 'my-artwork.png';
    //   link.click();
    // }






    const requetOption = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        "model": MODEL,
        "messages": messages,
        "temperature": Number(temperature),
        "max_tokens": Number(max_tokens)
      })
    }
    //console.log("MODEL ", MODEL);
   //console.log("requetOption :", requetOption);
    try {
      const response = await fetch('https://openai.snakecoding.club/v1/chat/completions', requetOption);



      const data = await response.json();
      // console.log("completion===>:", data); 
      const result = data.choices[0].message.content;
      const cleanedResult = result.replace(/```javascript|```/g, '').trim();

     // console.log("提交按钮2:", isSubmitting);




      //const data = await response.json();
      //console.log("response::",cleanedResult);
      if (response.status !== 200) {
        setWaiting(false);
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      // Update conversation history with the assistant's response
      const assistantMessage = { role: "assistant", content: cleanedResult };
      setConversationHistory(prev => {
        const updatedHistory = [...prev, assistantMessage];
        // 限制历史会话数目
        if (updatedHistory.length > MAX_HISTORY_LENGTH) {
          updatedHistory.splice(0, updatedHistory.length - MAX_HISTORY_LENGTH);
        }
        return updatedHistory;
      });

      setResult(cleanedResult);
      setSandboxRunning(true);
      setWaiting(false);
      setIsSubmitting(false); // 请求完成，设置按钮为可用状态
    } catch (error) {
      console.error("错误信息:", error.message);
      alert("错误信息:", error.message);
      setWaiting(false);
      setIsSubmitting(false); // 请求失败，设置按钮为可用状态
    }
  }


  const editorChange = useCallback((value, viewUpdate) => {
    setResult(value);
  }, []);

  function runClickPlay(event) {
    event.preventDefault();
    setSandboxRunning(true);
  }

  function runClickStop(event) {
    event.preventDefault();
    setSandboxRunning(false);
    setlogMsg("");
  }

  function textSelectChange(event) {
    setSelVal(event.target.value);
    event.preventDefault();
    const search = event.target.value;
    const selectedEg = egArray.find((obj) => obj.value === search);
    if (selectedEg) {
      setlogMsg('');
      setTextInput(selectedEg.prompt);
      setResult(selectedEg.code);
      setSandboxRunning(true);
    } else {
      setlogMsg('');
      setTextInput('');
      setResult('');
      setSandboxRunning(false);
    }
  };

  // 处理作者输入
  const handleAuthorChange = (event) => {
    setAuthor(event.target.value);
    setShowError(false); // 当输入框内容改变时，隐藏错误提示
  };


  // 定义回调函数，用于接收来自 RunContainer 的 dataURL
  const handleScreenshotReady = (dataURL) => {
    //console.log('Screenshot ready in Index.js:', dataURL);

    // 这里可以将 dataURL 保存到状态，或者进行其他操作
    setScreenshotDataURL(dataURL);
  };
  // 分享作品 
  const shareWork = async () => {
   // console.log("shareWork button pushed");
    if (author.trim() === '') { // 检查作者姓名是否为空
    //  console.log("输入分享作者的名字！");
      setShowError(true);
      return;
    }
   // console.log('screenshotDataURL===:', screenshotDataURL);
    try {


      const requestOption = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: result,
          screenshot: screenshotDataURL,
          title: exportedFilename,
          author: author,
        }),
      };
      const response = await fetch('/api/works/', requestOption);
     //console.log("requestOption  ", requestOption);
      if (response.ok) {
        const data = await response.json();
        alert("作品分享成功!");
       // console.log('作品分享成功:', data);
        // 可以在这里添加成功提示，例如弹窗或跳转到作品页面
      } else {
        console.error('作品分享失败:', response.status);
        // 处理分享失败，例如显示错误信息
      }
    } catch (error) {
      console.error('作品分享出错:', error);
      // 处理分享出错，例如显示错误信息
    }
  };
  // New function to start a new topic
  function startNewTopic(event) {
    event.preventDefault(); // 阻止默认行为
   // console.log("新想法按钮");
    setConversationHistory([]); // Clear conversation history
    setTextInput(""); // Clear text input
    setResult("// 请在上面指令区输入你的指令，然后点“提交”"); // Reset result
    setlogMsg(""); // Clear log messages
    setSandboxRunning(false); // Stop sandbox if running
  }

  
  return (
    <>
      <Head>
        <title>斯内克 AI 创意编程</title>
        <meta name="description" content="Turn text into p5.js code using GPT and display it" />
        <link rel="icon" href="/AI-aigr.svg" />
      </Head>
      <div className="w-full p-5 flex flex-col gap-5 min-w-[320px] relative "> 
        <header className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="logo-ai.png" alt="logo" className="h-16 w-16 p-1 bg-white rounded-full shadow shadow-emerald-600/30" />
            <div className="text-gray-700 flex flex-col justify-center">
              <h1 className="logo-title font-semibold text-xl">斯内克 AI 创意编程</h1>
              <p className="logo-subtitle">体验AI的力量 - AI generation</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-0">
            <Link href="/share" className="zplb px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              作品列表
            </Link>
            <div className="flex items-center">
              <label htmlFor="author" className="mr-2">你的名字:</label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={handleAuthorChange}
                className="border border-gray-300 rounded-md px-2 py-1"
              />
            </div>
            <div className="flex items-center">
              <button onClick={shareWork} disabled={!result || author.trim() === ''} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50">
                分享作品
              </button>
              {showError && (
                <p className="text-red-500 text-sm mt-2 xs:mt-0 xs:ml-2">请输入你的名字</p>
              )}
            </div>
          </div>
        </header>
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-[1020px] "> 
          <div className="md:order-2 md:w-1/2 lg:w-1/3 flex flex-col gap-4 ">
            <RunContainer
              key="runcont-01"
              sandboxRunning={sandboxRunning}
              clickPlay={runClickPlay}
              clickStop={runClickStop}
              result={result}
              logMsg={logMsg}
              waiting={waiting}
              onScreenshotReady={handleScreenshotReady}
            />
          </div>
          <div className="md:order-1  left-content  flex flex-col gap-4">
            <TextInput
              key="textinput-01"
              textInput={textInput}
              onChange={textInputChange}
              waiting={waiting}
              selectVal={selVal}
              selectChange={textSelectChange}
              egArray={egArray}
              textInputSubmit={textInputSubmit}
              startNewTopic={startNewTopic}
            />
            <Editor
              key="editor-01"
              result={result}
              onChange={editorChange}
              waiting={waiting}
              conversationHistory={conversationHistory}
              textInput={textInput}
              setConversationHistory={setConversationHistory}
              setResult={setResult}
              setTextInput={setTextInput}
              onFilenameChange={handleFilenameChange}
            />
          </div>
        </div>
        <p className="text-gray-400 text-sm text-center mt-3">
          Made by <a href="https://mattelim.com" target="_blank" className="underline">Matte Lim</a>/ Modified by <a href="https://snakecoding.club" target="_blank" className="underline">Daniel</a> / AI model : {MODEL}
        </p>
      </div>

      <style jsx>{`
        /* 在屏幕宽度小于 1533px 时应用以下样式 */
        @media (max-width: 1533px) { 
        
          .md\:w-1\/2 {
            width: 100% !important; /* 在小屏幕上，两个主要组件各占 100% 宽度 */
          }
          .lg\:w-2\/3 {
            width: 100% !important;
          }
          .lg\:w-1\/3 {
            width: 100% !important;
          }
              /* 添加以下样式来调整字体大小 */
    body {
      font-size: 12px; /* 设置默认字体大小 */
    }
    h1, h2, h3, h4, h5, h6 {
      font-size: 0.2em; /* 调整标题字体大小 */
    }
        }
      `}</style>
    </>
  );
}
