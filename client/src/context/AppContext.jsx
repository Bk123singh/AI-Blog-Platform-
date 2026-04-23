import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [blog, setBlog] = useState([]);
  const [input, setInput] = useState("");

  const fetchBlog = async () => {
    try {
      const { data } = await axios.get("/api/blog/all");
      data.success ? setBlog(data.blogs) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchBlog();

    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);

       
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
  }, []);

  const value = {
    axios,
    navigate,
    token,
    setToken,
    blog,
    setBlog,
    input,
    setInput,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};