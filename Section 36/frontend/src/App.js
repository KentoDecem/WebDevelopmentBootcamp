import './App.css';
import Navbar from './components/Navbar/Navbar';
import {BrowserRouter, Routes, Route } from "react-router-dom";
import Strona_Główna from './Pages/Strona_Główna';
import Swieczki from './Pages/Swieczki';
import Blog from './Pages/Blog';
import Kontakt from './Pages/Kontakt';
import O_Nas from './Pages/O_Nas';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';

function App() {
  return (
    <div>
      <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Strona_Główna />} />
        <Route path='/swieczki' element={<Swieczki />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/kontakt' element={<Kontakt />} />
        <Route path='/o_nas' element={<O_Nas />} />
        <Route path="product" element={<Product />}>
          <Route path=":productId" element={<Product />} />
        </Route>
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<LoginSignup />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
