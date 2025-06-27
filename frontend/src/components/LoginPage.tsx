import { useAuth } from '../contexts/AuthContext'

function LoginPage(){
  const {login}=useAuth();
  return <div className="flex flex-col items-center gap-4 p-10">
    <button onClick={login} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
      Google로 로그인
    </button>
  </div>;
}

export default LoginPage 