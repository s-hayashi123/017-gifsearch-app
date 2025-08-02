# 【React & TypeScript】Giphy APIで作る！無限スクロールGIF検索アプリ開発チュートリアル (017)

## 🚀 はじめに (The "Why")

こんにちは！このチュートリアルでは、React, TypeScript, そして外部APIを連携させ、キーワードでGIFを検索できる「無限スクロールGIF検索アプリ」を開発します。

**完成形のイメージ:**
![GIF検索アプリの完成イメージ](https://i.imgur.com/Uj8i7gH.gif)

このアプリ開発を通して、あなたは単に面白いGIFを見つけるツールを作るだけではありません。現代的なWebアプリケーション開発に不可欠な、以下の重要なスキルを実践的に学びます。

1.  **外部APIとの連携:** `Giphy`のような公開APIからデータを取得し、アプリケーションに動的なコンテンツを表示する方法。
2.  **無限スクロールの実装:** `Intersection Observer API`を使い、ユーザーがスクロールするだけでシームレスに新しいコンテンツを読み込む、UXの高いインターフェースを構築します。
3.  **高度なデータ取得:** `React Query` (`@tanstack/react-query`) の `useInfiniteQuery` を活用し、複雑になりがちな「ページネーション」や「データキャッシュ」のロジックを、宣言的かつ効率的に管理するプロの技法を習得します。

このチュートリアルを終える頃には、あなたはAPIから取得した大量のデータを、パフォーマンスを意識しながらエレガントに表示する能力を身につけているでしょう。

さあ、APIの世界に飛び込み、ダイナミックなWebアプリを一緒に作り上げましょう！

---

## 🛠 環境構築 (公式ドキュメント完全準拠)

まず、開発環境をセットアップします。`Vite`を使い、`shadcn/ui`の公式ドキュメントに沿って正確に進めます。

### 1. Viteプロジェクトの作成

```bash
npm create vite@latest gif-search-app -- --template react-ts
cd gif-search-app
```

### 2. 依存ライブラリのインストール

GIF検索アプリで必要になるライブラリをインストールします。

-   `@tanstack/react-query`: データ取得と状態管理を強力にサポートします。
-   `axios`: HTTPリクエストを簡単に行うためのライブラリです。
-   `react-intersection-observer`: 無限スクロールを簡単に実装するためのライブラリです。

```bash
npm install @tanstack/react-query axios react-intersection-observer
```

### 3. Tailwind CSS と shadcn/ui のセットアップ

UI構築のために、公式ドキュメントに従ってTailwind CSSとshadcn/uiを導入します。

**a. Tailwind CSSの追加**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**b. `tailwind.config.js` の設定**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**c. `src/index.css` の編集**

ファイルの中身を以下に置き換えます。

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**d. `tsconfig.json` のパスエイリアス設定**

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  // ...
}
```

**e. `vite.config.ts` の更新**

```bash
npm install -D @types/node
```

```typescript
// vite.config.ts
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

**f. `shadcn/ui` の初期化**

```bash
npx shadcn-ui@latest init
```

表示される質問には、以下のように答えてください。

```
Would you like to use TypeScript (recommended)? yes
Which style would you like to use? › Default
Which color would you like to use as base color? › Slate
Where is your global CSS file? › › src/index.css
Do you want to use CSS variables for colors? › yes
Where is your tailwind.config.js located? › tailwind.config.js
Configure import alias for components: › @/components
Configure import alias for utils: › @/lib/utils
Are you using React Server Components? › no
```

### 4. 必要なUIコンポーネントの追加

検索バーとボタンを使います。

```bash
npx shadcn-ui@latest add input
npx shadcn-ui@latest add button
```

### 5. Giphy APIキーの準備

1.  [Giphy Developer Portal](https://developers.giphy.com/)にアクセスし、アカウントを作成またはログインします。
2.  「Create an App」ボタンから新しいアプリを作成し、「API Key」を選択します。
3.  作成したアプリのAPIキーをコピーします。
4.  プロジェクトのルートディレクトリに `.env` という名前のファイルを作成し、APIキーを保存します。

```
# .env
VITE_GIPHY_API_KEY=ここにあなたのAPIキーを貼り付け
```

**重要:** `.env`ファイルに`VITE_`というプレフィックスを付けることで、Viteがクライアントサイドのコードでこの環境変数を読み込めるようになります。

以上で環境構築は完了です！ `npm run dev` を実行して、開発を始めましょう。

---

## 🧠 思考を促す開発ステップ

### Step 1: APIレスポンスの型定義

まず、Giphy APIから返ってくるデータの型を定義しておくと、TypeScriptの恩恵を最大限に受けられます。`src/types.ts`のようなファイルを作成しましょう。

```ts
// src/types.ts
export interface Gif {
  id: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
  };
}

export interface GiphyApiResponse {
  data: Gif[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
}
```

### Step 2: `React Query`のセットアップ

`main.tsx`ファイルを編集し、アプリケーション全体を`QueryClientProvider`でラップします。これにより、どのコンポーネントからでも`React Query`の機能が使えるようになります。

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// TODO: QueryClientのインスタンスを作成しましょう。
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* TODO: AppコンポーネントをQueryClientProviderでラップし、clientプロパティに作成したインスタンスを渡しましょう。 */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

### Step 3: UIコンポーネントの骨格作成

`App.tsx`に、検索フォームとGIFグリッドの基本的なレイアウトを作成します。

```tsx
// src/App.tsx
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function App() {
  const [searchQuery, setSearchQuery] = useState('Hello');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQuery = formData.get('search') as string;
    // TODO: 入力された新しいクエリでsearchQueryのstateを更新しましょう。
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          GIF検索エンジン
        </h1>
        
        {/* TODO: 検索フォームを作成しましょう (form要素) */}
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2 mx-auto mb-8">
          {/* TODO: name属性を 'search' にしたInputコンポーネントを配置しましょう */}
          {/* TODO: typeが 'submit' のButtonコンポーネントを配置しましょう */}
        </form>

        {/* ここにGIFグリッドが表示される予定 */}
      </div>
    </div>
  );
}

export default App;
```

### Step 4: `useInfiniteQuery`でデータ取得ロジックを実装

いよいよ核心部分です。`useInfiniteQuery`を使って、Giphy APIからGIFデータを取得し、ページネーションを管理します。

```tsx
// src/App.tsx
// ... (useState, Input, Buttonなどのimport)
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Gif, GiphyApiResponse } from './types'; // Step 1で作成した型

const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY;

// TODO: Giphy APIからデータを取得する非同期関数を作成しましょう。
// pageParamは、次のページを取得する際のオフセット値として使います。
const fetchGifs = async ({ pageParam = 0, queryKey }: { pageParam?: number, queryKey: (string | number)[] }) => {
  const [, query] = queryKey;
  const { data } = await axios.get<GiphyApiResponse>(`https://api.giphy.com/v1/gifs/search`, {
    params: {
      api_key: GIPHY_API_KEY,
      q: query,
      limit: 25,
      offset: pageParam,
    }
  });
  return data;
};

function App() {
  const [searchQuery, setSearchQuery] = useState('Cat');
  
  // TODO: useInfiniteQueryフックを呼び出しましょう。
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    // queryKey: クエリの一意なキー。検索クエリが変わると自動で再取得されます。
    queryKey: ['gifs', searchQuery],
    // queryFn: データを取得する非同期関数。
    queryFn: fetchGifs,
    // getNextPageParam: 次のページのパラメータを計算する関数。
    // lastPage.paginationから次のオフセットを計算し、返します。
    // 次のページがない場合はundefinedを返します。
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = lastPage.pagination.offset + lastPage.pagination.count;
      return nextOffset < lastPage.pagination.total_count ? nextOffset : undefined;
    },
    // initialPageParam: 最初のページのパラメータ
    initialPageParam: 0,
  });

  // ... (handleSearch関数)

  return (
    // ... (h1とform)
    <div>
      {/* TODO: statusに応じてUIを出し分けましょう */}
      {status === 'pending' ? (
        <p>ローディング中...</p>
      ) : status === 'error' ? (
        <p>エラー: {error.message}</p>
      ) : (
        <>
          {/* TODO: 取得したデータをグリッド表示しましょう */}
          {/* data.pagesはページの配列なので、二重にmapする必要があります */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.pages.map((group, i) => (
              <React.Fragment key={i}>
                {group.data.map((gif: Gif) => (
                  <div key={gif.id} className="overflow-hidden rounded-lg">
                    <img src={gif.images.fixed_height.url} alt={gif.title} className="w-full h-full object-cover" />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* ここに無限スクロールのトリガーとローディング表示が入る */}
        </>
      )}
    </div>
  );
}
```

### Step 5: 無限スクロールの実装

`react-intersection-observer`を使い、ページの下部にある要素が表示されたら次のページを読み込むようにします。

```tsx
// src/App.tsx
// ... (他のimport)
import { useInView } from 'react-intersection-observer';
import React from 'react'; // Reactのimportを追加

function App() {
  // ... (useState, useInfiniteQuery)

  // TODO: useInViewフックを呼び出しましょう。
  const { ref, inView } = useInView();

  // TODO: useEffectを使って、監視要素(ref)が画面内に入ったら次のページを読み込む処理を書きましょう。
  React.useEffect(() => {
    // inViewがtrue (画面内に入った) かつ hasNextPageがtrue (次のページがある) 場合に実行
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // ... (handleSearch)

  return (
    // ... (h1, form)
    <div>
      {/* ... (statusに応じたUIの出し分け) */}
      <>
        {/* ... (グリッド表示) */}

        {/* TODO: 無限スクロールのトリガーとなる要素を配置しましょう */}
        <div ref={ref} className="h-10 flex justify-center items-center">
          {/* TODO: 次のページを読み込み中(isFetchingNextPage)にローディングインジケーターを表示しましょう */}
          {isFetchingNextPage && <p>さらに読み込み中...</p>}
          {/* TODO: 次のページがない(!hasNextPage)場合にメッセージを表示しましょう */}
          {!isFetchingNextPage && !hasNextPage && <p>もうGIFはありません</p>}
        </div>
      </>
    </div>
  );
}
```

これで、GIF検索アプリの全機能が完成しました！スクロールして無限にGIFが読み込まれるか、新しいキーワードで検索できるか試してみてください。

---

## 📚 深掘りコラム (Deep Dive)

### なぜ`useInfiniteQuery`が強力なのか？

このアプリは`useState`と`useEffect`を駆使しても作れますが、`useInfiniteQuery`を使うと以下のようなメリットがあります。

1.  **宣言的なコード:** 「何を取得したいか(`queryKey`)」「どうやって取得するか(`queryFn`)」「次のページは何か(`getNextPageParam`)」を定義するだけで、複雑な状態管理ロジックを`React Query`が裏側で全て処理してくれます。
2.  **キャッシュ管理:** 一度取得したデータはキャッシュされます。例えば、'Cat'で検索した後に'Dog'で検索し、再び'Cat'で検索すると、APIリクエストを再実行せずにキャッシュから瞬時にデータを表示します（設定による）。これにより、ユーザー体験とパフォーマンスが向上します。
3.  **豊富な状態管理:** `isFetching`, `isFetchingNextPage`, `status`, `error`など、データ取得に関するあらゆる状態を自動で管理してくれます。これにより、ローディングスピナーやエラーメッセージの表示が非常に簡単になります。

ページネーションが必要なAPIを扱う場合、`useInfiniteQuery`はあなたのコードを劇的にシンプルにし、バグを減らしてくれる強力なツールです。

---

## 🔥 挑戦課題 (Challenges)

-   **Easy 難易度: ローディングスケルトン**
    -   初回のデータ読み込み中(`isFetching`がtrueで`isFetchingNextPage`がfalseの時)に、ただ「ローディング中...」と表示するのではなく、GIFカードの形をしたスケルトンUIを表示してみましょう。(`shadcn/ui`の`Skeleton`コンポーネントが役立ちます)
-   **Medium 難易度: Masonryレイアウト**
    -   現在のグリッドレイアウトでは、GIFの高さが異なると下に不自然な空白ができてしまいます。`masonry-layout`や`react-photo-gallery`のようなライブラリを導入して、Pinterestのような美しいMasonryレイアウトを実装してみましょう。
-   **Hard 難易度: 検索キーワードのデバウンス**
    -   現状では、検索ボタンを押さないと検索が実行されません。ユーザーが検索ボックスに入力するたびに自動で検索が走るように変更してみましょう。ただし、一文字入力するごとにAPIを叩かないように、「デバウンス(debounce)」というテクニック（ユーザーの入力が500ms止まったら検索を実行する、など）を実装してください。

---

## ✅ 結論

お疲れ様でした！このチュートリアルを通して、あなたは以下の実践的なスキルを習得しました。

-   外部APIと連携し、動的なデータをアプリケーションに組み込む方法
-   `useInfiniteQuery`を使った、宣言的で効率的な無限スクロールの実装
-   `Intersection Observer API` (`react-intersection-observer`) の基本的な使い方
-   環境変数 (`.env`) を使った安全なAPIキーの管理

これらの技術は、SNSのタイムライン、商品リスト、ニュースフィードなど、多くのモダンなWebアプリケーションで使われています。ぜひこの経験を活かして、さらに面白いアプリケーション開発に挑戦してみてください！

Happy Coding!
