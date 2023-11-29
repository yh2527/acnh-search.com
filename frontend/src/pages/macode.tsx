import classNames from 'classnames';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import Head from 'next/head';

const Home = () => {
  const [lan, setLan] = useState('en');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [moreFilters, setMoreFilters] = useState({
    colors: '',
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    setLan(searchParams?.get('lan') ?? 'en');
    setMoreFilters({
      colors: searchParams?.get('colors') ?? '',
    });
  }, [searchParams]);
  const { isLoading, error, data } = useQuery<ApiResponse>({
    queryKey: ['searchCache', Array.from(searchParams.entries())],
    queryFn: async (): Promise<ApiResponse> => {
      const newParams = new URLSearchParams({
        lan: searchParams.get('lan') ?? 'en',
        uses: searchParams.get('uses') ?? '',
        page: searchParams.get('page') ?? '1',
        colors: searchParams.get('colors') ?? '',
        material: searchParams.get('material') ?? '',
      });
      const apiUrl = `http://localhost:8000/macode?${newParams}`;
      //const apiUrl = `/api?${newParams}`;
      const result = await fetch(apiUrl);
      const json = await result.json();
      return json;
    },
  });
  const localize = (eng: string) => {
    return lan === 'en' ? eng : translation[eng];
  };
  const item = {
    _id: {
      $oid: '65642fbb69288c56062452fe',
    },
    url: 'https://i.pinimg.com/564x/3a/34/91/3a3491d4bf01b5b541a7cd3a39fb1333.jpg',
    macode: 'MA-5046-8029-3752',
    colors: ['Brown', 'Dark Brown', 'Green'],
    uses: ['Wood Path', 'Path'],
    material: ['Wood'],
    creator: 'Twitter @tmsn_01',
  };
  return (
    <div className="flex justify-center">
      <div className="max-w-[1440px] w-full mx-auto relative">
        <Head>
          <link rel="icon" href="/tree1-modified.png" />
        </Head>
        <main
          className={`flex min-h-screen flex-col items-center py-24 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 bg-yellow-100 font-nunito text-slate-500`}
        >
          <div className="flex flex-row flex-wrap">
            <div className="text-3xl md:text-4xl absolute top-0 left-0 xs:p-3 mt-1 md:m-3 font-black font-finkheavy image-filled-text">
              ACNH MA Code Search
            </div>
            <div className="text-xs xs:text-base xs:absolute xs:top-0 xs:right-0 mb-2 xs:mb-0 xs:p-3 xs:m-3 text-left">
              <div className="flex">
                <button
                  onClick={() => {
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()), // current query params
                      lan: 'en', // updated search value
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                  className={classNames('w-9 h-6 mx-1 rounded hover:bg-amber-200', lan === 'en' && 'bg-amber-200')}
                >
                  ENG
                </button>
                |
                <button
                  onClick={() => {
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()), // current query params
                      lan: 'cn', // updated search value
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                  className={classNames('w-9 h-6 mx-1 rounded hover:bg-amber-200', lan === 'cn' && 'bg-amber-200')}
                >
                  中文
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full relative mt-5">
            {' '}
            {/* parent container for categories, toggle filters, text search*/}
          </div>

          <div className="flex flex-row flex-wrap w-full items-center">
            {(data?.result ?? []).map((item, i) => (
              <img className="w-2/5 h-auto my-3 mx-10" src={item.url} alt={item.macode} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
export default Home;
