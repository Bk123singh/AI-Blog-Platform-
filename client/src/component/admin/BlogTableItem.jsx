import React from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext.jsx';
import toast from 'react-hot-toast';

const BlogTableItem = ({ blog, fetchBlogs, index }) => {

  const context = useAppContext();        
  const axios = context?.axios;           

  const { title, createdAt } = blog || {};
  const BlogDate = createdAt ? new Date(createdAt) : null;

  const deleteBlog = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog ?");
    if (!confirmDelete) return;

    try {
      if (!axios) return;

      const { data } = await axios.post("/api/blog/delete", { id: blog._id }); 

      if (data.success) {
        toast.success(data.message);
        await fetchBlogs();
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  const togglePublish = async () => {
    try {
      if (!axios) return;

      const { data } = await axios.post("/api/blog/toggle-publish", { id: blog._id }); 

      if (data.success) {
        toast.success(data.message);
        await fetchBlogs();
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <tr className='border-y border-gray-300'>

      <th className='px-2 py-4'>{index}</th>

      <td className='px-2 py-4'>
        {title || "No Title"}
      </td>

      <td className='px-2 py-4 max-sm:hidden'>
        {BlogDate ? BlogDate.toLocaleDateString() : "No Date"}
      </td>

      <td className='px-2 py-4 max-sm:hidden'>
        <p className={`${blog?.isPublished ? "text-green-600" : "text-orange-700"}`}>
          {blog?.isPublished ? 'Publish' : 'Unpublish'}
        </p>
      </td>

      <td className='px-2 py-4 text-xs flex gap-3'>
        <button 
          onClick={togglePublish} 
          className='border px-2 py-0.5 rounded cursor-pointer'
        >
          {blog?.isPublished ? 'Unpublish' : 'Publish'}
        </button>

        <img
          src={assets.cross_icon}
          alt=""
          onClick={deleteBlog}
          className='w-5 hover:scale-110 transition-all cursor-pointer'
        />
      </td>

    </tr>
  )
}

export default BlogTableItem;