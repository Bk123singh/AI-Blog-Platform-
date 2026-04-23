import React from 'react'
import Navbar from '../component/Navbar'
import Header from '../component/Header'
import BlogList from '../component/BlogList'
import Newletter from '../component/Newletter'
import Footer from '../component/Footer'

const Home = () => {
  return (
    <>
        <Navbar/>
        <Header/>
        <BlogList/>
        <Newletter/>
        <Footer/>

    </>
  )
}

export default Home