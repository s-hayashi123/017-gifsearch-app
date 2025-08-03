import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "./App.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Gif, GiphyApiResponse } from "./types/gif-types";
import { useInView } from "react-intersection-observer";

const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY;

function App() {
  const [searchQuery, setSearchQuery] = useState("Hello");

  const fetchGifs = async ({
    pageParam = 0,
    queryKey,
  }: {
    pageParam?: number;
    queryKey: (string | number)[];
  }) => {
    const [, query] = queryKey;
    const { data } = await axios.get<GiphyApiResponse>(
      `https://api.giphy.com/v1/gifs/search`,
      {
        params: {
          api_key: GIPHY_API_KEY,
          q: query,
          limit: 25,
          offset: pageParam,
        },
      }
    );
    return data;
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["gifs", searchQuery],
    queryFn: fetchGifs,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.pagination.offset + lastPage.pagination.count;
      return nextOffset < lastPage.pagination.total_count
        ? nextOffset
        : undefined;
    },
    initialPageParam: 0,
  });

  const { ref, inView } = useInView();

  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQuery = formData.get("search") as string;
    setSearchQuery(newQuery);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          GIF検索エンジン
        </h1>
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-sm items-center space-x-2 mx-auto mb-8"
        >
          <Input name="search" />
          <Button type="submit">検索</Button>
        </form>
        <div>
          {status === "pending" ? (
            <p>ローディング中...</p>
          ) : status === "error" ? (
            <p>エラー：{error.message}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gridcols-5 gap-4">
                {data.pages.map((group, i) => (
                  <React.Fragment key={i}>
                    {group.data.map((gif: Gif) => (
                      <div key={gif.id} className="overflow-hidden rounded-lg">
                        <img
                          src={gif.images.fixed_height.url}
                          alt={gif.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
              {/* ここに無限スクロールのトリガーとローディング表示が入る */}
              <div ref={ref} className="h-10 flex justify-center items-center">
                {isFetchingNextPage && <p>さらに読み込み中...</p>}
                {!isFetchingNextPage && !hasNextPage && (
                  <p>もうGIFはありません</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
