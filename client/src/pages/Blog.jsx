import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../component/Navbar";
import { assets } from "../assets/assets";
import moment from "moment";
import Footer from "../component/Footer";
import Loader from "../component/Loader";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Blog = () => {
  const { id } = useParams();

  const context = useAppContext();
  const axios = context?.axios;

  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const fetchBlogData = async () => {
    try {
      const res = await axios.get(`/api/blog/${id}`);
      res.data.success
        ? setData(res.data.blog)
        : toast.error(res.data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.post("/api/blog/comments", { blogId: id });

      if (res.data.success) {
        setComments(res.data.comments);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/blog/add-comment", {
        blog: id,
        name,
        content,
      });

      if (res.data.success) {
        toast.success(res.data.message);

        setName("");
        setContent("");   // ✅ FIXED
        fetchComments(); // ✅ refresh comments
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (axios) {
      fetchBlogData();
      fetchComments();
    }
  }, [id, axios]);

  return data ? (
    <div className="relative">
      <img
        src={assets.gradientBackground}
        alt=""
        className="absolute -top-50 -z-10 opacity-50"
      />

      <Navbar />

      <div className="text-center mt-20 text-gray-600">
        <p className="text-primary py-4 font-medium">
          Published on {moment(data.createdAt).format("MMMM Do YYYY")}
        </p>

        <h1 className="text-2xl sm:text-5xl font-semibold max-w-2xl mx-auto text-gray-800">
          {data.title}
        </h1>

        <h2 className="my-5 max-w-lg truncate mx-auto">{data.subTitle}</h2>

        <p className="inline-block py-1 px-4 rounded-full mb-6 border text-sm border-primary/35 bg-primary/5 font-medium text-primary">
          Michal Brown
        </p>
      </div>

      <div className="mx-5 max-w-5xl md:mx-auto my-10 mt-6">
        <img src={data.image} alt="" className="rounded-3xl mb-5" />

        <div
          className="rich-text max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: data.description }}
        ></div>

        {/* COMMENTS */}
        <div className="mt-14 mb-10 max-w-3xl mx-auto px-4">
          <p className="text-lg font-semibold mb-4">
            Comments ({comments.length})
          </p>

          <div className="flex flex-col gap-5">
            {comments.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={assets.user_icon}
                      alt="user"
                      className="w-8 h-8 rounded-full"
                    />
                    <p className="font-medium text-gray-800">{item.name}</p>
                  </div>

                  <span className="text-xs text-gray-500">
                    {moment(item.createdAt).fromNow()}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ADD COMMENT */}
        <div className="max-w-3xl mx-auto">
          <p className="font-semibold mb-4">Add your comment</p>

          <form
            onSubmit={addComment}
            className="flex flex-col items-start gap-4 max-w-lg"
          >
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="Name"
              required
              className="w-full p-2 border border-gray-300 rounded outline-none"
            />

            <textarea
              onChange={(e) => setContent(e.target.value)}
              value={content}
              placeholder="Comment"
              required
              className="w-full p-2 border border-gray-300 rounded outline-none h-48"
            ></textarea>

            <button
              type="submit"
              className="bg-primary text-white rounded p-2 px-8 hover:scale-102 transition-all cursor-pointer"
            >
              Submit
            </button>
          </form>
        </div>

        {/* SHARE */}
        <div className="my-24 max-w-mx-auto">
          <p className="font-semibold my-4">
            Share this article on social media
          </p>

          <div className="flex">
            <img src={assets.facebook_icon} width={50} alt="" />
            <img src={assets.twitter_icon} width={50} alt="" />
            <img src={assets.googleplus_icon} width={50} alt="" />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  ) : (
    <Loader />
  );
};

export default Blog;