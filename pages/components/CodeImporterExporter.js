import React, { useState } from 'react';
import { saveAs } from 'file-saver';

const CodeImporterExporter = ({ conversationHistory, result, textInput, setConversationHistory, setResult, setTextInput, filename, onFilenameChange }) => {
  const [fileName, setFileName] = useState('作品名字'); // 默认文件名，不包括后缀


  // 导出代码为 JSON 文件
  const exportCode = () => {
    const codeToExport = {
      history: conversationHistory,
      result: result,
      textInput: textInput,
    };
    const blob = new Blob([JSON.stringify(codeToExport, null, 2)], { type: 'application/json' });
    saveAs(blob, `${fileName}.json`); // 使用用户输入的文件名并添加后缀
  };

  // 导入代码
  const importCode = (event) => {
   // console.log(event.target);
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const importedData = JSON.parse(e.target.result);
      setConversationHistory(importedData.history || []);
      setResult(importedData.result || "// 请在上面指令区输入你的指令，然后点“提交”");
      setTextInput(importedData.textInput || "");
    };
    reader.readAsText(file);
  };

  const handleFocus = () => {
    if (fileName === '作品名字') {
      setFileName(''); // 清空输入框
    }
  };

  return ( <>
    <div className="flex items-center space-x-2"> {/* 使用 Flexbox 布局 */}
      <input
        type="text"
        value={fileName}
        onFocus={handleFocus} // 点击输入框时清空
        // onChange={(e) => setFileName(e.target.value)} 
        onChange={(e) => {
          const newFilename = e.target.value;
          //console.log("newFilename:",newFilename);
          setFileName(newFilename); // 更新组件内部状态
          if (onFilenameChange) {
            onFilenameChange(newFilename); // 调用回调函数通知父组件
          }
        }}
        placeholder="输入作品名"

        className="p-1 border rounded"
      />
      <button
        onClick={exportCode}
        className="p-1 bg-green-500 text-white rounded w-16" // 统一宽度
      >
        导出
      </button>

      <label className="custom-file-input">
        <input
          type="file"
          accept=".json"
          onChange={importCode}
          className="hidden" // 隐藏原始文件输入框
        />
        <span className="w-32 p-2 bg-blue-500 text-white rounded cursor-pointer text-center">导入</span> {/* 增加 padding 和 text-center */}
      </label>
    </div> 
    <style jsx>{`
      /* ... 其他样式 ... */

      @media (max-width: 1533px) { 
        /* 在小屏幕上应用以下样式 */
        div {
          font-size: 12px; /* 调整 TextInput 组件内部的字体大小 */
        }
      }
    `}</style>
    </>
  );
};

export default CodeImporterExporter;
