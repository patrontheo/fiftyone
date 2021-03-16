import { useState } from "react";
import { selector, selectorFamily } from "recoil";
import { animated, useSpring } from "react-spring";
import styled from "styled-components";

import { activeLabels } from "../Filters/utils";
import { labelCount } from "../Filters/LabelFieldFilters.state";
import * as atoms from "../../recoil/atoms";
import * as selectors from "../../recoil/selectors";
import { useTheme } from "../../utils/hooks";

export const HoverItemDiv = animated(styled.div`
  cursor: pointer;
  margin: 0 -0.5rem;
  padding: 0.25rem 0.5rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  color: ${({ theme }) => theme.fontDark};
`);

export const useHighlightHover = (disabled, forceOn) => {
  const [hovering, setHovering] = useState(false);
  const theme = useTheme();
  const on = (hovering || forceOn) && !disabled;
  const style = useSpring({
    backgroundColor: on
      ? theme.backgroundLight
      : disabled
      ? theme.backgroundDarker
      : theme.backgroundDark,
    color: on ? theme.font : theme.fontDark,
  });

  const onMouseEnter = () => setHovering(true);

  const onMouseLeave = () => setHovering(false);

  return {
    style: {
      ...style,
      cursor: disabled ? "disabled" : "pointer",
    },
    onMouseEnter,
    onMouseLeave,
  };
};

export const numTaggable = selectorFamily<
  number | null,
  { modal: boolean; labels: boolean }
>({
  key: "numTaggable",
  get: ({ modal, labels }) => ({ get }) => {
    if (labels) {
      return get(labelCount(modal));
    } else if (modal) {
      return 1;
    } else {
      return (
        get(selectors.filteredTagSampleCounts) ?? get(selectors.tagSampleCounts)
      );
    }
  },
});

export const selectedSampleTagStats = selector<{ [key: string]: number }>({
  key: "selectedSampleTagStats",
  get: ({ get }) => {
    const samplesIds = get(atoms.selectedSamples);
  },
});

export const allTags = selector<string[]>({
  key: "tagAggs",
  get: ({ get }) => {
    const stats = get(selectors.datasetStats);
    const paths = get(selectors.labelPaths);
    const types = get(selectors.labelTypesMap);

    return Object.keys(
      paths.reduce((acc, cur) => {
        return {
          ...acc,
          ...stats[`${cur}.${types[cur.toLowerCase()]}.tags`],
        };
      }, {})
    );
  },
});

export const numLabelsInSelectedSamples = selector<number>({
  key: "numLabelsInSelectedSamples",
  get: ({ get }) => {
    const filter = get();
  },
});

export const tagStats = selectorFamily<
  { [key: string]: number },
  { modal: boolean; labels: boolean }
>({
  key: "tagStats",
  get: ({ modal, labels }) => ({ get }) => {
    if (modal && labels) {
    } else if (modal) {
    } else if (labels) {
      const types = get(selectors.labelTypesMap);
      const active = [
        ...get(activeLabels({ modal, frames: false })),
        ...get(activeLabels({ modal, frames: true })).map((l) => `frames.${l}`),
      ].map((l) => `${l}.${types[l].toLowerCase()}.tags`);
      const reducer = (acc, { name, result }) => {
        if (active.includes(name)) {
          acc[name] = result;
        }
        return acc;
      };
      const stats =
        get(selectors.datasetStats) ||
        get(selectors.extendedDatasetStats).reduce(reducer, {});

      const results = Object.fromEntries(get(allTags).map((t) => [t, 0]));
      active.forEach((field) => {
        for (const tag in stats[field]) {
          results[tag] += stats[field][tag];
        }
      });
      return results;
    } else {
      const selected = get(atoms.selectedSamples);
      const results = Object.fromEntries(
        Object.keys(get(selectors.tagSampleCounts)).map((t) => [t, 0])
      );
      if (selected.size) {
        selected.forEach((id) => {
          get(atoms.sample(id)).tags.forEach((t) => {
            results[t] += 1;
          });
        });
      } else {
        const counts = Object.keys(get(selectors.filterStages)).length
          ? get(selectors.filteredTagSampleCounts)
          : get(selectors.tagSampleCounts);
        Object.keys(counts).forEach((t) => {
          results[t] += counts[t];
        });
      }
      return results;
    }
  },
});
