import React, { useState } from "react";
import { blogCategories } from "../assets/assets";
import { motion } from "motion/react";
import BlogCard from "./BlogCard";
import { useAppContext } from "../context/AppContext.jsx";

const BlogList = () => {
  const [menu, setMenu] = useState("All");

  const context = useAppContext();
  if (!context) return null;

  const { blog, input } = context;

  const filteredBlogs = () => {

    let tempBlogs = blog;

    //  Search filter
    if (input && input.trim() !== "") {
      tempBlogs = tempBlogs.filter((item) =>
        item.title.toLowerCase().includes(input.toLowerCase()) ||
        item.category.toLowerCase().includes(input.toLowerCase())
      );
    }

    //  Category filter
    if (menu !== "All") {
      tempBlogs = tempBlogs.filter(
        (item) => item.category === menu
      );
    }

    return tempBlogs;
  };

  return (
    <div>
      <div className="flex justify-center gap-4 sm:gap-8 my-10">
        {blogCategories.map((item) => (
          <div key={item} className="relative">
            <button
              onClick={() => setMenu(item)}
              className={`relative px-4 py-1 rounded-full transition-all duration-300 cursor-pointer 
              ${menu === item ? "text-white" : "text-gray-500 hover:text-white"}`}
            >
              {menu === item && (
                <motion.div
                  layoutId="underline"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                />
              )}
              {item}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 mb-24 mx-8 sm:mx-16 xl:mx-40">
        {filteredBlogs().map((item) => (
          <BlogCard key={item._id} blog={item} />
        ))}
      </div>
    </div>
  );
};

export default BlogList;