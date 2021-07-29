/**
 * Copyright 2017-2021, Voxel51, Inc.
 */

export type Optional<T> = {
  [P in keyof T]?: Optional<T[P]>;
};

export interface Section {
  getTop: () => number;
  getBottom: () => number;
  getHeight: () => number;
  index: number;
  set: (top: number, width: number) => void;
  show: () => void;
  hide: () => void;
  target: HTMLDivElement;
  isShown: () => boolean;
  getItems: () => ItemData[];
  resizeItems: (resizer: OnItemResize) => void;
}

export interface ItemData {
  id: string;
  aspectRatio: number;
}

export interface RowData {
  items: ItemData[];
  aspectRatio: number;
  extraMargins?: number;
}

export interface Response<K> {
  items: ItemData[];
  nextRequestKey?: K;
}

export type Get<K> = (key: K) => Promise<Response<K>>;

export type ItemIndexMap = { [key: string]: number };

export type OnItemClick = (
  event: MouseEvent,
  id: string,
  itemIndexMap: ItemIndexMap
) => void;

export type Render = (
  id: string,
  element: HTMLDivElement,
  dimensions: [number, number]
) => (() => void) | void;

export type OnItemResize = (id: string, dimensions: [number, number]) => void;

export interface Options {
  rowAspectRatioThreshold: number;
}

export type OnResize = (width: number) => Options;

export interface State<K> {
  get: Get<K>;
  render: Render;
  containerHeight: number;
  width: number;
  height: number;
  currentRequestKey: K;
  currentRemainder: ItemData[];
  currentRowRemainder: RowData[];
  items: ItemData[];
  sections: Section[];
  options: Options;
  activeSection: number;
  firstSection: number;
  lastSection: number;
  clean: Set<number>;
  updater?: (id: string) => void;
  shownSections: Set<number>;
  onItemClick?: OnItemClick;
  onItemResize?: OnItemResize;
  onResize?: OnResize;
  nextItemIndex: number;
  itemIndexMap: ItemIndexMap;
  resized?: Set<number>;
  zooming: boolean;
}
