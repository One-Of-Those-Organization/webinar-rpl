import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const registerclick = () => {
    navigate('/register'); 
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      
      <div className="w-full md:w-1/2 bg-purple-300 flex flex-col items-center justify-center py-12 md:py-0">
        <div className="flex flex-col items-center gap-4">
          <img
            src="https://placehold.co/600x600"
            alt="Colorful logo with IF letters"
            className="h-48 md:h-64 w-48 md:w-64"
          />
          <button 
            onClick={registerclick}
            className="px-6 py-2 text-purple-700 hover:text-purple-800 bg-white rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            Register
          </button>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center py-12 md:py-0 px-4">
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-poppins md:text-4xl font-bold mb-6 md:mb-8">LOGIN</h1>
          <form>
            <div className="mb-4 md:mb-6">
              <label className="block font-poppins text-sm font-bold mb-2" htmlFor="nim">
                NIM
              </label>
              <input
                className="w-full p-2 rounded bg-purple-200 focus:outline-purple-600 focus:outline-2" 
                id="nim"
                type="text"
              />
            </div>
            <div className="mb-4 md:mb-6 relative">
              <label className="block font-poppins text-sm font-bold mb-2" htmlFor="password">
                PASSWORD
              </label>
              <input
                className="w-full p-2 rounded bg-purple-200 focus:outline-purple-600 focus:outline-2"
                id="password"
                type="password"
              />
              <i className="fas fa-eye absolute right-3 top-10 cursor-pointer"></i>
            </div>
            <div className="mb-6 text-right">
              <a className="text-sm font-poppins font-bold text-blue-500 hover:text-blue-700" href="#">
                Lupa Password ?
              </a>
            </div>
            <button
              className="w-full p-3 font-semibold font-poppins rounded bg-purple-400 font-banold hover:bg-purple-500 trsition-colors"
              type="submit"
            >
              MASUK
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}