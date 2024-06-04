import React from 'react';
import '../../index.css';
import Header from '../Header/Header'
import Body from '../Body/Body';
import Footer from '../Footer/Footer'


function App() {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <Header/>
      <Body/>
      <Footer/>
    </div>
  );
}


export default App;