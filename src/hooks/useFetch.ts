import { useEffect, useState } from "react";
import axios from "axios";

const useFetch = (endpoint: string) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response = await axios(`https://fakestoreapi.com/${endpoint}`);
      setData(response.data);
      setIsLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      console.log("Unexpected error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error };
};

export default useFetch;
