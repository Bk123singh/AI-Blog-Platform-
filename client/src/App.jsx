import React from 'react'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Layout from './pages/Admin/Layout';
import Comments from './pages/Admin/Comments';
import ListBlog from './pages/Admin/ListBlog';
import AddBlog from './pages/Admin/AddBlog';
import Dashbord from './pages/Admin/Dashbord';
import Login from './component/admin/Login';
import { Toaster } from 'react-hot-toast'
import 'quill/dist/quill.snow.css'
import { useAppContext } from './context/AppContext.jsx';

const App = () => {

  const context = useAppContext(); 
  const token = context?.token;  

  return (
    <div>
      <Toaster />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:id" element={<Blog />} />

        <Route path='/admin' element={token ? <Layout /> : <Login />} >
          <Route index element={<Dashbord />} />
          <Route path='addBlog' element={<AddBlog />} />
          <Route path='listBlog' element={<ListBlog />} />
          <Route path='comments' element={<Comments />} />
        </Route>

      </Routes>
    </div>
  )
}

export default App;