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
    variation: string;
    image: string;
  }[];
  variations_info: Record<string, Record<string | null, { image: string; colors: string[] }>>;
  category: string;
  tag: string;
  source: string[];
  size: string[];
}

interface ApiResponse {
  result: Item[];
  page_info: {
    total_count: number;
    max_page: number;
  };
}
const heights = ['Low', 'Medium Low', 'Medium', 'Medium High', 'High', 'Very High', 'No Height'];
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
  'Fish/Insects',
  'Models',
];
const sizes = [
  '0.5x0.5',
  '0.5x1',
  '1.5x1.5',
  '1x0.5',
  '1x1',
  '1x1.5',
  '1x2',
  '2x0.5',
  '2x1',
  '2x1.5',
  '2x2',
  '3x1',
  '3x2',
  '3x3',
  '4x3',
  '4x4',
  '5x5',
];
const interactTypes = [
  'Bed',
  'Chair',
  'Kitchenware',
  'Mirror',
  'Music Player',
  'Musical Instrument',
  'Storage',
  'TV',
  'Toilet',
  'Trash',
  'Wardrobe',
  'Workbench',
  'Other',
];
const colors = [
  'Aqua',
  'Beige',
  'Black',
  'Blue',
  'Brown',
  'Colorful',
  'Gray',
  'Green',
  'Orange',
  'Pink',
  'Purple',
  'Red',
  'White',
  'Yellow',
];
const tags = [
  'Animal',
  'Arch',
  'Audio',
  'Bathtub',
  'Bed',
  'Chair',
  'Chest',
  'Clock',
  'Counter',
  'Desk',
  'Dining',
  'DishDrink',
  'DishFood',
  'Dresser',
  'Facility Decor',
  'Fireplace',
  'Folk Craft Decor',
  'Game Console',
  'Garden',
  'Heating',
  'Home Appliances',
  'Hospital',
  'House Door Decor',
  'Japanese Style',
  'Kitchen',
  'Kitchen Things',
  'Lamp',
  'Mario',
  'Museum',
  'Musical Instrument',
  'Plants',
  'Playground',
  'Ranch',
  'School',
  'Screen',
  'Seaside',
  'Seasonal Decor',
  'Shelf',
  'Shop',
  'Sofa',
  'Space',
  'Sports',
  'Study',
  'Supplies',
  'TV',
  'Table',
  'Toilet',
  'Toy',
  'Vehicle',
  'Work Bench',
];

const Home = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchBar, setSearchBar] = useState(searchParams?.get('textSearch') ?? '');
  const [showFilters, setShowFilters] = useState(false);
  const [moreFilters, setMoreFilters] = useState({
    height: '',
    colors: searchParams?.get('colors') ?? '',
    interactions: '',
    tags: '',
    surface: '',
    // ... any other filters you have
  });
  const isAnyFilterActive = () => {
    console.log('isAnyFilterActive', moreFilters);
    console.log(searchParams?.get('colors'));
    return Object.values(moreFilters).some((value) => value !== '');
  };

  const { isLoading, error, data } = useQuery<ApiResponse>({
    queryKey: ['searchCache', Array.from(searchParams.entries())],
    queryFn: async (): Promise<ApiResponse> => {
      const searchTerm = searchParams.get('textSearch') ?? '';
      const category = searchParams.get('category') ?? '';
      const currentPage = parseInt(searchParams.get('page') ?? '1', 10);
      const size = searchParams.get('size') ?? '';
      const tag = searchParams.get('tag') ?? '';
      const interact = searchParams.get('interact') ?? '';
      const colors = searchParams.get('colors') ?? '';
      const surface = searchParams.get('surface') ?? '';
      const height = searchParams.get('height') ?? '';
      const apiUrl = `http://localhost:8000?category=${category}&search=${searchTerm}&size=${size}&tag=${tag}&interact=${interact}&colors=${colors}&surface=${surface}&height=${height}&limit=40&page=${currentPage}`;
      const result = await fetch(apiUrl);
      const json = await result.json();
      console.log(`tag: ${tag}`);
      return json;
    },
  });
  const InteractFilters = ({ interact }: { interact: string }) => {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          setMoreFilters((prevFilters) => ({
            ...prevFilters,
            interactions: interact,
          }));
          const updatedQuery = {
            ...Object.fromEntries(searchParams.entries()), // current query params
            page: 1,
            interact: interact === 'Other' ? 'True' : interact,
          };
          router.push({ query: updatedQuery }, undefined, { shallow: true });
        }}
        className={classNames(
          `px-2 py-1 mr-2 mb-1 rounded`,
          (interact === 'Other' ? 'True' : interact) === (searchParams?.get('interact') ?? '')
            ? 'bg-amber-300 text-slate-500'
            : 'bg-white text-slate-500',
        )}
      >
        {interact}
      </button>
    );
  };
  const HeightFilters = ({ height }: { height: string }) => {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          setMoreFilters((prevFilters) => ({
            ...prevFilters,
            height: height,
          }));
          const updatedQuery = {
            ...Object.fromEntries(searchParams.entries()), // current query params
            page: 1,
            height: height,
          };
          router.push({ query: updatedQuery }, undefined, { shallow: true });
        }}
        //console.log(JSON.stringify(tagObject))
        className={classNames(
          `px-2 py-1 mr-2 mb-1 rounded`,
          height === (searchParams?.get('height') ?? '') ? 'bg-amber-300 text-slate-500' : 'bg-white text-slate-500',
        )}
      >
        {height}
      </button>
    );
  };
  const ColorFilters = ({ color }: { color: string }) => {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          let colorStr = searchParams.get('colors') || '';
          let colorsSet = new Set(colorStr ? colorStr.split(',').map((c) => c.trim()) : []);
          colorsSet.has(color) ? colorsSet.delete(color) : colorsSet.add(color);
          console.log(colorsSet);
          const updatedQuery = {
            ...Object.fromEntries(searchParams.entries()), // current query params
            page: 1,
            colors: Array.from(colorsSet).join(','),
          };
          router.push({ query: updatedQuery }, undefined, { shallow: true });
          setMoreFilters((prevFilters) => ({
            ...prevFilters,
            colors: Array.from(colorsSet).join(','),
          }));
          console.log(moreFilters);
        }}
        className={classNames(
          `px-2 py-1 mr-2 mb-1 rounded`,
          (searchParams?.get('colors') ?? '').split(',').includes(color)
            ? 'bg-amber-300 text-slate-500'
            : 'bg-white text-slate-500',
        )}
      >
        {(searchParams?.get('colors') ?? '').split(',').includes(color) && '✓ '}
        {color}
      </button>
    );
  };

  const TagFilters = ({ tagName }: { tagName: string }) => {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          setMoreFilters((prevFilters) => ({
            ...prevFilters,
            tags: tagName,
          }));
          let tagObject = JSON.parse(searchParams.get('tag') || '{}');
          let flag = tagObject[tagName] ?? '';
          if (flag === '1') {
            flag = '-1';
          } else if (flag === '-1') {
            flag = '';
          } else {
            flag = '1';
          }
          if (flag === '') {
            delete tagObject[tagName];
          } else {
            tagObject[tagName] = flag;
          }
          const updatedQuery = {
            ...Object.fromEntries(searchParams.entries()), // current query params
            page: 1,
            tag: JSON.stringify(tagObject),
          };
          router.push({ query: updatedQuery }, undefined, { shallow: true });
        }}
        //console.log('tagObject',tagObject,tagName,flag)
        //console.log(JSON.stringify(tagObject))
        className={classNames(
          `px-2 py-1 mr-2 mb-1 rounded`,
          '' === (JSON.parse(searchParams?.get('tag') ?? '{}')[tagName] ?? '')
            ? 'bg-white text-slate-500'
            : 'bg-amber-300 text-slate-500',
        )}
      >
        {(JSON.parse(searchParams?.get('tag') ?? '{}')[tagName] ?? '') === '1' && '✓ '}
        {(JSON.parse(searchParams?.get('tag') ?? '{}')[tagName] ?? '') === '-1' && '✗ '}
        {tagName}
      </button>
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
      <div
        className="p-5 flex flex-col items-center w-64 h-74 overflow-hidden bg-slate-50 rounded-lg shadow-md"
        onClick={() => openModal(item)}
      >
        <h3 className="text-lg font-semibold h-10">{item.name}</h3>
        <img className="w-50 h-auto mb-4" src={hoveredImage} alt={item.name} />
        <div className="flex flex-row overflow-x-auto items-center h-11">
          {
            !!item.variations ? (
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

  const Modal = ({ item, onClose }) => {
    const [hoveredImage, setHoveredImage] = React.useState(item.image);
    let defaultVariation = '';
    let defaultPattern = '';
    if (item.variations_info) {
      defaultVariation = Object.keys(item.variations_info)[0];
      defaultPattern = Object.keys(Object.values(item.variations_info)[0])[0];
    }
    const [hoveredVariation, setHoveredVariation] = React.useState(defaultVariation);
    const [hoveredPattern, setHoveredPattern] = React.useState(defaultPattern);
    return (
      <div
        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
        onClick={onClose}
        style={{ backdropFilter: 'blur(5px)' }}
      >
        <div className="bg-white rounded-lg w-3/5 min-h-[500px]" onClick={(e) => e.stopPropagation()}>
          <div className="relative bg-amber-300 py-4 rounded-t-lg font-bold">
            <div className="text-xl text-center">{item.name}</div>
            <button onClick={onClose} className="absolute inset-y-0 right-5 top-1/2 transform -translate-y-1/2 text-lg">
              &times;
            </button>
          </div>
          {/* Image and Description */}
          <div className="flex items-start">
            <div className="w-[25%] px-5 mt-2">
              <img src={hoveredImage} alt={item.name} className="w-full h-full object-contain" />
              <div className="text-sm text-center">{item.size ? `Size: ${item.size}` : null}</div>
              <div className="text-sm text-center">{item.heightGroup ? `Height: ${item.heightGroup}` : null}</div>
              <div className="text-sm text-center">
                {item.variations_info
                  ? Array.from(new Set(item.variations_info[hoveredVariation][hoveredPattern]?.colors ?? [])).join(', ')
                  : item.colors
                  ? `Color: ${Array.from(new Set(item?.colors ?? [])).join(', ')}`
                  : ''}
              </div>
            </div>
            <div className="w-[75%] pr-10 mt-5">
              <div className="rounded-lg bg-slate-100 px-3 py-2 shadow-sm mb-5">
                <div>
                  <strong>Category:</strong> {item.category}{' '}
                </div>
                <div>
                  <strong>Source:</strong> {item.source ? item.source.join(', ') : item.category}{' '}
                </div>
                <div>
                  <strong>Interaction: </strong>
                  {item.interact === true && 'True'} {!item.interact && 'False'}{' '}
                  {typeof item.interact === 'string' && item.interact}{' '}
                </div>
                <div>
                  <strong>Has surface: </strong>
                  {item?.surface ?? (item.variations ? item.variations[0].surface : false === true && 'True')}
                  {!(item?.surface ?? (item.variations ? item.variations[0].surface : false)) && 'False'}{' '}
                </div>
              </div>
              {
                !!item.variations_info ? (
                  <div className="rounded-lg bg-slate-100 px-3 py-2 shadow-sm mb-5 flex flex-col overflow-x-auto">
                    {/* Variation */}
                    <div>
                      <strong>Variation:</strong> {hoveredVariation === 'null' ? 'None' : hoveredVariation}{' '}
                    </div>
                    <div className="flex flex-row items-center">
                      {Object.entries(item.variations_info).map(([key, value], index) => (
                        <img
                          key={index}
                          className={`object-contain h-14 mx-1 rounded ${
                            hoveredVariation === key ? 'bg-slate-200' : ''
                          }`}
                          src={Object.values(value)[0].image}
                          alt={`${item.name} variation ${index}`}
                          onMouseEnter={() => {
                            setHoveredImage(
                              hoveredPattern ? value[hoveredPattern].image : Object.values(value)[0].image,
                            );
                            setHoveredVariation(key);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow"></div>
                ) /* Empty div to maintain space */
              }
              {
                !!item.variations_info && Object.keys(Object.values(item.variations_info)[0]).length > 1 ? (
                  <div className="rounded-lg bg-slate-100 px-3 py-2 shadow-sm mb-5 flex flex-col overflow-x-auto">
                    {/* Variation */}
                    <div>
                      <strong>Pattern:</strong> {hoveredPattern === 'null' ? 'None' : hoveredPattern}{' '}
                    </div>
                    <div className="flex flex-row items-center">
                      {Object.entries(item.variations_info[hoveredVariation]).map(([key, value], index) => {
                        console.log('variation', hoveredVariation);
                        console.log(Object.values(item.variations_info));
                        console.log('pattern', hoveredPattern);
                        return (
                          <img
                            key={index}
                            className={`object-contain h-14 mx-1 rounded ${
                              hoveredPattern === key ? 'bg-slate-200' : ''
                            }`}
                            src={value.image}
                            alt={`${item.name} variation ${index}`}
                            onMouseEnter={() => {
                              setHoveredImage(value.image);
                              setHoveredPattern(key);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow"></div>
                ) /* Empty div to maintain space */
              }
              {/* Additional content can be placed here */}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  return (
    <main className={`flex min-h-screen flex-col items-center p-24 gap-6 bg-yellow-100 font-nunito text-slate-500`}>
      <div className="text-4xl absolute top-0 left-0 p-3 m-3 font-black font-finkheavy image-filled-text">
        ACNH Item Search
      </div>
      <div className="flex flex-col w-full relative">
        {' '}
        {/* parent container for categories, toggle filters, text search*/}
        <div className="flex w-full my-3 gap-2 items-center">
          <button
            onClick={() => {
              setMoreFilters(() => ({
                height: '',
                colors: '',
                interactions: '',
                tags: '',
                surface: '',
              }));
              setSearchBar(''); // clear out search bar value
              router.push({}, undefined, { shallow: true });
            }}
            className="px-1 py-2 hover:bg-amber-300 border border-2 text-slate-500  border-slate-500 rounded"
          >
            Reset All
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
                console.log(`onSubmit: ${searchBar}`);
                console.log(`onSubmit: ${JSON.stringify(updatedQuery)}`);
                router.push({ query: updatedQuery }, undefined, { shallow: true });
              }}
            >
              <input
                className="rounded-lg border bg-white px-4 py-3 placeholder:text-neutral-500 w-full"
                type="text"
                name="searchBar"
                placeholder={'Search for items...'}
                autoComplete="off"
                value={searchBar}
                onChange={(e) => {
                  setSearchBar(e.target.value);
                }}
              />
            </form>
            <button
              className="absolute inset-y-0 right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none rounded-full w-7 h-7 bg-slate-100"
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
        <div className="flex flex-wrap gap-2 mb-5">
          {' '}
          {/* category buttons*/}
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
                  : 'bg-white text-slate-500 hover:bg-amber-300',
              )}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          {' '}
          {/* size filters*/}
          <button
            onClick={() => {
              const updatedQuery = {
                ...Object.fromEntries(searchParams.entries()), // current query params
                size: '', // updated size
                page: 1,
              };
              router.push({ query: updatedQuery }, undefined, { shallow: true });
            }}
            className={classNames(
              'px-4 py-2 rounded',
              '' === (searchParams?.get('size') ?? '')
                ? 'bg-amber-300 text-slate-500'
                : 'bg-white text-slate-500 hover:bg-amber-300',
            )}
          >
            All sizes
          </button>
          {sizes.map((size) => (
            <button
              key={size}
              onClick={(e) => {
                e.preventDefault();
                const updatedQuery = {
                  ...Object.fromEntries(searchParams.entries()), // current query params
                  size: size, // updated size
                  page: 1,
                };
                router.push({ query: updatedQuery }, undefined, { shallow: true });
              }}
              className={classNames(
                `px-4 py-2 rounded`,
                size === searchParams.get('size')
                  ? 'bg-amber-300 text-slate-500'
                  : 'bg-white text-slate-500 hover:bg-amber-300',
              )}
            >
              {size}
            </button>
          ))}
        </div>
        {/* toggle filters */}
        <div className="mt-2">
          <button
            className={classNames(
              'flex items-center mb-2 px-2 py-1 border border-2 text-amber-500 border-amber-500 rounded hover:bg-amber-200',
              showFilters && 'bg-amber-200',
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            {isAnyFilterActive() && <span className="bg-red-500 w-2 h-2 rounded-full mr-2"></span>}
            <span className={classNames(showFilters ? 'triangle-down' : 'triangle-up', 'mr-2')}></span>
            More Filters
          </button>
          {showFilters && (
            <div className="px-5 h-96 overflow-y-auto bg-amber-200 bg-opacity-60 rounded-lg">
              <div className="mt-3 mb-5">
                {' '}
                {/* height start */}
                <div className="mb-1">Height:</div>
                <button
                  onClick={() => {
                    setMoreFilters((prevFilters) => ({
                      ...prevFilters,
                      height: '',
                    }));
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()), // current query params
                      height: '', // empty height
                      page: 1,
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                  className={classNames(
                    'px-3 py-1 mr-2 mb-1 rounded',
                    '' === (searchParams?.get('height') ?? '')
                      ? 'bg-amber-300 text-slate-500'
                      : 'bg-white text-slate-500 hover:bg-amber-300',
                  )}
                >
                  X
                </button>
                {heights.map((h) => (
                  <HeightFilters height={h} key={h} />
                ))}
              </div>{' '}
              {/* height end */}
              <div className="mb-5">
                {' '}
                {/* color start */}
                <div className="mb-1">Colors:</div>
                <button
                  onClick={() => {
                    setMoreFilters((prevFilters) => ({
                      ...prevFilters,
                      colors: '',
                    }));
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()), // current query params
                      colors: '', // empty colors
                      page: 1,
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                  className={classNames(
                    'px-3 py-1 mr-2 mb-1 rounded',
                    '' === (searchParams?.get('colors') ?? '')
                      ? 'bg-amber-300 text-slate-500'
                      : 'bg-white text-slate-500 hover:bg-amber-300',
                  )}
                >
                  X
                </button>
                {colors.map((color) => (
                  <ColorFilters color={color} key={color} />
                ))}
              </div>{' '}
              {/* color end */}
              <div className="mb-5">
                {' '}
                {/* interact start */} {/* Interact Types */}
                <div className="mb-1">Interactions:</div>
                <button
                  onClick={() => {
                    setMoreFilters((prevFilters) => ({
                      ...prevFilters,
                      interactions: '',
                    }));
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()), // current query params
                      interact: '', // empty interact
                      page: 1,
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                  className={classNames(
                    'px-3 py-1 mr-2 mb-1 rounded',
                    '' === (searchParams?.get('interact') ?? '')
                      ? 'bg-amber-300 text-slate-500'
                      : 'bg-white text-slate-500 hover:bg-amber-300',
                  )}
                >
                  X
                </button>
                {interactTypes.map((interact) => (
                  <InteractFilters interact={interact} key={interact} />
                ))}
              </div>{' '}
              {/* interact end */}
              <div className="mb-5">
                {' '}
                {/* tag start */} {/* tag Types */}
                <div className="mb-1">Tags:</div>
                <button
                  onClick={() => {
                    setMoreFilters((prevFilters) => ({
                      ...prevFilters,
                      tags: '',
                    }));
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()), // current query params
                      tag: '{}', // empty tag
                      page: 1,
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                  className={classNames(
                    'px-3 py-1 mr-2 mb-1 rounded',
                    '{}' === (searchParams?.get('tag') ?? '{}')
                      ? 'bg-amber-300 text-slate-500'
                      : 'bg-white text-slate-500 hover:bg-amber-300',
                  )}
                >
                  X
                </button>
                {tags.map((tag) => (
                  <TagFilters tagName={tag} key={tag} />
                ))}
              </div>
              {/* tag end */}
              <div className="mb-1">Other Filters:</div>
              <select
                onChange={(e) => {
                  e.target.value;
                  const updatedQuery = {
                    ...Object.fromEntries(searchParams.entries()), // current query params
                    surface: e.target.value, // empty tag
                    page: 1,
                  };
                  router.push({ query: updatedQuery }, undefined, { shallow: true });
                }}
                className="form-select p-1 mr-2 mb-2 rounded text-amber-500 border border-amber-500"
              >
                <option value="">Surface All</option>
                <option value="True">Have Surface</option>
                <option value="False">No Surface</option>
              </select>
            </div>
          )}{' '}
          {/* end of showFilters div*/}
        </div>
      </div>{' '}
      {/* end of the first half of the page */}
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
        {isModalOpen && selectedItem && <Modal item={selectedItem} onClose={closeModal} />}
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

export default Home;
