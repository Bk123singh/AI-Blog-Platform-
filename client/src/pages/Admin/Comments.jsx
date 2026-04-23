import React, { useState, useEffect } from "react";
import CommentTableItem from "../../component/admin/CommentTableItem";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast"; 

const Comments = () => {

  const context = useAppContext();      
  const axios = context?.axios;

  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState("Not Approved");

  const fetchComments = async () => {
    try {

      if (!axios) return;  

      const { data } = await axios.get("/api/admin/comments");

      if (data.success) {
        setComments(data.comments);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [axios]);  

  const filteredComments = (comments || []).filter((comment) => {
    if (filter === "Approved") return comment.isApproved === true;
    return comment.isApproved === false;
  });

  return (
    <div className="flex-1 pt-5 sm:pt-5 sm:pl-16 bg-blue-50/50">

      {/* HEADER */}
      <div className="flex justify-between items-center max-w-3xl">
        <h1 className="text-lg font-semibold">Comments</h1>

        <div className="flex gap-4">
          <button
            onClick={() => setFilter("Approved")}
            className={`shadow-custom-sm border rounded-full px-4 py-1 cursor-pointer text-xs ${
              filter === "Approved" ? "text-primary" : "text-gray-700"
            }`}
          >
            Approved
          </button>

          <button
            onClick={() => setFilter("Not Approved")}
            className={`shadow-custom-sm border rounded-full px-4 py-1 cursor-pointer text-xs ${
              filter === "Not Approved" ? "text-primary" : "text-gray-700"
            }`}
          >
            Not Approved
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="relative h-4/5 max-w-3xl overflow-x-auto mt-4 bg-white shadow rounded-lg scrollbar-hide">
        
        <table className="w-full text-sm text-gray-500">

          <thead className="text-xs text-gray-700 text-left uppercase">
            <tr>
              <th className="px-6 py-3">Blog Title & Comments</th>
              <th className="px-6 py-3 max-sm:hidden">Date</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredComments.map((comment, index) => (
              <CommentTableItem
                key={comment._id || index}
                comment={comment}
                index={index + 1}
                fetchComments={fetchComments}
              />
            ))}

            {/*  FIXED EMPTY STATE */}
            {filteredComments.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No Comments Found
                </td>
              </tr>
            )}

          </tbody>

        </table>
      </div>
    </div>
  );
};

export default Comments;