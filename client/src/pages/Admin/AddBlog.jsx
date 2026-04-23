import React, { useState, useRef, useEffect } from "react";
import { assets, blogCategories } from "../../assets/assets";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { parse } from "marked";

const AddBlog = () => {
  const context = useAppContext();
  const axios = context ? context.axios : null; 

  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [image, setImage] = useState(false);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [category, setCategory] = useState("Startup");
  const [isPublished, setIsPublished] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

     
    if (!axios) {
      toast.error("App context not available");
      return;
    }

    try {
      setIsAdding(true);

      const description = quillRef.current
        ? quillRef.current.root.innerHTML
        : "";

      const blog = {
        title,
        subTitle,
        description,
        category,
        isPublished,
      };

      const formData = new FormData();
      formData.append("blog", JSON.stringify(blog));
      formData.append("image", image);

      const { data } = await axios.post("/api/blog/add", formData);

      if (data.success) {
        toast.success(data.message);

        setImage(false);
        setTitle("");
        setSubTitle("");
        setCategory("Startup");
        setIsPublished(false);

        if (quillRef.current) {
          quillRef.current.root.innerHTML = "";
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const generateContent = async () => {
    if (!title) {
      return toast.error("please enter a title");
    }
    try {
      setLoading(true);
      const { data } = await axios.post("/api/blog/generate", {
        prompt: title,
      });
      if (data.success) {
        quillRef.current.root.innerHTML = parse(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
      });
    }
  }, []);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex-1 bg-blue-50/50 text-gray-600 h-full overflow-y-auto"
    >
      <div className="bg-white w-full max-w-3xl p-6 md:p-10 m-6 shadow-lg rounded-lg">
        <p className="font-medium">Upload thumbnail</p>
        <label htmlFor="image">
          <img
            src={!image ? assets.upload_area : URL.createObjectURL(image)}
            alt=""
            className="mt-2 h-20 rounded cursor-pointer border"
          />
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
            required
          />
        </label>

        <p className="mt-6 font-medium">Blog title</p>
        <input
          type="text"
          placeholder="Type here"
          required
          className="w-full mt-2 p-2 border border-gray-300 outline-none rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <p className="mt-4 font-medium">Sub title</p>
        <input
          type="text"
          placeholder="Type here"
          required
          className="w-full mt-2 p-2 border border-gray-300 outline-none rounded"
          value={subTitle}
          onChange={(e) => setSubTitle(e.target.value)}
        />

        <p className="mt-4 font-medium">Blog Description</p>
        <div className="relative w-full max-w-2xl mt-2">
          <div
            ref={editorRef}
            className="bg-white border border-gray-300 rounded min-h-[200px]"
          ></div>
          {loading &&
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="w-8 h-8 rounded-full border-2 border-t-white animate-spin">

            </div>
          </div>}
          <button
            type="button"
            disabled={loading}
            onClick={generateContent}
            className="absolute bottom-2 right-2 text-xs text-white bg-black/70 px-3 py-1.5 rounded hover:bg-black"
          >
            Generate with AI
          </button>
        </div>

        <p className="mt-4 font-medium">Blog category</p>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-2 px-3 py-2 border border-gray-300 outline-none rounded w-full"
        >
          <option value="">Select category</option>
          {blogCategories.map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 mt-4">
          <p>Publish Now</p>
          <input
            type="checkbox"
            checked={isPublished}
            className="scale-125 cursor-pointer"
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </div>

        <button
          type="submit"
          disabled={isAdding}
          className="mt-8 w-40 h-10 bg-primary text-white rounded hover:opacity-90"
        >
          {isAdding ? "Adding.." : "Add Blog"}
        </button>
      </div>
    </form>
  );
};

export default AddBlog;
