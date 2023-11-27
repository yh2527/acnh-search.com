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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchBar, setSearchBar] = useState('');
  const [minHeight, setMinHeight] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [moreFilters, setMoreFilters] = useState({
    tag: '',
    size: '',
    minHeight: '',
    maxHeight: '',
    colors: '',
    interactions: '',
    surface: '',
    body: '',
    equippable: '',
    pattern: '',
    custom: '',
    sable: '',
    source: '',
    season: '',
    series: '',
    lightingType: '',
    speakerType: '',
    rug: '',
    concept: '',
    clothingType: '',
    clothingTheme: '',
    clothingStyle: '',
    // ... any other filters you have
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    setLan(searchParams?.get('lan') ?? 'en');
    setSearchBar(searchParams?.get('textSearch') ?? '');
    setMinHeight(searchParams?.get('minHeight') ?? '');
    setMaxHeight(searchParams?.get('maxHeight') ?? '');
    setMoreFilters({
      tag: searchParams?.get('tag') ?? '',
      size: searchParams?.get('size') ?? '',
      minHeight: searchParams?.get('minHeight') ?? '',
      maxHeight: searchParams?.get('maxHeight') ?? '',
      colors: searchParams?.get('colors') ?? '',
      interactions: searchParams?.get('interact') ?? '',
      surface: searchParams?.get('surface') ?? '',
      body: searchParams?.get('body') ?? '',
      equippable: searchParams?.get('equippable') ?? '',
      pattern: searchParams?.get('pattern') ?? '',
      custom: searchParams?.get('custom') ?? '',
      sable: searchParams?.get('sable') ?? '',
      source: searchParams?.get('source') ?? '',
      season: searchParams?.get('season') ?? '',
      series: searchParams?.get('series') ?? '',
      lightingType: searchParams?.get('lightingType') ?? '',
      speakerType: searchParams?.get('speakerType') ?? '',
      concept: searchParams?.get('concept') ?? '',
      rug: searchParams?.get('rug') ?? '',
      clothingType: searchParams?.get('type') ?? '',
      clothingTheme: searchParams?.get('theme') ?? '',
      clothingStyle: searchParams?.get('style') ?? '',
      // ... any other filters you have
    });
  }, [searchParams]);
  const { isLoading, error, data } = useQuery<ApiResponse>({
    queryKey: ['searchCache', Array.from(searchParams.entries())],
    queryFn: async (): Promise<ApiResponse> => {
      const newParams = new URLSearchParams({
        lan: searchParams.get('lan') ?? 'en',
        category: searchParams.get('category') ?? '',
        search: searchParams.get('textSearch') ?? '',
        page: searchParams.get('page') ?? '1',
        size: searchParams.get('size') ?? '',
        tag: searchParams.get('tag') ?? '',
        interact: searchParams.get('interact') ?? '',
        colors: searchParams.get('colors') ?? '',
        surface: searchParams.get('surface') ?? '',
        body: searchParams.get('body') ?? '',
        equippable: searchParams?.get('equippable') ?? '',
        pattern: searchParams.get('pattern') ?? '',
        custom: searchParams.get('custom') ?? '',
        sable: searchParams.get('sable') ?? '',
        height: searchParams.get('height') ?? '',
        source: searchParams.get('source') ?? '',
        season: searchParams.get('season') ?? '',
        series: searchParams.get('series') ?? '',
        lightingType: searchParams.get('lightingType') ?? '',
        speakerType: searchParams.get('speakerType') ?? '',
        concept: searchParams.get('concept') ?? '',
        rug: searchParams.get('rug') ?? '',
        type: searchParams?.get('type') ?? '',
        theme: searchParams?.get('theme') ?? '',
        style: searchParams?.get('style') ?? '',
        ...(searchParams.get('minHeight') ? { minHeight: searchParams.get('minHeight') ?? '' } : {}),
        ...(searchParams.get('maxHeight') ? { maxHeight: searchParams.get('maxHeight') ?? '' } : {}),
        // other stuff
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
  const openModal = ({ item }: { item: Item }) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };
  const Modal: React.FC<ModalProps> = ({ item, onClose }) => {
    return (
      <div
        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
        onClick={onClose}
        style={{ backdropFilter: 'blur(5px)' }}
      >
        <div
          className="bg-white rounded-lg w-full sm:w-4/5 md:w-auto pb-2 min-h-[270px] max-h-[90vh] max-w-[780px] box-sizing: border-box overflow-y-auto scrollbar-thin"
          onClick={(e) => e.stopPropagation()}
        >{data.item}</div>
      </div>
    );
  };
 const item = {
  "_id": {
    "$oid": "65642fbb69288c56062452fe"
  },
  "url": "https://i.pinimg.com/564x/3a/34/91/3a3491d4bf01b5b541a7cd3a39fb1333.jpg",
  "macode": "MA-5046-8029-3752",
  "colors": [
    "Brown",
    "Dark Brown",
    "Green"
  ],
  "uses": [
    "Wood Path",
    "Path"
  ],
  "material": [
    "Wood"
  ],
  "creator": "Twitter @tmsn_01"
}
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
          <div className="flex flex-col w-full relative">
            {' '}
            {/* parent container for categories, toggle filters, text search*/}
            <div className="flex w-full mb-3 md:my-3 gap-2 items-center md:w-2/3">
              <button
                onClick={() => {
                  setSearchBar(''); // clear out search bar value
                  setShowFilters(false);
                  router.push({ query: { lan } }, undefined, { shallow: true });
                }}
                className="overflow-hidden px-1 md:w-24 h-8 md:h-10 text-center text-sm md:text-base hover:bg-amber-300 border border-2 text-slate-500  border-slate-500 rounded"
              >
                {localize('Reset All')}
              </button>
              <div className="relative flex-grow">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()), // current query params
                      textSearch: searchBar, // updated search value
                      page: 1,
                    };
                    console.log(`onSubmit: ${JSON.stringify(updatedQuery)}`);
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                >
                  <input
                    className="rounded-lg h-9 md:h-11 border bg-white px-4 py-3 placeholder:text-neutral-500 w-full pr-14"
                    type="text"
                    name="searchBar"
                    placeholder={localize('Search for items...')}
                    autoComplete="off"
                    value={searchBar}
                    onChange={(e) => {
                      setSearchBar(e.target.value);
                    }}
                  />
                </form>
                <button
                  className="absolute inset-y-0 right-2 md:right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none rounded-full w-7 h-7 bg-slate-100"
                  onClick={() => {
                    setSearchBar('');
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()), // current query params
                      textSearch: '', // updated search value
                      page: 1,
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                >
                  &times; {/* This is the "×" character which looks like a cross */}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full items-start">
              <img
                className="w-2/5 h-auto"
                src={'https://i.pinimg.com/564x/3a/34/91/3a3491d4bf01b5b541a7cd3a39fb1333.jpg'}
                alt={'default'}
                onClick={() => openModal({ item })}
              />
              {isModalOpen && selectedItem && <Modal item={selectedItem} onClose={closeModal} />}
          </div>
        </main>
      </div>
    </div>
  );
};
export default Home;
