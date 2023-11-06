import classNames from 'classnames';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import React from 'react';

import {
  heights,
  categories,
  sizes,
  interactTypes,
  colors_object,
  tags,
  concepts,
  series_list,
  sources,
  seasonals,
  lightings,
  album_players,
  rugs,
  kit,
  translation,
} from './lists';

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

const Home = () => {
  const [lan, setLan] = useState('en');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
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
    pattern: '',
    custom: '',
    sable: '',
    source: '',
    seasib: '',
    series: '',
    lightingType: '',
    speakerType: '',
    rug: '',
    concept: '',
    // ... any other filters you have
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
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
      // ... any other filters you have
    });
  }, [searchParams]);
  const isAnyFilterActive = () => {
    //const { minHeight, maxHeight, ...restOfFilters } = moreFilters;
    //const hasSpecialValues = minHeight === '0' && maxHeight === '40';
    //const areOthersEmpty = Object.values(restOfFilters).every((value) => value === '');
    //console.log('areOthersEmpty', areOthersEmpty);
    //return !(hasSpecialValues && areOthersEmpty);
    return Object.values(moreFilters).some((value) => value !== '');
  };
  const localize = (eng: string) => {
    return lan === 'en' ? eng : translation[eng];
  };

  const { isLoading, error, data } = useQuery<ApiResponse>({
    queryKey: ['searchCache', Array.from(searchParams.entries())],
    queryFn: async (): Promise<ApiResponse> => {
      const newParams = new URLSearchParams({
        category: searchParams.get('category') ?? '',
        search: searchParams.get('textSearch') ?? '',
        page: parseInt(searchParams.get('page') ?? '1', 10),
        size: searchParams.get('size') ?? '',
        tag: searchParams.get('tag') ?? '',
        interact: searchParams.get('interact') ?? '',
        colors: searchParams.get('colors') ?? '',
        surface: searchParams.get('surface') ?? '',
        body: searchParams?.get('body') ?? '',
        pattern: searchParams?.get('pattern') ?? '',
        custom: searchParams?.get('custom') ?? '',
        sable: searchParams?.get('sable') ?? '',
        height: searchParams.get('height') ?? '',
        source: searchParams.get('source') ?? '',
        season: searchParams.get('season') ?? '',
        series: searchParams.get('series') ?? '',
        lightingType: searchParams.get('lightingType') ?? '',
        speakerType: searchParams.get('speakerType') ?? '',
        concept: searchParams.get('concept') ?? '',
        rug: searchParams?.get('rug') ?? '',
        ...(searchParams.get('minHeight') ? { minHeight: searchParams.get('minHeight') } : {}),
        ...(searchParams.get('maxHeight') ? { maxHeight: searchParams.get('maxHeight') } : {}),
        // other stuff
      });
      const apiUrl = `http://localhost:8000?${newParams}`;
      const result = await fetch(apiUrl);
      const json = await result.json();
      return json;
    },
  });
  const InteractFilters = ({ interact }: { interact: string }) => {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
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
            : 'bg-white text-slate-500 hover:bg-amber-300',
        )}
      >
        {localize(interact)}
      </button>
    );
  };
  const SizeFilters = ({ size }: { size: string }) => {
    return (
      <button
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
          `px-2 py-1 mr-2 mb-1 rounded`,
          size === searchParams.get('size')
            ? 'bg-amber-300 text-slate-500'
            : 'bg-white text-slate-500 hover:bg-amber-300',
        )}
      >
        {size}
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
        }}
        className={classNames(
          `px-2 py-1 mr-2 mb-1 rounded`,
          (searchParams?.get('colors') ?? '').split(',').includes(color)
            ? 'bg-amber-300 text-slate-500'
            : 'bg-white text-slate-500',
        )}
      >
        {(searchParams?.get('colors') ?? '').split(',').includes(color) && '✓ '}
        {localize(color)}
      </button>
    );
  };

  const TagFilters = ({ tagName }: { tagName: string }) => {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          const updatedQuery = {
            ...Object.fromEntries(searchParams.entries()), // current query params
            page: 1,
            tag: tagName,
          };
          router.push({ query: updatedQuery }, undefined, { shallow: true });
        }}
        //console.log('tagObject',tagObject,tagName,flag)
        //console.log(JSON.stringify(tagObject))
        className={classNames(
          `px-2 py-1 mr-2 mb-1 rounded`,
          tagName === (searchParams?.get('tag') ?? '')
            ? 'bg-amber-300 text-slate-500'
            : 'bg-white text-slate-500 hover:bg-amber-300',
        )}
      >
        {localize(tagName)}
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
      {/* Dropdown for page selection */}
      <select value={currentPage} onChange={(e) => onPageChange(Number(e.target.value))} className="mx-1 px-1 rounded">
        {[...Array(totalPages).keys()].map((_, index) => (
          <option key={index} value={index + 1}>
            {localize('Page')} {index + 1}
          </option>
        ))}
      </select>
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
    const [hoveredColor, setHoveredColor] = React.useState(
      lan === 'en'
        ? (item.variations?.[0]?.variation ?? '') +
            (item.variations?.[0]?.variation && item.variations?.[0]?.pattern ? ': ' : '') +
            (item.variations?.[0]?.pattern ?? '')
        : (item.variations?.[0]?.variantTranslations?.cNzh ?? '') +
            (item.variations?.[0]?.variantTranslations?.cNzh && item.variations?.[0]?.patternTranslations?.cNzh
              ? ': '
              : '') +
            (item.variations?.[0]?.patternTranslations?.cNzh ?? ''),
    );
    return (
      <div
        className="p-5 flex flex-col items-center w-64 h-84 overflow-hidden bg-slate-50 rounded-lg shadow-md"
        onClick={() => openModal(item)}
      >
        <h3 className="text-center text-lg font-semibold h-10">{lan === 'en' ? item.name : item.translations.cNzh}</h3>
        <div className="flex items-center justify-center w-50 h-40">
          <img
            className="w-auto h-auto max-w-full max-h-full"
            src={hoveredImage}
            alt={lan === 'en' ? item.name : item.translations.cNzh}
          />
        </div>
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
                    setHoveredColor(
                      lan === 'en'
                        ? (v.variation ?? '') + (v.variation && v.pattern ? ': ' : '') + (v.pattern ?? '')
                        : (v.variantTranslations?.cNzh ?? '') +
                            (v.variantTranslations?.cNzh && v.patternTranslations?.cNzh ? ': ' : '') +
                            (v.patternTranslations?.cNzh ?? ''),
                    );
                  }}
                />
              ))
            ) : (
              <div className="flex-grow"></div>
            ) /* Empty div to maintain space */
          }
        </div>
        <h3 className="text-sm font-semibold mb-4 pt-2 h-5">{hoveredColor}</h3>
      </div>
    );
  };

  const Modal = ({ item, onClose }) => {
    const [hoveredImage, setHoveredImage] = React.useState(item.image);
    let defaultVariation = '';
    let defaultPattern = '';
    let defaultVarTranslation = '';
    let defaultPaTranslation = '';
    if (item.variations_info) {
      defaultVariation = Object.keys(item.variations_info)[0];
      defaultPattern = Object.keys(Object.values(item.variations_info)[0])[0];
      defaultVarTranslation = Object.values(Object.values(item.variations_info)[0])[0].variantTranslations?.cNzh;
      defaultPaTranslation = Object.values(Object.values(item.variations_info)[0])[0].patternTranslations?.cNzh;
    }
    const [hoveredVariation, setHoveredVariation] = React.useState(defaultVariation);
    const [hoveredPattern, setHoveredPattern] = React.useState(defaultPattern);
    const [hoveredVarTranslation, setHoveredVarTranslation] = React.useState(defaultVarTranslation);
    const [hoveredPaTranslation, setHoveredPaTranslation] = React.useState(defaultPaTranslation);
    const [lastDiv, setLastDiv] = useState(false);
    useEffect(() => {
      if (
        item.interact ||
        (item.surface ?? (item.variations ? item.variations[0].surface : false)) ||
        item.series ||
        findKeyByValue(tags, item.tag) ||
        (item.concepts?.length ?? 0) > 0 ||
        item.lightingType ||
        item.speakerType
      ) {
        setLastDiv(true);
      }
    }, [
      item.interact,
      item.surface,
      item.series,
      findKeyByValue(tags, item.tag),
      item.concepts,
      item.lightingType,
      item.speakerType,
    ]); // dependencies array

    return (
      <div
        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
        onClick={onClose}
        style={{ backdropFilter: 'blur(5px)' }}
      >
        <div className="bg-white rounded-lg w-3/5 min-h-[300px] pb-2" onClick={(e) => e.stopPropagation()}>
          <div className="relative bg-amber-300 py-4 rounded-t-lg font-bold">
            <div className="text-xl text-center">{lan === 'en' ? item.name : item.translations.cNzh}</div>
            <button onClick={onClose} className="absolute inset-y-0 right-5 top-1/2 transform -translate-y-1/2 text-lg">
              &times;
            </button>
          </div>
          {/* Image and Description */}
          <div className="flex items-start">
            <div className="w-[25%] h-36 px-5 mt-2">
              <div className="flex items-center justify-center w-full h-full">
                <img src={hoveredImage} alt={item.name} className="" />
              </div>
              <div className="rounded-lg">
                <div className="text-sm pl-1">
                  {item.size ? (
                    <>
                      <strong>{localize('Size') + ':'}</strong> {item.size}
                    </>
                  ) : null}
                </div>
                <div className="text-sm pl-1">
                  {item.height ? (
                    <>
                      <strong>{localize('Height') + ':'}</strong> {item.height}
                    </>
                  ) : null}
                </div>
                <div className="text-sm pl-1">
                  {item.variations_info ? (
                    Object.values(Object.values(item.variations_info)[0])[0]?.colors?.length ? (
                      <>
                        <strong>{localize('Color') + ':'}</strong>{' '}
                        {Array.from(new Set(item.variations_info[hoveredVariation][hoveredPattern]?.colors ?? []))
                          .map((color) => localize(color))
                          .join(', ')}
                      </>
                    ) : (
                      ''
                    )
                  ) : item.colors?.length ? (
                    <>
                      <strong>{localize('Color') + ':'}</strong>{' '}
                      {Array.from(new Set(item?.colors ?? []))
                        .map((color) => localize(color))
                        .join(', ')}
                    </>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>
            <div className="w-[75%] pr-10 mt-5">
              {/* category and source */}
              <div className="rounded-lg bg-slate-100 px-3  pt-1 pb-1 shadow-sm mb-3">
                <div>
                  <strong>{localize('Category') + ':'}</strong> {localize(item.category)}{' '}
                </div>
                <div>
                  <strong>{localize('Source') + ':'}</strong> {item.source.map((s) => localize(s)).join(', ')}{' '}
                </div>
              </div>
              {/* Variation */}
              {
                !!item.variations_info ? (
                  <div className="rounded-lg bg-slate-100 px-3 pt-1 pb-2 shadow-sm mb-3 flex flex-col overflow-x-auto">
                    <div>
                      <strong>{localize('Variation') + ':'}</strong>{' '}
                      {hoveredVariation === 'null'
                        ? localize('None')
                        : lan === 'en'
                        ? hoveredVariation
                        : hoveredVarTranslation}{' '}
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
                            setHoveredVarTranslation(Object.values(value)[0].variantTranslations?.cNzh);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow"></div>
                ) /* Empty div to maintain space */
              }
              {/* Pattern */}
              {
                !!item.variations_info && Object.keys(Object.values(item.variations_info)[0]).length > 1 ? (
                  <div className="rounded-lg bg-slate-100 px-3  pt-1 pb-1 shadow-sm mb-3 flex flex-col overflow-x-auto">
                    <div>
                      <strong>{localize('Pattern') + ':'}</strong>{' '}
                      {hoveredPattern === 'null'
                        ? localize('None')
                        : lan === 'en'
                        ? hoveredPattern
                        : hoveredPaTranslation}{' '}
                    </div>
                    <div className="flex flex-row items-center">
                      {Object.entries(item.variations_info[hoveredVariation]).map(([key, value], index) => {
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
                              setHoveredPaTranslation(value.patternTranslations?.cNzh);
                            }}
                          />
                        );
                      })}
                    </div>
                    {item.sablePattern || item.customPattern ? (
                      <span className="ml-1 mt-1 flex">
                        {item.sablePattern && <span>✓{localize('Sable patterns')}</span>}
                        {item.sablePattern && item.customPattern && <span className="ml-5"></span>}
                        {item.customPattern && <span>✓{localize('Custom patterns')}</span>}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex-grow"></div>
                ) /* Empty div to maintain space */
              }
              {/* diy info */}
              {Object.keys(item?.recipe ?? {})?.length ? (
                <>
                  <div className="rounded-lg bg-slate-100 px-3 pt-1 pb-1 shadow-sm mb-3">
                    <div>
                      <strong>{localize('DIY Materials') + ': '}</strong>
                      <span>
                        {'(' +
                          localize('Recipe source') +
                          ' - ' +
                          item.recipe.source.map((s) => localize(s)).join(', ') +
                          ')'}
                      </span>
                      {Object.entries(item.diy_info).map(([key, value]) => (
                        <div className="flex items-center" key={key}>
                          <img className={`object-contain h-6 mx-1 rounded`} src={value.inventoryImage} />
                          {value.amount}x {lan === 'en' ? key : value.translations.cNzh}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                ''
              )}
              {/* customization info */}
              {item.variations ? (
                <>
                  <div className="rounded-lg bg-slate-100 px-3  pt-1 pb-1 shadow-sm mb-3">
                    <strong>{localize('Customization') + ':'} </strong>
                    <div className="flex items-center">
                      {item.kitCost && (
                        <>
                          <img className={`object-contain h-6 mx-1 rounded`} src={kit['Normal']} />
                          {item.kitCost}x {localize('customization kit')}
                          {Object.keys(item.variations_info).length > 1 &&
                            !item.bodyCustomize &&
                            ' - ' + localize('patterns only')}
                        </>
                      )}
                    </div>
                    <div className="flex items-center">
                      <img className={`object-contain h-6 mx-1 rounded`} src={kit['Cyrus']} />
                      {localize('Cyrus') + ':'} <img className={`object-contain h-6 rounded`} src={kit['Bell']} />
                      {item.variations[0].cyrusCustomizePrice} {localize('bells')}
                    </div>
                  </div>
                </>
              ) : (
                ''
              )}
              {/* interaction, surface, series */}
              {lastDiv && (
                <>
                  <div className="rounded-lg bg-slate-100 px-3 py-1 shadow-sm mb-2">
                    {item.surface ??
                      ((item.variations ? item.variations[0].surface : false) && (
                        <div>
                          {(item?.surface ?? (item.variations ? item.variations[0].surface : false) === true) && (
                            <strong>{localize('Has surface')}</strong>
                          )}
                        </div>
                      ))}
                    {item.interact && (
                      <div>
                        <strong>{localize('Interaction Type') + ':'}</strong>{' '}
                        {localize(item.interact === true && 'Other')} {localize(!item.interact && 'False')}{' '}
                        {localize(typeof item.interact === 'string' && item.interact)}{' '}
                      </div>
                    )}
                    {item.lightingType && (
                      <>
                        <div>
                          <strong>{localize('Lighting Type') + ':'}</strong>{' '}
                          {UpFirstLetter(localize(item.lightingType))}
                        </div>
                      </>
                    )}
                    {item.speakerType && (
                      <>
                        <div>
                          <strong>{localize('Album Player Type') + ':'}</strong>{' '}
                          {UpFirstLetter(localize(item.speakerType))}
                        </div>
                      </>
                    )}
                    {item.series && (
                      <>
                        <div>
                          <strong>{localize('Series') + ':'}</strong>
                          {
                            <span
                              className="cursor-pointer px-1 rounded bg-slate-200 hover:bg-slate-300 hover:text-blue-600 visited:text-purple-600"
                              onClick={() => {
                                setSearchBar(''); // clear out search bar value
                                setShowFilters(false);
                                const updatedQuery = {
                                  series: item.series,
                                  page: 1,
                                };
                                router.push({ query: updatedQuery }, undefined, { shallow: true });
                                closeModal();
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              #{UpFirstLetter(localize(item.series))}
                            </span>
                          }
                        </div>
                      </>
                    )}
                    {(findKeyByValue(tags, item.tag) || (item.concepts?.length ?? 0) > 0) && (
                      <>
                        <div>
                          <strong>{localize('Keyword') + ':'}</strong>{' '}
                          {findKeyByValue(tags, item.tag) && (
                            <span
                              className="cursor-pointer px-1 rounded bg-slate-200 hover:bg-slate-300 hover:text-blue-600 visited:text-purple-600"
                              onClick={() => {
                                setSearchBar(''); // clear out search bar value
                                setShowFilters(false);
                                const updatedQuery = {
                                  tag: findKeyByValue(tags, item.tag), // only filter on tag
                                  page: 1,
                                };
                                router.push({ query: updatedQuery }, undefined, { shallow: true });
                                closeModal();
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              #{localize(findKeyByValue(tags, item.tag))}
                            </span>
                          )}
                          {findKeyByValue(tags, item.tag) && (item.concepts?.length ?? 0) > 0 && ', '}
                          {(item.concepts?.length ?? 0) > 0 &&
                            item.concepts.map((concept, index) => (
                              <React.Fragment key={index}>
                                {index > 0 && ', '}
                                <span
                                  className="cursor-pointer px-1 rounded bg-slate-200 hover:bg-slate-300 hover:text-blue-600 visited:text-purple-600"
                                  onClick={() => {
                                    //concept
                                    setSearchBar(''); // clear out search bar value
                                    setShowFilters(false);
                                    const updatedQuery = {
                                      concept: concept, // only filter on concept
                                      page: 1,
                                    };
                                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                                    closeModal();
                                  }}
                                  role="button"
                                  tabIndex={0}
                                >
                                  #{UpFirstLetter(localize(concept))}
                                </span>
                              </React.Fragment>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
              {/* Additional content can be placed here */}
              <div className="pl-1 text-sm text-slate-400 mb-3">
                {item.url ? (
                  <>
                    <span>{'* ' + localize("More details on the item's")}</span>{' '}
                    <a
                      className="text-amber-400 hover:text-amber-500"
                      href={item.url.replace('?', '%3F')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {localize('Nookipedia Page')}
                    </a>
                  </>
                ) : null}
              </div>
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
  const UpFirstLetter = (word) => {
    return lan === 'en' ? word.charAt(0).toUpperCase() + word.slice(1) : word;
  };
  const findKeyByValue = (tags, valueToFind) => {
    for (let [key, values] of Object.entries(tags)) {
      if (values.includes(valueToFind)) {
        return key;
      }
    }
    return null; // or a default value or an empty string if you prefer
  };

  return (
    <main className={`flex min-h-screen flex-col items-center p-24 gap-6 bg-yellow-100 font-nunito text-slate-500`}>
      <div className="text-4xl absolute top-0 left-0 p-3 m-3 font-black font-finkheavy image-filled-text">
        ACNH Item Search
      </div>
      <div className="absolute top-0 right-0 p-3 m-3">
        <div className="flex">
          <button
            onClick={() => setLan('en')}
            className={classNames('w-9 h-6 mx-1 rounded hover:bg-amber-200', lan === 'en' && 'bg-amber-200')}
          >
            ENG
          </button>
          |
          <button
            onClick={() => setLan('cn')}
            className={classNames('w-9 h-6 mx-1 rounded hover:bg-amber-200', lan === 'cn' && 'bg-amber-200')}
          >
            中文
          </button>
        </div>
      </div>
      <div className="flex flex-col w-full relative">
        {' '}
        {/* parent container for categories, toggle filters, text search*/}
        <div className="flex w-full my-3 gap-2 items-center">
          <button
            onClick={() => {
              setSearchBar(''); // clear out search bar value
              setShowFilters(false);
              router.push({}, undefined, { shallow: true });
            }}
            className="w-20 px-1 py-2 hover:bg-amber-300 border border-2 text-slate-500  border-slate-500 rounded"
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
                className="rounded-lg border bg-white px-4 py-3 placeholder:text-neutral-500 w-full"
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
          {Object.keys(categories).map((category) => (
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
                `px-4 py-2 `,
                category === (searchParams.get('category') || 'All Categories')
                  ? 'bg-amber-300 text-slate-500'
                  : 'bg-white text-slate-500 hover:bg-amber-300',
                lan === 'en' ? 'rounded' : 'rounded-lg',
                category === 'All Categories' ? 'font-extrabold' : '',
              )}
            >
              {localize(category)}
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
            {localize('More Filters')}
          </button>
          {showFilters && (
            <div className="px-5 h-72 overflow-y-auto bg-amber-200 bg-opacity-60 rounded-lg">
              {' '}
              {/* tag start */}
              <div className="mt-3 mb-4">
                <div className="flex items-center cursor-pointer mb-5">
                  {/* surface checkbox */}
                  <span className="mr-1">{localize('Has surface') + ':'} </span>
                  <div
                    onClick={() => {
                      var surface = searchParams.get('surface');
                      surface = surface === 'True' ? 'False' : surface === 'False' ? '' : 'True';
                      const updatedQuery = {
                        ...Object.fromEntries(searchParams.entries()), // current query params
                        surface: surface,
                        page: 1,
                      };
                      router.push({ query: updatedQuery }, undefined, { shallow: true });
                    }}
                    className={`mr-7 p-2 w-6 h-6 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                  >
                    {searchParams.get('surface') === 'True' ? '✓' : searchParams.get('surface') === 'False' ? '✗' : ''}
                  </div>
                  {/* body variants checkbox */}
                  <span className="mr-1">{localize('Base variants') + ':'} </span>
                  <div
                    onClick={() => {
                      var body = searchParams.get('body');
                      body = body === 'True' ? 'False' : body === 'False' ? '' : 'True';
                      const updatedQuery = {
                        ...Object.fromEntries(searchParams.entries()), // current query params
                        body: body,
                        page: 1,
                      };
                      router.push({ query: updatedQuery }, undefined, { shallow: true });
                    }}
                    className={`mr-7 p-2 w-6 h-6 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                  >
                    {searchParams.get('body') === 'True' ? '✓' : searchParams.get('body') === 'False' ? '✗' : ''}
                  </div>
                  {/* pattern checkbox */}
                  <span className="mr-1">{localize('Pattern variants') + ':'} </span>
                  <div
                    onClick={() => {
                      var pattern = searchParams.get('pattern');
                      pattern = pattern === 'True' ? 'False' : pattern === 'False' ? '' : 'True';
                      const updatedQuery = {
                        ...Object.fromEntries(searchParams.entries()), // current query params
                        pattern: pattern,
                        page: 1,
                      };
                      router.push({ query: updatedQuery }, undefined, { shallow: true });
                    }}
                    className={`mr-7 p-2 w-6 h-6 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                  >
                    {searchParams.get('pattern') === 'True' ? '✓' : searchParams.get('pattern') === 'False' ? '✗' : ''}
                  </div>
                  {/* custom pattern checkbox */}
                  <span className="mr-1">{localize('Custom patterns') + ':'} </span>
                  <div
                    onClick={() => {
                      var custom = searchParams.get('custom');
                      custom = custom === 'True' ? 'False' : custom === 'False' ? '' : 'True';
                      const updatedQuery = {
                        ...Object.fromEntries(searchParams.entries()), // current query params
                        custom: custom,
                        page: 1,
                      };
                      router.push({ query: updatedQuery }, undefined, { shallow: true });
                    }}
                    className={`mr-7 p-2 w-6 h-6 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                  >
                    {searchParams.get('custom') === 'True' ? '✓' : searchParams.get('custom') === 'False' ? '✗' : ''}
                  </div>
                  {/* sable pattern checkbox */}
                  <span className="mr-1">{localize('Sable patterns') + ':'} </span>
                  <div
                    onClick={() => {
                      var sable = searchParams.get('sable');
                      sable = sable === 'True' ? 'False' : sable === 'False' ? '' : 'True';
                      const updatedQuery = {
                        ...Object.fromEntries(searchParams.entries()), // current query params
                        sable: sable,
                        page: 1,
                      };
                      router.push({ query: updatedQuery }, undefined, { shallow: true });
                    }}
                    className={`mr-7 p-2 w-6 h-6 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                  >
                    {searchParams.get('sable') === 'True' ? '✓' : searchParams.get('sable') === 'False' ? '✗' : ''}
                  </div>
                </div>
                <div className="mb-1 text-base">{localize('Function/Theme') + ':'}</div>
                <button
                  onClick={() => {
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()), // current query params
                      tag: '', // empty tag
                      page: 1,
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                  className={classNames(
                    'px-3 py-1 mr-2 mb-1 rounded',
                    '' === (searchParams?.get('tag') ?? '')
                      ? 'bg-amber-300 text-slate-500'
                      : 'bg-white text-slate-500 hover:bg-amber-300',
                  )}
                >
                  X
                </button>
                {Object.keys(tags).map((tag) => (
                  <TagFilters tagName={tag} key={tag} />
                ))}
              </div>
              {/* tag end */}
              {/* size start */}
              <div className="mb-4">
                <div className="mb-1 text-base">{localize('Size') + ':'}</div>
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
                    'px-3 py-1 mr-2 mb-1 rounded',
                    '' === (searchParams?.get('size') ?? '')
                      ? 'bg-amber-300 text-slate-500'
                      : 'bg-white text-slate-500 hover:bg-amber-300',
                  )}
                >
                  X
                </button>
                {sizes.map((size) => (
                  <SizeFilters size={size} key={size} />
                ))}
              </div>
              {/* size end */}
              {/* height start */}
              <div className="mb-1 text-base">{localize('Height') + ':'}</div>
              <div className="mb-4 flex">
                <button
                  onClick={() => {
                    const updatedQuery = {
                      ...Object.fromEntries(
                        Array.from(searchParams.entries()).filter(([k, v]) => k !== 'minHeight' && k !== 'maxHeight'),
                      ),
                      page: 1,
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                  className={classNames(
                    'px-3 py-1 mr-2 mb-1 rounded',
                    '' === (searchParams?.get('minHeight') ?? ('' || (searchParams.get('maxHeight') ?? '')))
                      ? 'bg-amber-300 text-slate-500'
                      : 'bg-white text-slate-500 hover:bg-amber-300',
                  )}
                >
                  X
                </button>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()), // current query params
                      minHeight: minHeight, // updated minHeight
                      maxHeight: maxHeight, // updated maxHeight
                      page: 1,
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                >
                  <label className="text-base">{localize('Min Height') + ':'} </label>
                  <input
                    className="mr-2 w-16 h-7 rounded text-sm"
                    name="minHeight"
                    type="number"
                    value={minHeight}
                    onChange={(e) => {
                      setMinHeight(e.target.value);
                    }}
                  />
                </form>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()), // current query params
                      minHeight: minHeight, // updated minHeight
                      maxHeight: maxHeight, // updated maxHeight
                      page: 1,
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                >
                  <label className="text-base">{localize('Max Height') + ':'}</label>
                  <input
                    className="mr-2 w-16 h-7 rounded text-sm"
                    name="maxHeight"
                    type="number"
                    value={maxHeight}
                    onChange={(e) => {
                      setMaxHeight(e.target.value);
                    }}
                  />
                </form>
                <span>{localize("* The player's height in the game is 15.")}</span>
              </div>{' '}
              {/* height end */}
              {/* color start */}
              <div className="mb-4">
                {' '}
                <div className="mb-1 text-base">{localize('Color') + ':'}</div>
                <button
                  onClick={() => {
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
                {Object.keys(colors_object).map((color) => (
                  <ColorFilters color={color} key={color} />
                ))}
              </div>{' '}
              {/* color end */}
              {/* interact start */}
              <div className="mb-4">
                {' '}
                <div className="mb-1 text-base">{localize('Interaction Type') + ':'}</div>{' '}
                <button
                  onClick={() => {
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
                {Object.keys(interactTypes).map((interact) => (
                  <InteractFilters interact={interact} key={interact} />
                ))}
              </div>{' '}
              {/* interact end */}
              <div>
                {/* sources drop-down */}
                <div className="mb-1 text-base">{localize('Other Filters') + ':'}</div>{' '}
                <div className="flex flex-wrap">
                  <div className="relative mr-2 mb-2 ">
                    <select
                      value={moreFilters['source']}
                      onChange={(e) => {
                        const updatedQuery = {
                          ...Object.fromEntries(searchParams.entries()), // current query params
                          source: e.target.value,
                          page: 1,
                        };
                        router.push({ query: updatedQuery }, undefined, { shallow: true });
                      }}
                      className={classNames(
                        `form-select p-1 pl-7 rounded text-amber-500 border border-amber-500 w-[21rem]`,
                        searchParams.get('source') && 'text-slate-500 bg-amber-200',
                      )}
                    >
                      <option value="">{localize('Source') + ':'}</option>
                      {Object.keys(sources).map((s) => {
                        if (sources[s] === 'divider') {
                          return (
                            <option key={s} disabled>
                              ──────────
                            </option>
                          );
                        }
                        return (
                          <option key={s} value={s}>
                            {localize('Source') + ':'} {UpFirstLetter(localize(s))}
                          </option>
                        );
                      })}
                    </select>
                    {searchParams.get('source') && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()),
                            source: '',
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-50 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        -
                      </button>
                    )}
                  </div>
                  {/* seasonal drop-down */}
                  <div className="relative mr-2 mb-2 ">
                    <select
                      value={moreFilters['season']}
                      onChange={(e) => {
                        const updatedQuery = {
                          ...Object.fromEntries(searchParams.entries()), // current query params
                          season: e.target.value,
                          page: 1,
                        };
                        router.push({ query: updatedQuery }, undefined, { shallow: true });
                      }}
                      className={classNames(
                        `form-select p-1 pl-7 rounded text-amber-500 border border-amber-500 w-[21rem]`,
                        searchParams.get('season') && 'text-slate-500 bg-amber-200',
                      )}
                    >
                      <option value="">{localize('Seasonal') + ':'}</option>
                      {Object.keys(seasonals).map((s) => {
                        if (seasonals[s] === 'divider') {
                          return (
                            <option key={s} disabled>
                              ──────────
                            </option>
                          );
                        }
                        return (
                          <option key={s} value={s}>
                            {localize('Seasonal') + ':'} {UpFirstLetter(localize(s))}
                          </option>
                        );
                      })}
                    </select>
                    {searchParams.get('season') && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()),
                            season: '',
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-50 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        -
                      </button>
                    )}
                  </div>
                  {/* series drop-down */}
                  <div className="relative mr-2 mb-2 ">
                    <select
                      value={moreFilters['series']}
                      onChange={(e) => {
                        const updatedQuery = {
                          ...Object.fromEntries(searchParams.entries()), // current query params
                          series: e.target.value,
                          page: 1,
                        };
                        router.push({ query: updatedQuery }, undefined, { shallow: true });
                      }}
                      className={classNames(
                        `form-select p-1 pl-7 rounded text-amber-500 border border-amber-500 w-[21rem]`,
                        searchParams.get('series') && 'text-slate-500 bg-amber-200',
                      )}
                    >
                      <option value="">{localize('Series') + ':'}</option>
                      {Object.keys(series_list).map((series) => {
                        if (series_list[series] === 'divider') {
                          return (
                            <option key={series} disabled>
                              ──────────
                            </option>
                          );
                        }
                        return (
                          <option key={series} value={series}>
                            {localize('Series') + ':'} {UpFirstLetter(localize(series))}
                          </option>
                        );
                      })}
                    </select>
                    {searchParams.get('series') && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()),
                            series: '',
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-50 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        -
                      </button>
                    )}
                  </div>
                  {/* concept drop-down */}
                  <div className="relative mr-2 mb-2 ">
                    <select
                      value={moreFilters['concept']}
                      onChange={(e) => {
                        const updatedQuery = {
                          ...Object.fromEntries(searchParams.entries()), // current query params
                          concept: e.target.value,
                          page: 1,
                        };
                        router.push({ query: updatedQuery }, undefined, { shallow: true });
                      }}
                      className={classNames(
                        `form-select p-1 pl-7 rounded text-amber-500 border border-amber-500 w-[21rem]`,
                        searchParams.get('concept') && 'text-slate-500 bg-amber-200',
                      )}
                    >
                      <option value="">{localize('Concept') + ':'}</option>
                      {Object.keys(concepts).map((s) => {
                        if (concepts[s] === 'divider') {
                          return (
                            <option key={s} disabled>
                              ──────────
                            </option>
                          );
                        }
                        return (
                          <option key={s} value={s}>
                            {localize('Concept') + ':'} {UpFirstLetter(localize(s))}
                          </option>
                        );
                      })}
                    </select>
                    {searchParams.get('concept') && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()),
                            concept: '',
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-50 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        -
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                {/* lighting type drop-down */}
                <div className="flex flex-wrap">
                  <div className="relative mr-2 mb-2 ">
                    <select
                      value={moreFilters['lightingType']}
                      onChange={(e) => {
                        const updatedQuery = {
                          ...Object.fromEntries(searchParams.entries()), // current query params
                          lightingType: e.target.value,
                          page: 1,
                        };
                        router.push({ query: updatedQuery }, undefined, { shallow: true });
                      }}
                      className={classNames(
                        `form-select p-1 pl-7 rounded text-amber-500 border border-amber-500 w-[16rem]`,
                        searchParams.get('lightingType') && 'text-slate-500 bg-amber-200',
                      )}
                    >
                      <option value="">{localize('Lighting Type') + ':'}</option>
                      {Object.keys(lightings).map((l) => (
                        <option key={l} value={l}>
                          {localize('Lighting') + ': ' + localize(l)}
                        </option>
                      ))}
                    </select>
                    {searchParams.get('lightingType') && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()),
                            lightingType: '',
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-50 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        -
                      </button>
                    )}
                  </div>
                  {/* speaker type drop-down */}
                  <div className="relative mr-2 mb-2 ">
                    <select
                      value={moreFilters['speakerType']}
                      onChange={(e) => {
                        const updatedQuery = {
                          ...Object.fromEntries(searchParams.entries()), // current query params
                          speakerType: e.target.value,
                          page: 1,
                        };
                        router.push({ query: updatedQuery }, undefined, { shallow: true });
                      }}
                      className={classNames(
                        `form-select p-1 pl-7 rounded text-amber-500 border border-amber-500 w-[16rem]`,
                        searchParams.get('speakerType') && 'text-slate-500 bg-amber-200',
                      )}
                    >
                      <option value="">{localize('Album Player Type') + ':'}</option>
                      {Object.keys(album_players).map((player) => (
                        <option key={player} value={player}>
                          {localize('Album Player') + ': ' + localize(player)}
                        </option>
                      ))}
                    </select>
                    {searchParams.get('speakerType') && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()),
                            speakerType: '',
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-50 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        -
                      </button>
                    )}
                  </div>
                  {/* rugs drop-down */}
                  <div className="relative mr-2 mb-2 ">
                    <select
                      value={moreFilters['rug']}
                      onChange={(e) => {
                        const updatedQuery = {
                          ...Object.fromEntries(searchParams.entries()), // current query params
                          rug: e.target.value,
                          page: 1,
                        };
                        router.push({ query: updatedQuery }, undefined, { shallow: true });
                      }}
                      className={classNames(
                        `form-select p-1 pl-7 rounded text-amber-500 border border-amber-500 w-[16rem]`,
                        searchParams.get('rug') && 'text-slate-500 bg-amber-200',
                      )}
                    >
                      <option value="">{localize('Rug Filter') + ':'}</option>
                      {Object.keys(rugs).map((s) => {
                        if (rugs[s] === 'divider') {
                          return (
                            <option key={s} disabled>
                              ──────────
                            </option>
                          );
                        }
                        return (
                          <option key={s} value={s}>
                            {localize('Rug') + ':'} {UpFirstLetter(localize(s))}
                          </option>
                        );
                      })}
                    </select>
                    {searchParams.get('rug') && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()),
                            rug: '',
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-50 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        -
                      </button>
                    )}
                  </div>
                </div>
              </div>
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
          <div className="flex-grow pl-1">
            {isLoading ? (
              '...'
            ) : data?.page_info?.total_count ? (
              <>
                {40 * ((searchParams?.get('page') ?? 1) - 1) + 1}-
                {Math.min(40 * (searchParams?.get('page') ?? 1), data.page_info.total_count)}
                {lan === 'en' ? ' of' : '项,'} {lan === 'en' ? '' : '共'}
                {data.page_info.total_count}
                {lan === 'en' ? ' Items' : '项'}
              </>
            ) : (
              'No result ... :('
            )}
          </div>
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
