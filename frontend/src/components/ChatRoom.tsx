import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';

export default function ChatRoom(){
  const { id } = useParams(); 
  const [input,setInput]=useState('');
  const [messages,setMessages]=useState<any[]>([]);
  const send = async ()=>{
     const {data} = await api.post('/chat',{characterId:id,message:input});
     setMessages([...messages,{role:'user',content:input},{role:'assistant',content:data.reply}]);
     setInput('');
  };
  return <div className="flex flex-col h-screen">
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
       {messages.map((m,i)=><div key={i} className={m.role==='user'?'text-right':'text-left'}>{m.content}</div>)}
    </div>
    <div className="p-2 flex">
      <input value={input} onChange={e=>setInput(e.target.value)}
        className="flex-1 border rounded-l-lg p-2"/>
      <button onClick={send} className="px-4 bg-green-500 text-white rounded-r-lg">전송</button>
    </div>
  </div>;
} 