import classNames from 'classnames';
import Image from 'next/image';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import React from 'react';

interface Item {
  name: string;
  image: string;
  variations: {
    image: string;
    variation: string;
  }[];
}

interface ApiResponse {
  result: Item[];
  page_info: {
    total_count: number;
    max_page: number;
  };
}
const categories = [
  'All Categories',
  'Housewares',
  'Miscellaneous',
  'Wall-mounted',
  'Wallpaper',
  'Floors',
  'Rugs',
  'Fencing',
  'Tools-Goods',
  'Ceiling Decor',
  'Interior Structures',
  'Cooking',
  'Models',
];
const tags = ['DishFood', 'DishDrink'];

const Home = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchBar, setSearchBar] = useState(searchParams?.get('textSearch') ?? '');
  const [showFilters, setShowFilters] = useState(false);

  // React.useEffect(() => {
  //   const updatedQuery = {
  //     ...searchParams.entries(), // current query params
  //     page: currentPage,
  //   };
  //   router.push({ query: updatedQuery }, undefined, { shallow: true });
  // }, [currentPage]);

  const { isLoading, error, data } = useQuery<ApiResponse>({
    queryKey: ['searchCache', Array.from(searchParams.entries())],
    queryFn: async (): Promise<ApiResponse> => {
      const searchTerm = searchParams.get('textSearch') ?? '';
      const category = searchParams.get('category') ?? '';
      const currentPage = parseInt(searchParams.get('page') ?? '1', 10);
      const tag = searchParams.get('tag') ?? {};
      //console.log(searchParams.get('tag'));
      const apiUrl = `http://localhost:8000?category=${category}&search=${searchTerm}&tag=${tag}&limit=40&page=${currentPage}`;
      const result = await fetch(apiUrl);
      const json = await result.json();
      console.log(`tag: ${JSON.stringify(tag)}`);
      console.log(`tag: ${tag}`);
      return json;
    },
  });
  const TagFilters = ({tagName}:{tagName: string}) => {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          let tagObject = JSON.parse(searchParams.get('tag') || '{}');
          //console.log('tagObject',tagObject)
          //console.log('tagName',tagName)
          let flag = tagObject[tagName] ?? '0';
          //console.log('flag', flag)
          if (flag === '1') {
            flag = '-1';
          } else if (flag === '0') {
            flag = '1';
          } else {
            flag = '0';
          }
          tagObject[tagName] = flag
          //console.log('tagObject',tagObject,tagName,flag)
          //console.log(JSON.stringify(tagObject))
          const updatedQuery = {
            ...Object.fromEntries(searchParams.entries()), // current query params
            page: 1,
            tag: JSON.stringify(tagObject),
          };
          router.push({ query: updatedQuery }, undefined, { shallow: true });
        }}
        className={classNames(
          `px-2 py-1 mr-2 rounded`,
          '0' === searchParams?.get(tagName) ?? '0' ? 'bg-white text-slate-500' : 'bg-amber-300 text-slate-500',
        )}
      >
        {/* Check the value and adjust display accordingly */}
        {searchParams?.get(tagName) ?? ('0' === '1' && '✓ ')}
        {searchParams?.get(tagName) ?? ('0' === '-1' && '✗ ')}
        {tagName}
      </button>
    );
  };

  return (
    <main className={`flex min-h-screen flex-col items-center p-24 gap-6 bg-yellow-100 font-nunito text-slate-500`}>
      <div className="text-4xl absolute top-0 left-0 p-3 m-3 font-black font-finkheavy image-filled-text">
        ACNH Item Search
      </div>
      <div className="flex flex-col w-full">
        {' '}
        {/* parent container for categories, toggle filters, text search*/}
        <div className="relative block mb-5 mr-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const updatedQuery = {
                ...Object.fromEntries(searchParams.entries()), // current query params
                textSearch: searchBar, // updated search value
                page: 1,
              };
              console.log(`onSubmit: ${searchBar}`);
              console.log(`onSubmit: ${JSON.stringify(updatedQuery)}`);
              router.push({ query: updatedQuery }, undefined, { shallow: true });
            }}
          >
            <input
              className="w-full rounded-lg border bg-white px-4 py-3 placeholder:text-neutral-500"
              type="text"
              name="searchBar"
              placeholder="Search for items..."
              autoComplete="off"
              value={searchBar}
              onChange={(e) => {
                setSearchBar(e.target.value);
              }}
            />
          </form>
          <button
            className="absolute inset-y-0 right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none rounded-full w-7 h-7 bg-slate-100"
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
        <div className="flex flex-wrap gap-2 mb-5">
          {' '}
          {/* category buttons*/}
          <button
            onClick={() => {
              setSearchBar(''); // clear out search bar value
              router.push({}, undefined, { shallow: true });
            }}
            className="px-4 py-2 hover:bg-amber-300 bg-white rounded rounded"
          >
            X
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={(e) => {
                e.preventDefault();
                const updatedQuery = {
                  ...Object.fromEntries(searchParams.entries()), // current query params
                  category: category === 'All Categories' ? '' : category, // updated category
                  page: 1,
                };
                router.push({ query: updatedQuery }, undefined, { shallow: true });
              }}
              className={classNames(
                `px-4 py-2 rounded`,
                category === (searchParams.get('category') || 'All Categories')
                  ? 'bg-amber-300 text-slate-500'
                  : 'bg-white text-slate-500',
              )}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="mt-2">
          {' '}
          {/* toggle filters */}
          <button
            className="px-3 py-1 border border-2 text-amber-500  border-amber-500 rounded"
            onClick={() => setShowFilters(!showFilters)}
          >
            More Filters
          </button>
          {showFilters && (
            <div className="mt-3">
              {tags.map((tag) => (
                <TagFilters tagName={tag} key={tag} />
              ))}
              <select className="form-select p-1 mr-2 rounded text-amber-500 border border-amber-500">
                <option>Food/Drink</option>
                <option>Food</option>
                <option>Drink</option>
              </select>
              <select className="form-select p-1 mr-2 rounded text-amber-500 border border-amber-500">
                <option>Filter A</option>
                <option>Filter B</option>
                <option>Filter C</option>
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col w-full items-start">
        {' '}
        {/* item cards */}
        <div className="flex w-full items-center justify-between mb-2">
          <div className="flex-grow pl-1">Item Counts: {data?.page_info.total_count ?? '...'}</div>
          <PaginationControls
            currentPage={parseInt(searchParams.get('page') ?? '1', 10)}
            totalPages={data?.page_info.max_page ?? 1}
            onPageChange={(page) =>
              router.push({ query: { ...Object.fromEntries(searchParams.entries()), page } }, undefined, {
                shallow: true,
              })
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-center items-start">
          {(data?.result ?? []).map((item, i) => (
            <ItemCard key={item.name} item={item} />
          ))}
        </div>
        <div className="flex w-full items-center justify-center mt-5">
          <PaginationControls
            currentPage={parseInt(searchParams.get('page') ?? '1', 10)}
            totalPages={data?.page_info.max_page ?? 1}
            onPageChange={(page) =>
              router.push({ query: { ...Object.fromEntries(searchParams.entries()), page } }, undefined, {
                shallow: true,
              })
            }
          />
        </div>
      </div>
    </main>
  );
};

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="pagination-controls flex h-8 w-auto">
    <button
      className={classNames(
        'text-slate-500 px-3 py-1',
        currentPage === 1 ? 'text-yellow-100' : 'hover:bg-amber-300 transition text-slate-500',
      )}
      onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
      disabled={currentPage === 1}
    >
      &lt;
    </button>
    <span className="text-center mt-1">Page {currentPage}</span>
    <button
      className={`text-slate-500 px-3 py-1 ${
        currentPage === totalPages ? 'text-yellow-100' : 'hover:bg-amber-300 transition text-slate-500'
      }`}
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      &gt;
    </button>
  </div>
);

const ItemCard = ({ item }: { item: Item }) => {
  const [hoveredImage, setHoveredImage] = React.useState(item.image);
  const [hoveredColor, setHoveredColor] = React.useState(item.variations?.[0].variation);
  return (
    <div className="p-5 flex flex-col items-center w-64 h-74 overflow-hidden bg-slate-50 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold h-10">{item.name}</h3>
      <img className="w-50 h-auto mb-4" src={hoveredImage} alt={item.name} />
      <div className="flex flex-row overflow-x-auto items-center h-11">
        {
          item.variations?.length ? (
            item.variations.map((v, index) => (
              <img
                key={index}
                className="object-contain w-9 h-auto mb-3"
                src={v.image}
                alt={`${item.name} variation ${index}`}
                onMouseEnter={() => {
                  setHoveredImage(v.image);
                  setHoveredColor(v.variation);
                }}
                onMouseLeave={() => {
                  setHoveredImage(item.image);
                  setHoveredColor(item.variations[0].variation);
                }}
              />
            ))
          ) : (
            <div className="flex-grow"></div>
          ) /* Empty div to maintain space */
        }
      </div>
      <h3 className="text-sm font-semibold mb-4 pt-2 h-3">{hoveredColor}</h3>
    </div>
  );
};

export default Home;
