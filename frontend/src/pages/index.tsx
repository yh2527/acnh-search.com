import classNames from 'classnames';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ReactGA from 'react-ga';

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
  clothingThemes,
  clothingStyles,
  clothingTypes,
  kit,
  seasonEvent_value,
  translation,
} from '../lists';

interface Item {
  name: string;
  patternCustomize: string;
  kitCost: number;
  kitType: string;
  cyrusCustomizePrice: number;
  size: string[];
  buy: number;
  exchangePrice: number;
  exchangeCurrency: string;
  interact: boolean;
  tag: string;
  speakerType: string;
  lightingType: string;
  bodyCustomize: boolean;
  source: string[];
  translations: {
    sourceSheet: string;
    id: number;
    plural: boolean;
  } & Record<string, string>;
  colors: string[];
  concepts: string[];
  series: string;
  seasonEvent: string;
  surface: boolean;
  height: number;
  category: string;
  sourceSheet: string;
  url: string;
  sablePattern: boolean;
  customPattern: boolean;
  image: string;
  diy_info: {
    source: string[];
    materials: Record<string, any>;
  };
  variations_info: Record<
    string,
    Record<
      string,
      {
        image: string;
        colors: string[];
        variantTranslations: Record<string, any>;
        patternTranslations: Record<string, any>;
      }
    >
  >;
  villagerEquippable: boolean;
  themes: string[];
  styles: string[];
}

interface ApiResponse {
  result: Item[];
  page_info: {
    total_count: number;
    max_page: number;
  };
}

interface ItemCardProps {
  item: Item;
  lan: string;
  hasVariations: (item: Item) => boolean;
  isVariationCollected: (item: Item, vKey: string, pKey: string) => boolean;
  isCollected: (item: Item) => boolean;
  toggleInventory: (item: Item, varKey?: string, patKey?: string) => void;
  openModal: (params: { item: Item }) => void;
}

interface ModalProps {
  item: Item;
  onClose: () => void;
  lan: string;
  localize: (eng: string) => string;
  UpFirstLetter: (word: string) => string;
  findKeyByValue: (tags: Record<string, string[]>, valueToFind: string) => string | null;
  isCollected: (item: Item) => boolean;
  isPartiallyCollected: (item: Item) => boolean;
  isVariationCollected: (item: Item, vKey: string, pKey: string) => boolean;
  hasVariations: (item: Item) => boolean;
  toggleInventory: (item: Item, varKey?: string, patKey?: string) => void;
  toggleAllVariations: (item: Item) => void;
  collectedVariationCount: (item: Item) => number;
  totalVariationCount: (item: Item) => number;
  onFilterNavigate: (query: Record<string, any>) => void;
}

const ItemCard = ({ item, lan, hasVariations, isVariationCollected, isCollected, toggleInventory, openModal }: ItemCardProps) => {
  const defaultVKey = item.variations_info ? Object.keys(item.variations_info)[0] : '';
  const defaultPKey = item.variations_info ? Object.keys(Object.values(item.variations_info)[0])[0] : '';
  const defaultColorLabel = item.variations_info
    ? (lan === 'en'
        ? (defaultVKey === 'null' ? '' : defaultVKey) +
          (defaultVKey === 'null' || defaultPKey === 'null' ? '' : ': ') +
          (defaultPKey === 'null' ? '' : defaultPKey)
        : (Object.values(Object.values(item.variations_info)[0])[0]?.variantTranslations?.cNzh ?? '') +
          (Object.values(Object.values(item.variations_info)[0])[0]?.variantTranslations?.cNzh &&
           Object.values(Object.values(item.variations_info)[0])[0]?.patternTranslations?.cNzh ? ': ' : '') +
          (Object.values(Object.values(item.variations_info)[0])[0]?.patternTranslations?.cNzh ?? ''))
    : '';

  // "Selected" = last clicked thumbnail (persistent)
  const [selectedImage, setSelectedImage] = React.useState(item.image);
  const [selectedVKey, setSelectedVKey] = React.useState(defaultVKey);
  const [selectedPKey, setSelectedPKey] = React.useState(defaultPKey);
  const [selectedColor, setSelectedColor] = React.useState(defaultColorLabel);

  // "Display" = what's currently shown (hover overrides, reverts to selected on mouse leave)
  const [displayImage, setDisplayImage] = React.useState(item.image);
  const [displayVKey, setDisplayVKey] = React.useState(defaultVKey);
  const [displayPKey, setDisplayPKey] = React.useState(defaultPKey);
  const [displayColor, setDisplayColor] = React.useState(defaultColorLabel);

  const getColorLabel = (vKey: string, pKey: string, pValue: any) =>
    lan === 'en'
      ? (vKey === 'null' ? '' : vKey) +
          (vKey === 'null' || pKey === 'null' ? '' : ': ') +
          (pKey === 'null' ? '' : pKey)
      : (pValue.variantTranslations?.cNzh ?? '') +
          (pValue.variantTranslations?.cNzh && pValue.patternTranslations?.cNzh ? ': ' : '') +
          (pValue.patternTranslations?.cNzh ?? '');

  const currentVarCollected = hasVariations(item) && displayVKey && displayPKey
    ? isVariationCollected(item, displayVKey, displayPKey)
    : isCollected(item);
  return (
    <div
      className={classNames(
        'relative px-2 pt-4 flex flex-col items-center overflow-x-hidden rounded-lg',
        isCollected(item) ? 'bg-amber-200 border-2 border-amber-400' : 'bg-slate-50 border-2 border-transparent shadow-md',
      )}
      onClick={() => openModal({ item })}
    >
      <div
        className={classNames(
          'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-sm',
          currentVarCollected
            ? 'bg-green-500 text-white'
            : 'bg-white border border-slate-200 text-slate-200 hover:border-green-300 hover:text-green-300',
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (hasVariations(item) && displayVKey && displayPKey) {
            toggleInventory(item, displayVKey, displayPKey);
          } else {
            toggleInventory(item);
          }
        }}
        title={currentVarCollected ? 'Remove from catalog' : 'Add to catalog'}
      >
        {currentVarCollected ? '✓' : ''}
      </div>
      <h3 className="text-center text-lg font-semibold h-auto md:h-10 px-5 capitalize">
        {lan === 'en' ? item.name : item.translations?.cNzh ?? item.name}
      </h3>
      <div className="flex items-center justify-center w-50 h-40">
        <img
          className="w-auto h-auto max-w-full h-auto"
          src={displayImage}
          alt={lan === 'en' ? item.name : item.translations?.cNzh ?? item.name}
        />
      </div>
      <div
        className="flex flex-row overflow-x-auto items-center h-auto scrollbar-thin mx-4"
        onMouseLeave={() => {
          setDisplayImage(selectedImage);
          setDisplayVKey(selectedVKey);
          setDisplayPKey(selectedPKey);
          setDisplayColor(selectedColor);
        }}
      >
        {item.variations_info &&
          Object.entries(item.variations_info).map(([vKey, vValue], index) =>
            Object.entries(vValue).map(([pKey, pValue], i) => (
              <div
                key={`${index}-${i}`}
                className="relative flex-shrink-0 cursor-pointer"
                onMouseEnter={() => {
                  const label = getColorLabel(vKey, pKey, pValue);
                  setDisplayImage(pValue.image);
                  setDisplayVKey(vKey);
                  setDisplayPKey(pKey);
                  setDisplayColor(label);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const label = getColorLabel(vKey, pKey, pValue);
                  setSelectedImage(pValue.image);
                  setSelectedVKey(vKey);
                  setSelectedPKey(pKey);
                  setSelectedColor(label);
                  setDisplayImage(pValue.image);
                  setDisplayVKey(vKey);
                  setDisplayPKey(pKey);
                  setDisplayColor(label);
                }}
              >
                <img
                  className={classNames(
                    'object-contain w-9 h-9 rounded',
                    selectedVKey === vKey && selectedPKey === pKey
                      ? isVariationCollected(item, vKey, pKey) ? 'bg-amber-300' : 'bg-slate-200'
                      : isVariationCollected(item, vKey, pKey)
                      ? 'bg-amber-200'
                      : '',
                  )}
                  src={pValue.image}
                  alt={`${item.name} variation ${index} pattern ${i}`}
                />
              </div>
            )),
          )}
      </div>
      <h3 className="text-sm font-semibold mb-4 pt-2 h-5">{displayColor}</h3>
    </div>
  );
};

const Modal: React.FC<ModalProps> = ({ item, onClose, lan, localize, UpFirstLetter, findKeyByValue, isCollected, isPartiallyCollected, isVariationCollected, hasVariations, toggleInventory, toggleAllVariations, collectedVariationCount, totalVariationCount, onFilterNavigate }) => {
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
      (item.surface ?? false) ||
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
    item.variations_info,
    item.series,
    item.tag,
    item.concepts,
    item.lightingType,
    item.speakerType,
  ]);

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
      style={{ backdropFilter: 'blur(5px)' }}
    >
      <div
        className={classNames(
          'rounded-lg w-auto pb-2 min-h-[270px] max-h-[90vh] max-w-[780px] box-sizing: border-box overflow-y-auto scrollbar-thin',
          isCollected(item) ? 'bg-white border-2 border-amber-400' : 'bg-white',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-amber-300 py-4 rounded-t-lg font-bold">
          {hasVariations(item) ? (
            <div
              className={classNames(
                'absolute left-3 top-1/2 transform -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer text-xs font-bold',
                isCollected(item)
                  ? 'bg-green-500 text-white px-2 py-1'
                  : isPartiallyCollected(item)
                  ? 'bg-amber-500 text-white px-2 py-1'
                  : 'w-7 h-7 bg-white border-2 border-slate-400 text-slate-400 hover:border-green-500 hover:text-green-500',
              )}
              onClick={() => toggleAllVariations(item)}
              title={isCollected(item) ? 'Uncollect all variations' : 'Collect all variations'}
            >
              {isCollected(item) ? '✓ All' : isPartiallyCollected(item) ? `${collectedVariationCount(item)}/${totalVariationCount(item)}` : ''}
            </div>
          ) : (
            <div
              className={classNames(
                'absolute left-3 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-sm',
                isCollected(item)
                  ? 'bg-green-500 text-white'
                  : 'bg-white border-2 border-slate-400 text-slate-400 hover:border-green-500 hover:text-green-500',
              )}
              onClick={() => toggleInventory(item)}
              title={isCollected(item) ? 'Remove from catalog' : 'Add to catalog'}
            >
              {isCollected(item) ? '✓' : ''}
            </div>
          )}
          <div className="text-xl text-center px-10">{lan === 'en' ? item.name : item.translations?.cNzh ?? item.name}</div>
          <button onClick={onClose} className="absolute inset-y-0 right-5 top-1/2 transform -translate-y-1/2 text-lg">
            &times;
          </button>
        </div>
        {/* Image(left) and Description(right) */}
        <div className="flex items-start justify-center">
          {/* Image, size, height, colors */}
          <div className="w-[120px] sm:w-[160px] px-1 sm:px-3 md:px-5 mt-3 mb-6">
            <div className="flex items-center justify-center w-full h-auto mb-3">
              <img src={hoveredImage} alt={item.name} />
            </div>
            {item.category !== 'Critters' && item.category !== 'Models' && (
              <>
                <div className="text-xs text-left pl-1">
                  <div>
                    {item.size ? (
                      <>
                        <span className="sm:font-bold">{localize('Size') + ':'}</span> {item.size}
                      </>
                    ) : null}
                  </div>
                  <div>
                    {item.height ? (
                      <>
                        <span className="sm:font-bold">{localize('Height') + ':'}</span> {item.height}
                      </>
                    ) : null}
                  </div>
                  <div className="">
                    {item.category === 'Fencing' ? (
                      ''
                    ) : item.variations_info ? (
                      Object.values(Object.values(item.variations_info)[0])[0]?.colors?.length ? (
                        <>
                          <span className="hidden sm:inline sm:font-bold">{localize('Color') + ': '}</span>
                          {(item.variations_info[hoveredVariation][hoveredPattern]?.colors ?? [])
                            .map((color) => localize(color))
                            .join(', ')}
                        </>
                      ) : (
                        ''
                      )
                    ) : item.colors?.length ? (
                      <>
                        <span className="hidden sm:inline sm:font-bold">{localize('Color') + ': '}</span>
                        {(item?.colors ?? []).map((color) => localize(color)).join(', ')}
                      </>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="pr-3 md:pr-10 mt-5">
            {(item.category === 'Critters' || item.category === 'Models') && (
              <>
                <div className="rounded-lg bg-slate-100 px-3  pt-1 pb-1 shadow-sm mb-3">
                  <div>
                    {item.size ? (
                      <>
                        <strong>{localize('Size') + ':'}</strong> {item.size}
                      </>
                    ) : null}
                  </div>
                  <div>
                    {item.height ? (
                      <>
                        <strong>{localize('Height') + ':'}</strong> {item.height}
                      </>
                    ) : null}
                  </div>
                  <div>
                    {item.colors?.length ? (
                      <>
                        <strong className="">{localize('Color') + ': '}</strong>
                        {(item?.colors ?? []).map((color) => localize(color)).join(', ')}
                      </>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </>
            )}
            {/* category and source */}
            <div className="rounded-lg bg-slate-100 px-3  pt-1 pb-1 shadow-sm mb-3">
              <div>
                <strong>{localize('Category') + ':'}</strong> {localize(item.category)}{' '}
              </div>
              <div>
                <strong>{localize('Source') + ':'}</strong> {item.source.map((s) => localize(s)).join(', ')}{' '}
              </div>
              {(item.buy > 0 || item.exchangeCurrency) && (
                <div className="flex items-center">
                  <strong>{localize('Price') + ':'}</strong>
                  {item.buy > 0 && (
                    <>
                      <img className={`object-contain h-6 ml-1 rounded`} src={kit['Bell']} alt="image of Bells Bag" />
                      {item.buy.toLocaleString()}
                      <span className="hidden sm:block sm:ml-1">{localize('Bells')}</span>
                    </>
                  )}
                  {item.exchangeCurrency && (
                    <>
                      <img
                        className={classNames(
                          'object-contain mx-1 rounded',
                          item.exchangeCurrency === 'Bells' ? 'h-6' : 'h-5 mr-1',
                          item.buy > 0 && 'ml-3',
                        )}
                        src={kit[item.exchangeCurrency]}
                        alt="image of Bells Bag"
                      />
                      {item.exchangePrice.toLocaleString()}
                      {item.exchangeCurrency === 'Heart Crystals' && '* '}
                      {item.exchangeCurrency !== 'Heart Crystals' && ' '}
                      {item.exchangeCurrency !== 'Poki' && localize(item.exchangeCurrency)}
                      <span className="hidden sm:block sm:ml-1">
                        {item.exchangeCurrency === 'Poki' && localize(item.exchangeCurrency)}
                      </span>
                    </>
                  )}
                </div>
              )}
              {item.seasonEvent && item.seasonEvent !== 'Super Mario Bros.' && (
                <>
                  <div>
                    <strong>{localize('Season Event') + ':'}</strong>{' '}
                    <React.Fragment>
                      <span
                        className="cursor-pointer px-1 rounded bg-slate-200 hover:bg-slate-300 hover:text-blue-600 visited:text-purple-600"
                        onClick={() => onFilterNavigate({ season: seasonEvent_value[item.seasonEvent], lan, page: 1 })}
                        role="button"
                        tabIndex={0}
                      >
                        #{UpFirstLetter(localize(seasonEvent_value[item.seasonEvent]))}
                      </span>
                    </React.Fragment>
                  </div>
                </>
              )}
            </div>
            {/* Variation */}
            {
              !!item.variations_info ? (
                <div
                  className={`rounded-lg bg-slate-100 px-3 pt-1 pb-2 shadow-sm mb-3 flex flex-col
                  ${Object.keys(item.variations_info).length === 8 ? '' : ''}`}
                >
                  <div>
                    <strong>{localize('Variation') + ':'}</strong>{' '}
                    {hoveredVariation === 'null'
                      ? localize('None')
                      : lan === 'en'
                      ? hoveredVariation
                      : hoveredVarTranslation}{' '}
                  </div>
                  <div className={`flex flex-row items-center overflow-x-auto scrollbar-thin`}>
                    {Object.entries(item.variations_info).map(([key, value], index) => {
                      const hasPatterns = Object.keys(value).length > 1;
                      const varCollected = hasPatterns
                        ? Object.keys(value).some(pKey => isVariationCollected(item, key, pKey))
                        : isVariationCollected(item, key, Object.keys(value)[0]);
                      const allPatternsCollected = hasPatterns
                        && Object.keys(value).every(pKey => isVariationCollected(item, key, pKey));
                      return (
                        <img
                          key={index}
                          className={classNames(
                            'object-contain h-14 mx-0.5 rounded',
                            hasPatterns ? '' : 'cursor-pointer',
                            hoveredVariation === key
                              ? varCollected ? 'bg-amber-300' : 'bg-slate-200'
                              : varCollected ? 'bg-amber-200' : '',
                            allPatternsCollected ? 'border border-amber-400' : '',
                          )}
                          src={Object.values(value)[0].image}
                          alt={`${item.name} variation ${index}`}
                          onMouseEnter={() => {
                            setHoveredImage(
                              hoveredPattern ? value[hoveredPattern]?.image : Object.values(value)[0].image,
                            );
                            setHoveredVariation(key);
                            setHoveredVarTranslation(Object.values(value)[0].variantTranslations?.cNzh);
                          }}
                          onClick={hasPatterns ? undefined : () => toggleInventory(item, key, Object.keys(value)[0])}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-grow"></div>
              )
            }
            {/* Pattern */}
            {
              !!item.variations_info && Object.keys(Object.values(item.variations_info)[0]).length > 1 ? (
                <div className="rounded-lg bg-slate-100 px-3  pt-1 pb-1 shadow-sm mb-3 flex flex-col">
                  <div>
                    <strong>{localize('Pattern') + ':'}</strong>{' '}
                    {hoveredPattern === 'null'
                      ? localize('None')
                      : lan === 'en'
                      ? hoveredPattern
                      : hoveredPaTranslation}{' '}
                  </div>
                  <div className="flex flex-row items-center overflow-x-auto scrollbar-thin">
                    {Object.entries(item.variations_info[hoveredVariation]).map(([key, value], index) => {
                      const patCollected = isVariationCollected(item, hoveredVariation, key);
                      return (
                        <img
                          key={index}
                          className={classNames(
                            'object-contain h-14 mx-1 rounded cursor-pointer',
                            hoveredPattern === key
                              ? patCollected ? 'bg-amber-300' : 'bg-slate-200'
                              : patCollected ? 'bg-amber-200' : '',
                          )}
                          src={value.image}
                          alt={`${item.name} pattern ${index}`}
                          onMouseEnter={() => {
                            setHoveredImage(value.image);
                            setHoveredPattern(key);
                            setHoveredPaTranslation(value.patternTranslations?.cNzh);
                          }}
                          onClick={() => toggleInventory(item, hoveredVariation, key)}
                        />
                      );
                    })}
                  </div>
                  {item.sablePattern || item.customPattern ? (
                    <span className="ml-1 mt-1 flex text-sm md:text-base">
                      {item.sablePattern && <span>✓{localize('Sable patterns')}</span>}
                      {item.sablePattern && item.customPattern && <span className="ml-5"></span>}
                      {item.customPattern && <span>✓{localize('Custom patterns')}</span>}
                    </span>
                  ) : null}
                </div>
              ) : (
                <div className="flex-grow"></div>
              )
            }
            {/* diy info */}
            {Object.keys(item?.diy_info ?? {})?.length ? (
              <>
                <div className="rounded-lg bg-slate-100 px-3 pt-1 pb-1 shadow-sm mb-3">
                  <div>
                    <strong>{localize('DIY Materials') + ': '}</strong>
                    <span className="text-sm md:text-base">
                      {'(' +
                        localize('Recipe source') +
                        ' - ' +
                        item.diy_info.source.map((s) => localize(s)).join(', ') +
                        ')'}
                    </span>
                    {Object.entries(item.diy_info.materials).map(([key, value]) => (
                      <div className="flex items-center" key={key}>
                        <img
                          className={`object-contain h-6 mx-1 rounded`}
                          src={value.inventoryImage}
                          alt="image of materials"
                        />
                        {lan === 'en'
                          ? value.amount + 'x ' + key
                          : key === '99,000 Bells'
                          ? value.amount + 'x ' + localize(key)
                          : key === '50,000 Bells' || key.includes('turnips')
                          ? localize(key)
                          : value.amount + 'x ' + value.translations.cNzh}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              ''
            )}
            {/* customization info */}
            {item.variations_info && item.category !== 'Equipments' ? (
              <>
                <div className="rounded-lg bg-slate-100 px-3  pt-1 pb-1 shadow-sm mb-3">
                  <strong>{localize('Customization') + ':'} </strong>
                  <div className="flex items-center">
                    {item.kitCost && (
                      <>
                        <img
                          className={`object-contain h-6 mx-1 rounded`}
                          src={kit[item.kitType]}
                          alt="image of customization kit"
                        />
                        {item.kitCost}x{' '}
                        {item.kitType === 'Normal' ? localize('customization kit') : localize(item.kitType)}
                        {Object.keys(item.variations_info).length > 1 &&
                          item.bodyCustomize === null &&
                          ' - ' + localize('patterns only')}
                      </>
                    )}
                  </div>
                  <div className="flex items-center">
                    <img className={`object-contain h-6 mx-1 rounded`} src={kit['Cyrus']} alt="image of Cyrus" />
                    {localize('Cyrus') + ':'}{' '}
                    <img className={`object-contain h-6 rounded`} src={kit['Bell']} alt="image of bell bag" />
                    {item.cyrusCustomizePrice} {localize('bells')}
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
                  {item.surface && (
                    <div>
                      <strong>{localize('Has surface')}</strong>
                    </div>
                  )}
                  {item.interact && (
                    <div>
                      <strong>{localize('Interaction Type') + ':'}</strong>{' '}
                      {localize(
                        item.interact === true
                          ? 'Other'
                          : typeof item.interact === 'string'
                          ? item.interact
                          : 'False',
                      )}{' '}
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
                        <strong>{localize('Series') + ':'}</strong>{' '}
                        {
                          <span
                            className="cursor-pointer px-1 rounded bg-slate-200 hover:bg-slate-300 hover:text-blue-600 visited:text-purple-600"
                            onClick={() => onFilterNavigate({ series: item.series, lan, page: 1 })}
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
                            onClick={() => onFilterNavigate({ tag: findKeyByValue(tags, item.tag), lan, page: 1 })}
                            role="button"
                            tabIndex={0}
                          >
                            #{localize(findKeyByValue(tags, item.tag) ?? '')}
                          </span>
                        )}
                        {findKeyByValue(tags, item.tag) && (item.concepts?.length ?? 0) > 0 && ', '}
                        {(item.concepts?.length ?? 0) > 0 &&
                          item.concepts.map((concept, index) => (
                            <React.Fragment key={index}>
                              {index > 0 && ', '}
                              <span
                                className="cursor-pointer px-1 rounded bg-slate-200 hover:bg-slate-300 hover:text-blue-600 visited:text-purple-600"
                                onClick={() => onFilterNavigate({ concept, lan, page: 1 })}
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
            {/* equipment info */}
            {item.category === 'Equipments' ? (
              <>
                <div className="rounded-lg bg-slate-100 px-3  pt-1 pb-1 shadow-sm mb-3">
                  <div>
                    <strong>{localize('Clothing Type') + ':'}</strong> {localize(item.sourceSheet)}{' '}
                  </div>
                  <div>
                    <strong>{localize('Villager Equippable') + ':'}</strong>{' '}
                    {item.villagerEquippable ? localize('True') : localize('False')}{' '}
                  </div>
                  {item.themes && (
                    <div>
                      <strong>{localize('Clothing Themes') + ':'}</strong>{' '}
                      {(item.themes?.length ?? 0) > 0 &&
                        item.themes.map((theme, index) => (
                          <React.Fragment key={index}>
                            {index > 0 && ', '}
                            <span
                              className="cursor-pointer px-1 rounded bg-slate-200 hover:bg-slate-300 hover:text-blue-600 visited:text-purple-600"
                              onClick={() => onFilterNavigate({ theme, lan, page: 1 })}
                              role="button"
                              tabIndex={0}
                            >
                              #{UpFirstLetter(localize(theme))}
                            </span>
                          </React.Fragment>
                        ))}
                    </div>
                  )}
                  {item.styles && (
                    <div>
                      <strong>{localize('Clothing Styles') + ':'}</strong>{' '}
                      {(item.styles?.length ?? 0) > 0 &&
                        item.styles.map((style, index) => (
                          <React.Fragment key={index}>
                            {index > 0 && ', '}
                            <span
                              className="cursor-pointer px-1 rounded bg-slate-200 hover:bg-slate-300 hover:text-blue-600 visited:text-purple-600"
                              onClick={() => onFilterNavigate({ style, lan, page: 1 })}
                              role="button"
                              tabIndex={0}
                            >
                              #{UpFirstLetter(localize(style))}
                            </span>
                          </React.Fragment>
                        ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              ''
            )}
            {/* Additional content can be placed here */}
            <div className="pl-1 text-xs text-slate-400 mb-3">
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
  const [inventory, setInventory] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('acnh-inventory');
        if (saved) return new Set(JSON.parse(saved));
      } catch {}
    }
    return new Set();
  });
  const [inventoryFilter, setInventoryFilter] = useState<'' | 'collected' | 'uncollected'>('');

  const saveInventory = (next: Set<string>) => {
    localStorage.setItem('acnh-inventory', JSON.stringify([...next]));
  };

  const getVariationKeys = (item: Item): string[] => {
    if (!item.variations_info) return [];
    const keys: string[] = [];
    for (const [vKey, vValue] of Object.entries(item.variations_info)) {
      for (const pKey of Object.keys(vValue)) {
        keys.push(`${item.name}|${item.sourceSheet}|${vKey}|${pKey}`);
      }
    }
    return keys;
  };

  const hasVariations = (item: Item) =>
    item.variations_info && Object.keys(item.variations_info).length > 0;

  // Toggle a single item (no variations) or a specific variation
  const toggleInventory = (item: Item, varKey?: string, patKey?: string) => {
    setInventory(prev => {
      const next = new Set(prev);
      if (hasVariations(item) && varKey !== undefined && patKey !== undefined) {
        const key = `${item.name}|${item.sourceSheet}|${varKey}|${patKey}`;
        if (next.has(key)) next.delete(key);
        else next.add(key);
      } else if (!hasVariations(item)) {
        const key = `${item.name}|${item.sourceSheet}`;
        if (next.has(key)) next.delete(key);
        else next.add(key);
      }
      saveInventory(next);
      return next;
    });
  };

  // Toggle all variations at once
  const toggleAllVariations = (item: Item) => {
    setInventory(prev => {
      const next = new Set(prev);
      const keys = getVariationKeys(item);
      const allCollected = keys.every(k => next.has(k));
      if (allCollected) {
        keys.forEach(k => next.delete(k));
      } else {
        keys.forEach(k => next.add(k));
      }
      saveInventory(next);
      return next;
    });
  };

  const isVariationCollected = (item: Item, varKey: string, patKey: string) =>
    inventory.has(`${item.name}|${item.sourceSheet}|${varKey}|${patKey}`);

  const collectedVariationCount = (item: Item): number =>
    getVariationKeys(item).filter(k => inventory.has(k)).length;

  const totalVariationCount = (item: Item): number =>
    getVariationKeys(item).length;

  // Item-level check: all variations collected, or simple item collected
  const isCollected = (item: Item) => {
    if (hasVariations(item)) {
      const keys = getVariationKeys(item);
      return keys.length > 0 && keys.every(k => inventory.has(k));
    }
    return inventory.has(`${item.name}|${item.sourceSheet}`);
  };

  // Partially collected: at least one variation but not all
  const isPartiallyCollected = (item: Item) => {
    if (!hasVariations(item)) return false;
    const keys = getVariationKeys(item);
    const count = keys.filter(k => inventory.has(k)).length;
    return count > 0 && count < keys.length;
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    ReactGA.initialize('G-F4NL1XYTXD');
    ReactGA.pageview(window.location.pathname + window.location.search);
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
  const isAnyFilterActive = () => {
    //const { minHeight, maxHeight, ...restOfFilters } = moreFilters;
    //const hasSpecialValues = minHeight === '0' && maxHeight === '40';
    //const areOthersEmpty = Object.values(restOfFilters).every((value) => value === '');
    //console.log('areOthersEmpty', areOthersEmpty);
    //return !(hasSpecialValues && areOthersEmpty);
    return Object.values(moreFilters).some((value) => value !== '');
  };

  const localize = (eng: string) => {
    const dateRangePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;
    if (dateRangePattern.test(eng)) {
      return eng;
    }
    return lan === 'en' ? eng : translation[eng];
  };

  const { isLoading, error, data } = useQuery<ApiResponse>({
    queryKey: ['searchCache', Array.from(searchParams.entries()), inventoryFilter],
    queryFn: async (): Promise<ApiResponse> => {
      const fetchAll = inventoryFilter !== '';
      const baseParams: Record<string, string> = {
        lan: searchParams.get('lan') ?? 'en',
        category: searchParams.get('category') ?? '',
        excludeClothing: searchParams.get('excludeClothing') ?? '',
        v3Only: searchParams.get('v3Only') ?? '',
        search: searchParams.get('textSearch') ?? '',
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
      };

      //const apiBase = `/api`;
      const apiBase = `http://localhost:8000`;

      if (fetchAll) {
        // Fetch all pages sequentially with limit=200 to avoid overloading server
        const batchSize = 200;
        const firstParams = new URLSearchParams({ ...baseParams, page: '1', limit: String(batchSize) });
        const firstResult = await fetch(`${apiBase}?${firstParams}`);
        const firstJson: ApiResponse = await firstResult.json();
        const allItems = [...firstJson.result];
        const totalCount = firstJson.page_info.total_count;

        if (totalCount > batchSize) {
          const totalPages = Math.ceil(totalCount / batchSize);
          for (let p = 2; p <= totalPages; p++) {
            const params = new URLSearchParams({ ...baseParams, page: String(p), limit: String(batchSize) });
            const res = await fetch(`${apiBase}?${params}`);
            const json: ApiResponse = await res.json();
            allItems.push(...json.result);
          }
        }

        return { result: allItems, page_info: { total_count: allItems.length, max_page: 1 } };
      }

      const newParams = new URLSearchParams({ ...baseParams, page: searchParams.get('page') ?? '1' });
      const result = await fetch(`${apiBase}?${newParams}`);
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
  const colorQuery = (color: string) => {
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
  };
  const ColorFilters = ({ color }: { color: string }) => {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          let colorStr = searchParams.get('colors') || '';
          let colorsSet = new Set(colorStr ? colorStr.split(',').map((c) => c.trim()) : []);
          colorsSet.has(color) ? colorsSet.delete(color) : colorsSet.add(color);
          console.log('ColorFilters', colorsSet);
          const updatedQuery = {
            ...Object.fromEntries(searchParams.entries()), // current query params
            page: 1,
            colors: Array.from(colorsSet).join(','),
          };
          router.push({ query: updatedQuery }, undefined, { shallow: true });
        }}
        className={classNames(
          `px-2 py-1 mr-1 m-w-[64px] sm:w-16 md:w-auto md:mr-2 mb-1 rounded text-sm md:text-base`,
          (searchParams?.get('colors') ?? '').split(',').includes(color)
            ? 'bg-amber-300 text-slate-500'
            : 'bg-white text-slate-500',
        )}
      >
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
          'text-xs sm:text-base text-slate-500 px-2 sm:px-3 py-1',
          currentPage === 1 ? 'text-yellow-100' : 'hover:bg-amber-300 transition text-slate-500',
        )}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        &lt;
      </button>
      {/* Dropdown for page selection */}
      <select
        value={currentPage}
        onChange={(e) => onPageChange(Number(e.target.value))}
        className="mx-1 px-1 rounded select-custom bg-white text-xs sm:text-base"
      >
        {[...Array(totalPages).keys()].map((_, index) => (
          <option key={index} value={index + 1}>
            {localize('Page')} {index + 1}
          </option>
        ))}
      </select>
      <button
        className={`text-xs sm:text-base text-slate-500 px-2 sm:px-3 py-1 ${
          currentPage === totalPages ? 'text-yellow-100' : 'hover:bg-amber-300 transition text-slate-500'
        }`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );

  const openModal = ({ item }: { item: Item }) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };
  const UpFirstLetter = (word: string) => {
    return lan === 'en' ? word.charAt(0).toUpperCase() + word.slice(1) : word;
  };
  const findKeyByValue = (tags: Record<string, string[]>, valueToFind: string) => {
    for (let [key, values] of Object.entries(tags)) {
      if (values.includes(valueToFind)) {
        return key;
      }
    }
    return null; // or a default value or an empty string if you prefer
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
            <div className="text-base xs:text-3xl md:text-4xl absolute top-0 left-0 xs:p-3 mt-3 ml-2 xs:mt-1 xs:ml-0 md:m-3 font-black font-finkheavy image-filled-text">
              ACNH Item Search
            </div>
            <div className="text-xs md:text-base xs:absolute xs:top-0 xs:right-0 mb-2 xs:mb-0 xs:p-3 xs:m-3 text-left">
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
                  setInventoryFilter('');
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
            {/* category buttons*/}
            <div className="flex flex-wrap gap-2 mb-5 hidden md:flex">
              {' '}
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
                    `px-2 md:px-4 py-1 lg:py-2 text-sm md:text-base`,
                    category === (searchParams.get('category') || 'All Categories')
                      ? 'bg-amber-300 text-slate-500'
                      : 'bg-white text-slate-500 hover:bg-amber-300',
                    lan === 'en' ? 'rounded' : 'rounded-lg',
                    category === 'All Categories' ? 'font-extrabold' : '',
                  )}
                >
                  {localize(category === 'Equipments' ? 'Clothing' : category)}
                </button>
              ))}
              {/* v3.0.0 checkbox */}
              <div className="flex items-center my-2 ml-2 text-sm gap-5">
                <div className="flex items-center">
                  <span className="mr-1">{'*' + localize('v3.0.0 items only') + ':'} </span>
                  <div
                    onClick={() => {
                      var v3Only = searchParams.get('v3Only');
                      v3Only = v3Only === 'True' ? '' : 'True';
                      const updatedQuery = {
                        ...Object.fromEntries(searchParams.entries()),
                        v3Only: v3Only,
                        page: 1,
                      };
                      router.push({ query: updatedQuery }, undefined, { shallow: true });
                    }}
                    className={`p-2 w-5 h-5 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                  >
                    {searchParams.get('v3Only') === 'True' ? '✗' : ''}
                  </div>
                </div>
              </div>
            </div>
            {/* Categories Dropdown for smaller screens */}
            <div className="relative mb-2 md:hidden">
              <select
                value={searchParams.get('category') ?? ''}
                onChange={(e) => {
                  const updatedQuery = {
                    ...Object.fromEntries(searchParams.entries()), // current query params
                    category: e.target.value === 'All Categories' ? '' : e.target.value, // updated category
                    page: 1,
                  };
                  router.push({ query: updatedQuery }, undefined, { shallow: true });
                }}
                className={classNames(
                  `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-full bg-white`,
                  searchParams.get('category') && 'text-slate-500 bg-amber-200',
                )}
              >
                {Object.keys(categories).map((s) => {
                  return (
                    <option key={s} value={s}>
                      {localize('Category') + ':'} {UpFirstLetter(localize(s === 'Equipments' ? 'Clothing' : s))}
                    </option>
                  );
                })}
              </select>
              {searchParams.get('category') && (
                <button
                  type="button"
                  onClick={() => {
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()),
                      category: '',
                      page: 1,
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                  className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
                >
                  -
                </button>
              )}
            </div>
            {/* v3.0.0 checkbox for smaller screens */}
            <div className="flex flex-wrap gap-3 mb-3 text-sm md:hidden">
              <div className="flex items-center">
                <span className="mr-1">{'*' + localize('v3.0.0 items only') + ':'} </span>
                <div
                  onClick={() => {
                    var v3Only = searchParams.get('v3Only');
                    v3Only = v3Only === 'True' ? '' : 'True';
                    const updatedQuery = {
                      ...Object.fromEntries(searchParams.entries()),
                      v3Only: v3Only,
                      page: 1,
                    };
                    router.push({ query: updatedQuery }, undefined, { shallow: true });
                  }}
                  className={`p-2 w-5 h-5 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                >
                  {searchParams.get('v3Only') === 'True' ? '✗' : ''}
                </div>
              </div>
            </div>
            {/* toggle filters */}
            <div className="mt-2">
              <div className="flex">
                <button
                  className={classNames(
                    'h-8 md:h-9 flex items-center mb-2 px-2 py-1 border md:border-2 text-amber-500 border-amber-500 rounded lg:hover:bg-amber-200',
                    showFilters && 'bg-amber-200',
                  )}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {isAnyFilterActive() && <span className="bg-red-500 w-2 h-2 rounded-full mr-2"></span>}
                  <span className={classNames(showFilters ? 'triangle-down' : 'triangle-up', 'mr-2')}></span>
                  {localize('More Filters')}
                </button>
                <div className="h-8 md:h-9 px-2 py-1">
                  <button
                    onClick={() => {
                      const updatedQuery = {
                        textSearch: searchBar,
                        category: searchParams.get('category'),
                        excludeClothing: searchParams.get('excludeClothing'),
                        v3Only: searchParams.get('v3Only'),
                        lan: lan,
                        page: 1,
                      };
                      router.push({ query: updatedQuery }, undefined, { shallow: true });
                    }}
                    className={classNames(
                      'items-center h-7 w-7 text-sm bg-white rounded-full lg:hover:bg-amber-200 text-amber-500',
                    )}
                  >
                    x
                  </button>
                </div>
              </div>
              {showFilters && (
                <div className="mb-3 px-5 h-72 scrollbar-thin overflow-y-auto overflow-x-hidden bg-amber-200 bg-opacity-60 rounded-lg">
                  {' '}
                  {/* tag start */}
                  <div className="mt-3 mb-4">
                    <div className="text-sm md:text-base grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-checkboxfit justify-items-end lg:flex lg:flex-wrap items-center cursor-pointer mb-5">
                      {/* inventory filter checkbox */}
                      <div className="flex mb-1">
                        <span className="mr-1">{localize('Collected') + ':'} </span>
                        <div
                          onClick={() => {
                            setInventoryFilter(prev =>
                              prev === '' ? 'collected' : prev === 'collected' ? 'uncollected' : ''
                            );
                            router.push({ query: { ...Object.fromEntries(searchParams.entries()), page: 1 } }, undefined, { shallow: true });
                          }}
                          className={`mr-3 md:mr-7 p-2 w-6 h-6 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                        >
                          {inventoryFilter === 'collected'
                            ? '✓'
                            : inventoryFilter === 'uncollected'
                            ? '✗'
                            : ''}
                        </div>
                      </div>
                      {/* surface checkbox */}
                      <div className="flex mb-1">
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
                          className={`mr-3 md:mr-7 p-2 w-6 h-6 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                        >
                          {searchParams.get('surface') === 'True'
                            ? '✓'
                            : searchParams.get('surface') === 'False'
                            ? '✗'
                            : ''}
                        </div>
                      </div>
                      {/* body variants checkbox */}
                      <div className="flex mb-1">
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
                          className={`mr-3 md:mr-7 p-2 w-6 h-6 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                        >
                          {searchParams.get('body') === 'True' ? '✓' : searchParams.get('body') === 'False' ? '✗' : ''}
                        </div>
                      </div>
                      {/* pattern checkbox */}
                      <div className="flex mb-1">
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
                          className={`mr-3 md:mr-7 p-2 w-6 h-6 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                        >
                          {searchParams.get('pattern') === 'True'
                            ? '✓'
                            : searchParams.get('pattern') === 'False'
                            ? '✗'
                            : ''}
                        </div>
                      </div>
                      {/* custom pattern checkbox */}
                      <div className="flex mb-1">
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
                          className={`mr-3 md:mr-7 p-2 w-6 h-6 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                        >
                          {searchParams.get('custom') === 'True'
                            ? '✓'
                            : searchParams.get('custom') === 'False'
                            ? '✗'
                            : ''}
                        </div>
                      </div>
                      {/* sable pattern checkbox */}
                      <div className="flex">
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
                          className={`mr-3 md:mr-7 p-2 w-6 h-6 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                        >
                          {searchParams.get('sable') === 'True'
                            ? '✓'
                            : searchParams.get('sable') === 'False'
                            ? '✗'
                            : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*** Function/Theme Selections ***/}
                  {/* Medium and larger screens: buttons */}
                  <div className="mb-4 hidden md:block">
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
                  {/* Small screens: drop-down */}
                  <div className="relative mb-2 md:hidden">
                    <select
                      value={moreFilters['tag']}
                      onChange={(e) => {
                        const updatedQuery = {
                          ...Object.fromEntries(searchParams.entries()), // current query params
                          tag: e.target.value,
                          page: 1,
                        };
                        router.push({ query: updatedQuery }, undefined, { shallow: true });
                      }}
                      className={classNames(
                        `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-full bg-white`,
                        searchParams.get('tag') && 'text-slate-500 bg-amber-200',
                      )}
                    >
                      <option value="">{localize('Function/Theme') + ':'}</option>
                      {Object.keys(tags).map((s) => {
                        return (
                          <option key={s} value={s}>
                            {UpFirstLetter(localize(s))}
                          </option>
                        );
                      })}
                    </select>
                    {searchParams.get('tag') && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()),
                            tag: '',
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        -
                      </button>
                    )}
                  </div>
                  {/* tag/function/theme end */}
                  {/*** Size Selections ***/}
                  {/* Medium and larger screens: buttons */}
                  <div className="mb-4 hidden md:block">
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
                  {/* Small screens: drop-down */}
                  <div className="relative mb-2 md:hidden">
                    <select
                      value={moreFilters['size']}
                      onChange={(e) => {
                        const updatedQuery = {
                          ...Object.fromEntries(searchParams.entries()), // current query params
                          size: e.target.value,
                          page: 1,
                        };
                        router.push({ query: updatedQuery }, undefined, { shallow: true });
                      }}
                      className={classNames(
                        `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-full bg-white`,
                        searchParams.get('size') && 'text-slate-500 bg-amber-200',
                      )}
                    >
                      <option value="">{localize('Size') + ':'}</option>
                      {sizes.map((s) => {
                        return (
                          <option key={s} value={s}>
                            {localize('Size') + ':'} {s}
                          </option>
                        );
                      })}
                    </select>
                    {searchParams.get('size') && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()),
                            size: '',
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        -
                      </button>
                    )}
                  </div>
                  {/* size end */}
                  {/*** Interact Selections ***/}
                  {/* Medium and larger screens: buttons */}
                  <div className="mb-4 hidden md:block">
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
                  {/* Small screens: drop-down */}
                  <div className="relative mb-4 md:hidden">
                    <select
                      value={moreFilters['interactions']}
                      onChange={(e) => {
                        const updatedQuery = {
                          ...Object.fromEntries(searchParams.entries()), // current query params
                          interact: e.target.value === 'Other' ? 'True' : e.target.value,
                          page: 1,
                        };
                        router.push({ query: updatedQuery }, undefined, { shallow: true });
                      }}
                      className={classNames(
                        `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-full bg-white`,
                        searchParams.get('interact') && 'text-slate-500 bg-amber-200',
                      )}
                    >
                      <option value="">{localize('Interaction Type') + ':'}</option>
                      {Object.keys(interactTypes).map((s) => {
                        return (
                          <option key={s} value={s}>
                            {UpFirstLetter(localize(s))}
                          </option>
                        );
                      })}
                    </select>
                    {searchParams.get('interact') && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()),
                            interact: '',
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        -
                      </button>
                    )}
                  </div>
                  {/* interact end */}
                  {/*** Height Selections ***/}
                  <div className="mb-1 text-base">{localize('Height') + ':'}</div>
                  <div className="mb-1 lg:mb-4 flex">
                    <div className="mb-1 flex items-center justify-center">
                      <button
                        onClick={() => {
                          const updatedQuery = {
                            ...Object.fromEntries(
                              Array.from(searchParams.entries()).filter(
                                ([k, v]) => k !== 'minHeight' && k !== 'maxHeight',
                              ),
                            ),
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className={classNames(
                          'h-7 px-3 mr-2 rounded text-sm md:text-base',
                          '' === (searchParams?.get('minHeight') ?? ('' || (searchParams.get('maxHeight') ?? '')))
                            ? 'bg-amber-300 text-slate-500'
                            : 'bg-white text-slate-500 hover:bg-amber-300',
                        )}
                      >
                        X
                      </button>
                    </div>
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
                      className="flex"
                    >
                      <label className="hidden md:block text-base">{localize('Min Height') + ': '}</label>
                      <label className="md:hidden text-base">{localize('Min') + ': '}</label>
                      <input
                        className="ml-1 mr-2 w-16 h-7 rounded text-sm"
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
                      className="flex"
                    >
                      <label className="hidden md:block text-base">{localize('Max Height') + ':'}</label>
                      <label className="md:hidden text-base">{localize('Max') + ':'}</label>
                      <input
                        className="ml-1 mr-2 w-16 h-7 rounded text-sm"
                        name="maxHeight"
                        type="number"
                        value={maxHeight}
                        onChange={(e) => {
                          setMaxHeight(e.target.value);
                        }}
                      />
                    </form>
                    <button
                      onClick={() => {
                        const updatedQuery = {
                          ...Object.fromEntries(searchParams.entries()), // current query params
                          minHeight: minHeight, // updated minHeight
                          maxHeight: maxHeight, // updated maxHeight
                          page: 1,
                        };
                        router.push({ query: updatedQuery }, undefined, { shallow: true });
                      }}
                      className={classNames(
                        'h-7 px-1 ml-1 sm:ml-2 rounded text-sm bg-amber-50 text-slate-500 border border-amber-300',
                      )}
                    >
                      {localize('Submit')}
                    </button>
                    <span className="hidden lg:block italic">
                      {'* ' + localize("Player's height in the game is 15.")}
                    </span>
                  </div>{' '}
                  <div className="lg:hidden mb-4 italic text-sm">
                    {'* ' + localize("Player's height in the game is 15.")}
                  </div>
                  {/* height end */}
                  {/*** Color Selections ***/}
                  {/* All screen sizes: buttons */}
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
                        'px-3 py-1 mr-1 md:mr-2 mb-1 rounded text-sm md:text-base',
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
                  <div>
                    <div className="mb-1 text-base">{localize('Other Filters') + ':'}</div>{' '}
                    <div className="flex flex-wrap">
                      {/* sources drop-down */}
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
                            `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-[21rem] bg-white`,
                            searchParams.get('source') && 'text-slate-500 bg-amber-200',
                          )}
                        >
                          <option value="">{localize('Source') + ':'}</option>
                          {Object.keys(sources).map((s) => {
                            if (sources[s] === 'divider') {
                              return (
                                <option key={s} disabled>
                                  ─────
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
                            className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
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
                            `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-[21rem] bg-white`,
                            searchParams.get('season') && 'text-slate-500 bg-amber-200',
                          )}
                        >
                          <option value="">{localize('Seasonal') + ':'}</option>
                          {Object.keys(seasonals).map((s) => {
                            if (seasonals[s] === 'divider') {
                              return (
                                <option key={s} disabled>
                                  ─────
                                </option>
                              );
                            }
                            return (
                              <option key={s} value={s}>
                                {localize('Seasonal') + ':'} {UpFirstLetter(localize(s))}{' '}
                                {seasonals[s] && '(' + localize(seasonals[s]) + ')'}
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
                            className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
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
                            `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-[21rem] bg-white`,
                            searchParams.get('series') && 'text-slate-500 bg-amber-200',
                          )}
                        >
                          <option value="">{localize('Furniture Series') + ':'}</option>
                          {Object.keys(series_list).map((series) => {
                            if (series_list[series] === 'divider') {
                              return (
                                <option key={series} disabled>
                                  ─────
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
                            className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
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
                            `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-[21rem] bg-white`,
                            searchParams.get('concept') && 'text-slate-500 bg-amber-200',
                          )}
                        >
                          <option value="">{localize('Furniture Concept') + ':'}</option>
                          {Object.keys(concepts).map((s) => {
                            if (concepts[s] === 'divider') {
                              return (
                                <option key={s} disabled>
                                  ─────
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
                            className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            -
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* lighting type drop-down */}
                  <div className="flex flex-wrap mb-2">
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
                          `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-[16rem] bg-white`,
                          searchParams.get('lightingType') && 'text-slate-500 bg-amber-200',
                        )}
                      >
                        <option value="">{localize('Lighting Type') + ':'}</option>
                        {Object.keys(lightings).map((l) => {
                          if (lightings[l] === 'divider') {
                            return (
                              <option key={l} disabled>
                                ─────
                              </option>
                            );
                          }
                          return (
                            <option key={l} value={l}>
                              {localize('Lighting') + ': ' + localize(l)}
                            </option>
                          );
                        })}
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
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
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
                          `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-[16rem] bg-white`,
                          searchParams.get('speakerType') && 'text-slate-500 bg-amber-200',
                        )}
                      >
                        <option value="">{localize('Album Player Type') + ':'}</option>
                        {Object.keys(album_players).map((player) => {
                          if (album_players[player] === 'divider') {
                            return (
                              <option key={player} disabled>
                                ─────
                              </option>
                            );
                          }
                          return (
                            <option key={player} value={player}>
                              {localize('Album Player') + ': ' + localize(player)}
                            </option>
                          );
                        })}
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
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
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
                          `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-[16rem] bg-white`,
                          searchParams.get('rug') && 'text-slate-500 bg-amber-200',
                        )}
                      >
                        <option value="">{localize('Rug Filter') + ':'}</option>
                        {Object.keys(rugs).map((s) => {
                          if (rugs[s] === 'divider') {
                            return (
                              <option key={s} disabled>
                                ─────
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
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          -
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Clothing Filters */}
                  <div className="mb-1 text-base">{localize('Equipment Filters') + ':'}</div>
                  {/* Clothing drop-down */}
                  <div className="flex flex-wrap ">
                    {/* clothing type drop-down */}
                    <div className="relative mr-2 mb-2 ">
                      <select
                        value={moreFilters['clothingType']}
                        onChange={(e) => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()), // current query params
                            type: e.target.value,
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className={classNames(
                          `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-[16rem] bg-white`,
                          searchParams.get('type') && 'text-slate-500 bg-amber-200',
                        )}
                      >
                        <option value="">{localize('Clothing Type') + ':'}</option>
                        {Object.keys(clothingTypes).map((l) => {
                          if (clothingTypes[l] === 'divider') {
                            return (
                              <option key={l} disabled>
                                ─────
                              </option>
                            );
                          }
                          return (
                            <option key={l} value={l}>
                              {localize(l)}
                            </option>
                          );
                        })}
                      </select>
                      {searchParams.get('type') && (
                        <button
                          type="button"
                          onClick={() => {
                            const updatedQuery = {
                              ...Object.fromEntries(searchParams.entries()),
                              type: '',
                              page: 1,
                            };
                            router.push({ query: updatedQuery }, undefined, { shallow: true });
                          }}
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          -
                        </button>
                      )}
                    </div>
                    {/* clothing theme drop-down */}
                    <div className="relative mr-2 mb-2 ">
                      <select
                        value={moreFilters['clothingTheme']}
                        onChange={(e) => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()), // current query params
                            theme: e.target.value,
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className={classNames(
                          `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-[16rem] bg-white`,
                          searchParams.get('theme') && 'text-slate-500 bg-amber-200',
                        )}
                      >
                        <option value="">{localize('Clothing Theme') + ':'}</option>
                        {Object.keys(clothingThemes).map((l) => {
                          if (clothingThemes[l] === 'divider') {
                            return (
                              <option key={l} disabled>
                                ─────
                              </option>
                            );
                          }
                          return (
                            <option key={l} value={l}>
                              {localize('Theme') + ': ' + localize(l)}
                            </option>
                          );
                        })}
                      </select>
                      {searchParams.get('theme') && (
                        <button
                          type="button"
                          onClick={() => {
                            const updatedQuery = {
                              ...Object.fromEntries(searchParams.entries()),
                              theme: '',
                              page: 1,
                            };
                            router.push({ query: updatedQuery }, undefined, { shallow: true });
                          }}
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          -
                        </button>
                      )}
                    </div>
                    {/* clothing style drop-down */}
                    <div className="relative mr-2 mb-2 ">
                      <select
                        value={moreFilters['clothingStyle']}
                        onChange={(e) => {
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()), // current query params
                            style: e.target.value,
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className={classNames(
                          `select-custom form-select p-1 pl-8 rounded text-amber-500 border border-amber-500 w-[16rem] bg-white`,
                          searchParams.get('style') && 'text-slate-500 bg-amber-200',
                        )}
                      >
                        <option value="">{localize('Clothing Style') + ':'}</option>
                        {Object.keys(clothingStyles).map((l) => {
                          if (clothingStyles[l] === 'divider') {
                            return (
                              <option key={l} disabled>
                                ─────
                              </option>
                            );
                          }
                          return (
                            <option key={l} value={l}>
                              {localize('Style') + ': ' + localize(l)}
                            </option>
                          );
                        })}
                      </select>
                      {searchParams.get('style') && (
                        <button
                          type="button"
                          onClick={() => {
                            const updatedQuery = {
                              ...Object.fromEntries(searchParams.entries()),
                              style: '',
                              page: 1,
                            };
                            router.push({ query: updatedQuery }, undefined, { shallow: true });
                          }}
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          -
                        </button>
                      )}
                    </div>
                    {/* villager equippable checkbox */}
                    <div className="flex pt-1">
                      <span className="mr-1">{localize('Villager Equippable') + ':'} </span>
                      <div
                        onClick={() => {
                          var equippable = searchParams.get('equippable');
                          equippable = equippable === 'True' ? 'False' : equippable === 'False' ? '' : 'True';
                          const updatedQuery = {
                            ...Object.fromEntries(searchParams.entries()), // current query params
                            equippable: equippable,
                            page: 1,
                          };
                          router.push({ query: updatedQuery }, undefined, { shallow: true });
                        }}
                        className={`mr-3 md:mr-7 p-2 w-6 h-6 rounded text-amber-500 border border-amber-300 flex items-center justify-center bg-white`}
                      >
                        {searchParams.get('equippable') === 'True'
                          ? '✓'
                          : searchParams.get('equippable') === 'False'
                          ? '✗'
                          : ''}
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
            {(() => {
              const allItems = data?.result ?? [];
              const filtered = allItems.filter(item => {
                if (inventoryFilter === 'collected') return isCollected(item) || isPartiallyCollected(item);
                if (inventoryFilter === 'uncollected') return !isCollected(item) && !isPartiallyCollected(item);
                return true;
              });
              const isFiltered = inventoryFilter !== '';
              const pageSize = 60;
              const currentPage = isFiltered
                ? Number(searchParams.get('page') ?? 1)
                : parseInt(searchParams.get('page') ?? '1', 10);
              const displayItems = isFiltered
                ? filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
                : filtered;
              const totalCount = isFiltered ? filtered.length : (data?.page_info?.total_count ?? 0);
              const totalPages = isFiltered
                ? Math.max(1, Math.ceil(filtered.length / pageSize))
                : (data?.page_info?.max_page ?? 1);
              const startIndex = isFiltered
                ? Math.min((currentPage - 1) * pageSize + 1, filtered.length)
                : 60 * (Number(searchParams.get('page') ?? 1) - 1) + 1;
              const endIndex = isFiltered
                ? Math.min(currentPage * pageSize, filtered.length)
                : Math.min(60 * Number(searchParams.get('page') ?? 1), data?.page_info?.total_count ?? 0);

              return (
                <>
                  <div className="flex w-full items-center justify-between mb-2">
                    <div className="flex-grow pl-1 text-xs xs:text-sm md:text-base flex items-center gap-3">
                      <span>
                        {isLoading ? (
                          '...'
                        ) : totalCount ? (
                          <>
                            {startIndex}-{endIndex}
                            {lan === 'en' ? ' of' : '项,'} {lan === 'en' ? '' : '共'}
                            {totalCount}
                            {lan === 'en' ? ' Items' : '项'}
                          </>
                        ) : (
                          localize('No result') + ' ... :('
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {totalCount ? (
                        <PaginationControls
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={(page) => {
                            router.push({ query: { ...Object.fromEntries(searchParams.entries()), page } }, undefined, {
                              shallow: true,
                            });
                            window.scrollTo(0, 0);
                          }}
                        />
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-full grid gap-5 justify-center auto-rows-max
                          ${
                            displayItems.length < 4
                              ? 'grid-cols-autofit sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                              : 'grid-cols-autofit'
                          }`}
                  >
                    {displayItems.map((item, i) => (
                      <ItemCard
                        key={item.name}
                        item={item}
                        lan={lan}
                        hasVariations={hasVariations}
                        isVariationCollected={isVariationCollected}
                        isCollected={isCollected}
                        toggleInventory={toggleInventory}
                        openModal={openModal}
                      />
                    ))}
                  </div>
                  {isModalOpen && selectedItem && (
                    <Modal
                      item={selectedItem}
                      onClose={closeModal}
                      lan={lan}
                      localize={localize}
                      UpFirstLetter={UpFirstLetter}
                      findKeyByValue={findKeyByValue}
                      isCollected={isCollected}
                      isPartiallyCollected={isPartiallyCollected}
                      isVariationCollected={isVariationCollected}
                      hasVariations={hasVariations}
                      toggleInventory={toggleInventory}
                      toggleAllVariations={toggleAllVariations}
                      collectedVariationCount={collectedVariationCount}
                      totalVariationCount={totalVariationCount}
                      onFilterNavigate={(query) => {
                        setSearchBar('');
                        setShowFilters(false);
                        router.push({ query }, undefined, { shallow: true });
                        closeModal();
                      }}
                    />
                  )}
                  <div className="flex w-full items-center justify-center mt-5">
                    {totalCount ? (
                      <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                          router.push({ query: { ...Object.fromEntries(searchParams.entries()), page } }, undefined, {
                            shallow: true,
                          });
                          window.scrollTo(0, 0);
                        }}
                      />
                    ) : (
                      ''
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
