import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import BlogTableItem from "../../component/admin/BlogTableItem";
import { useAppContext } from "../../context/AppContext.jsx";  
import toast from "react-hot-toast";  

const Dashbord = () => {

  const context = useAppContext();       
  const axios = context?.axios;

  const [dashboard, setDashboard] = useState({
    blog: 0,
    comments: 0,
    drafts: 0,
    recentBlog: [],
  });

  const fetchDashboard = async () => {
    try {

      if (!axios) return;  

      const { data } = await axios.get("/api/admin/dashboard");

      if (data.success) {
        setDashboard(data.dashboard);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [axios]); 

  return (
    <div className="flex-1 p-4 md:p-10 bg-blue-50/50">

      {/* CARDS */}
      <div className="flex flex-wrap gap-4">

        <div className="flex items-center gap-4 bg-white p-4 min-w-58 rounded shadow">
          <img src={assets.dashboard_icon_1} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashboard.blog || 0}
            </p>
            <p className="text-gray-400 font-light">Blogs</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 min-w-58 rounded shadow">
          <img src={assets.dashboard_icon_2} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashboard.comments || 0}
            </p>
            <p className="text-gray-400 font-light">Comments</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 min-w-58 rounded shadow">
          <img src={assets.dashboard_icon_3} alt="" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashboard.drafts || 0}
            </p>
            <p className="text-gray-400 font-light">Drafts</p>
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div>
        <div className="flex items-center gap-3 m-4 mt-6 text-gray-600">
          <img src={assets.dashboard_icon_4} alt="" />
          <p>Latest Blog</p>
        </div>

        <div className="relative max-w-4xl overflow-x-auto shadow rounded-lg bg-white">
          <table className="w-full text-sm text-gray-500">

            <thead className="text-xs text-gray-600 text-left uppercase">
              <tr>
                <th className="px-2 py-4 xl:px-6">#</th>
                <th className="px-2 py-4">Blog Title</th>
                <th className="px-2 py-4 max-sm:hidden">Date</th>
                <th className="px-2 py-4 max-sm:hidden">Status</th>
                <th className="px-2 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {(dashboard.recentBlog || []).map((blog, index) => (
                <BlogTableItem
                  key={blog._id || index}
                  blog={blog}
                  fetchBlogs={fetchDashboard}
                  index={index + 1}
                />
              ))}

              {(dashboard.recentBlog || []).length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No Blogs Found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashbord;