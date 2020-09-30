import { Index } from '../widgets/index/index';
import {
  AlgoliaSearchHelper as Helper,
  SearchParameters,
  SearchResults,
  PlainSearchParameters,
} from 'algoliasearch-helper';
import { InstantSearch } from './instantsearch';
import {
  AutocompleteRendererOptions,
  AutocompleteConnectorParams,
} from '../connectors/autocomplete/connectAutocomplete';
import {
  BreadcrumbRendererOptions,
  BreadcrumbConnectorParams,
} from '../connectors/breadcrumb/connectBreadcrumb';
import {
  ClearRefinementsRendererOptions,
  ClearRefinementsConnectorParams,
} from '../connectors/clear-refinements/connectClearRefinements';
import {
  ConfigureRendererOptions,
  ConfigureConnectorParams,
} from '../connectors/configure/connectConfigure';
import {
  CurrentRefinementsRendererOptions,
  CurrentRefinementsConnectorParams,
} from '../connectors/current-refinements/connectCurrentRefinements';
import {
  HitsRendererOptions,
  HitsConnectorParams,
} from '../connectors/hits/connectHits';

export type ScopedResult = {
  indexId: string;
  results: SearchResults;
  helper: Helper;
};

type SharedRenderOptions = {
  instantSearchInstance: InstantSearch;
  parent: Index | null;
  templatesConfig: object;
  scopedResults: ScopedResult[];
  state: SearchParameters;
  renderState: IndexRenderState;
  helper: Helper;
  searchMetadata: {
    isSearchStalled: boolean;
  };
  createURL(state: SearchParameters): string;
};

export type InitOptions = SharedRenderOptions & {
  uiState: UiState;
  results?: undefined;
};

export type RenderOptions = SharedRenderOptions & {
  results: SearchResults;
};

export type DisposeOptions = {
  helper: Helper;
  state: SearchParameters;
};

export type WidgetUiStateOptions = {
  searchParameters: SearchParameters;
  helper: Helper;
};

export type WidgetSearchParametersOptions = {
  uiState: IndexUiState;
};

export type IndexUiState = {
  query?: string;
  refinementList?: {
    [attribute: string]: string[];
  };
  menu?: {
    [attribute: string]: string;
  };
  /**
   * The list of hierarchical menus.
   * Nested levels must contain the record separator.
   *
   * @example ['Audio', 'Audio > Headphones']
   */
  hierarchicalMenu?: {
    [attribute: string]: string[];
  };
  /**
   * The numeric menu as a tuple.
   *
   * @example ':5'
   * @example '5:10'
   * @example '10:'
   */
  numericMenu?: {
    [attribute: string]: string;
  };
  ratingMenu?: {
    [attribute: string]: number;
  };
  /**
   * The range as a tuple.
   *
   * @example '100:500'
   */
  range?: {
    [attribute: string]: string;
  };
  toggle?: {
    [attribute: string]: boolean;
  };
  geoSearch?: {
    /**
     * The rectangular area in geo coordinates.
     * The rectangle is defined by two diagonally opposite points, hence by 4 floats separated by commas.
     *
     * @example '47.3165,4.9665,47.3424,5.0201'
     */
    boundingBox: string;
  };
  sortBy?: string;
  page?: number;
  hitsPerPage?: number;
  configure?: PlainSearchParameters;
  places?: {
    query: string;
    /**
     * The central geolocation.
     *
     * @example '48.8546,2.3477'
     */
    position: string;
  };
};

export type UiState = {
  [indexId: string]: IndexUiState;
};

export type RenderState = {
  [indexId: string]: IndexRenderState;
};

export type SearchBoxWidgetRenderState = WidgetRenderState<
  {
    query: string;
    refine(query: string): void;
    clear(): void;
    isSearchStalled: boolean;
  },
  {
    queryHook?(query: string, refine: (query: string) => void);
  }
>;

export type AutocompleteWidgetRenderState = WidgetRenderState<
  AutocompleteRendererOptions,
  AutocompleteConnectorParams
>;

export type BreadcrumbWidgetRenderState = WidgetRenderState<
  BreadcrumbRendererOptions,
  BreadcrumbConnectorParams
>;

export type ClearRefinementsWidgetRenderState = WidgetRenderState<
  ClearRefinementsRendererOptions,
  ClearRefinementsConnectorParams
>;

export type ConfigureWidgetRenderState = WidgetRenderState<
  ConfigureRendererOptions,
  ConfigureConnectorParams
>;

export type CurrentRefinementsWidgetRenderState = WidgetRenderState<
  CurrentRefinementsRendererOptions,
  CurrentRefinementsConnectorParams
>;

export type HierarchicalMenuWidgetRenderState = WidgetRenderState<
  {
    items: any[];
    refine(facetValue: any): void;
    createURL(facetValue: any): string;
    isShowingMore: boolean;
    toggleShowMore(): void;
    canToggleShowMore: boolean;
  },
  {
    attributes: string[];
    separator: string;
    rootPath: string | null;
    showParentLevel: boolean;
    limit: number;
    showMore: boolean;
    showMoreLimit: number;
    sortBy: any;
    transformItems(items: any): any;
  }
>;

export type HitsWidgetRenderState = WidgetRenderState<
  HitsRendererOptions,
  HitsConnectorParams
>;

export type IndexRenderState = Partial<{
  searchBox: SearchBoxWidgetRenderState;
  autocomplete: AutocompleteWidgetRenderState;
  breadcrumb: {
    [attribute: string]: BreadcrumbWidgetRenderState;
  };
  clearRefinements: ClearRefinementsWidgetRenderState;
  configure: ConfigureWidgetRenderState;
  currentRefinements: CurrentRefinementsWidgetRenderState;
  hierarchicalMenu: {
    [attribute: string]: HierarchicalMenuWidgetRenderState;
  };
  hits: HitsWidgetRenderState;
}>;

type WidgetRenderState<
  TWidgetRenderState,
  // @ts-ignore
  TWidgetParams
> = TWidgetRenderState & {
  widgetParams: any; // @TODO type as TWidgetParams
};

/**
 * Widgets are the building blocks of InstantSearch.js. Any valid widget must
 * have at least a `render` or a `init` function.
 */
export type GenericWidget = {
  /**
   * Called once before the first search
   */
  init?(options: InitOptions): void;
  /**
   * Called after each search response has been received
   */
  render?(options: RenderOptions): void;
  /**
   * Called when this widget is unmounted. Used to remove refinements set by
   * during this widget's initialization and life time.
   */
  dispose?(options: DisposeOptions): SearchParameters | void;
  /**
   * Returns IndexRenderState of the current index component tree
   * to build the render state of the whole app.
   */
  getRenderState?(
    renderState: IndexRenderState,
    renderOptions: InitOptions | RenderOptions
  ): IndexRenderState;
  /**
   * This function is required for a widget to be taken in account for routing.
   * It will derive a uiState for this widget based on the existing uiState and
   * the search parameters applied.
   * @param uiState current state
   * @param widgetStateOptions extra information to calculate uiState
   */
  getWidgetUiState?(
    uiState: IndexUiState,
    widgetUiStateOptions: WidgetUiStateOptions
  ): IndexUiState;
  /**
   * This function is required for a widget to be taken in account for routing.
   * It will derive a uiState for this widget based on the existing uiState and
   * the search parameters applied.
   * @deprecated Use `getWidgetUiState` instead.
   * @param uiState current state
   * @param widgetStateOptions extra information to calculate uiState
   */
  getWidgetState?(
    uiState: IndexUiState,
    widgetStateOptions: WidgetUiStateOptions
  ): IndexUiState;
  getWidgetRenderState?: (renderOptions: InitOptions | RenderOptions) => any;
  /**
   * This function is required for a widget to behave correctly when a URL is
   * loaded via e.g. routing. It receives the current UiState and applied search
   * parameters, and is expected to return a new search parameters.
   * @param state applied search parameters
   * @param widgetSearchParametersOptions extra information to calculate next searchParameters
   */
  getWidgetSearchParameters?(
    state: SearchParameters,
    widgetSearchParametersOptions: WidgetSearchParametersOptions
  ): SearchParameters;
};

export interface HitsWidget extends GenericWidget {
  $$type: 'ais.hits';
  getWidgetRenderState: (
    renderOptions: InitOptions | RenderOptions
  ) => HitsWidgetRenderState;
}

export interface SearchBoxWidget extends GenericWidget {
  $$type: 'ais.searchBox';
  getWidgetRenderState?: (
    renderOptions: InitOptions | RenderOptions
  ) => SearchBoxWidgetRenderState;
}

export interface AutocompleteWidget extends GenericWidget {
  $$type: 'ais.autocomplete';
  getWidgetRenderState?: (
    renderOptions: InitOptions | RenderOptions
  ) => AutocompleteWidgetRenderState;
}

export interface BreadcrumbWidget extends GenericWidget {
  $$type: 'ais.breadcrumb';
  getWidgetRenderState?: (
    renderOptions: InitOptions | RenderOptions
  ) => BreadcrumbWidgetRenderState;
}

export interface ClearRefinementsWidget extends GenericWidget {
  $$type: 'ais.clearRefinements';
  getWidgetRenderState?: (
    renderOptions: InitOptions | RenderOptions
  ) => ClearRefinementsWidgetRenderState;
}

export interface ConfigureWidget extends GenericWidget {
  $$type: 'ais.configure';
  getWidgetRenderState?: (
    renderOptions: InitOptions | RenderOptions
  ) => ConfigureWidgetRenderState;
}

export interface CurrentRefinementsWidget extends GenericWidget {
  $$type: 'ais.currentRefinements';
  getWidgetRenderState?: (
    renderOptions: InitOptions | RenderOptions
  ) => CurrentRefinementsWidgetRenderState;
}

export interface HierarchicalMenuWidget extends GenericWidget {
  $$type: 'ais.hierarchicalMenu';
  getWidgetRenderState?: (
    renderOptions: InitOptions | RenderOptions
  ) => HierarchicalMenuWidgetRenderState;
}

export interface ConfigureRelatedItemsWidget extends GenericWidget {
  $$type: 'ais.configureRelatedItems';
}

export interface GeoSearchWidget extends GenericWidget {
  $$type: 'ais.geoSearch';
}

export interface HitsPerPageWidget extends GenericWidget {
  $$type: 'ais.hitsPerPage';
}

export interface IndexWidget extends GenericWidget {
  $$type: 'ais.index';
}

export interface InfiniteHitsWidget extends GenericWidget {
  $$type: 'ais.infiniteHits';
}

export interface MenuWidget extends GenericWidget {
  $$type: 'ais.menu';
}

export interface NumericMenuWidget extends GenericWidget {
  $$type: 'ais.numericMenu';
}

export interface PaginationWidget extends GenericWidget {
  $$type: 'ais.pagination';
}

export interface PlacesWidget extends GenericWidget {
  $$type: 'ais.places';
}

export interface PoweredByWidget extends GenericWidget {
  $$type: 'ais.poweredBy';
}

export interface QueryRulesWidget extends GenericWidget {
  $$type: 'ais.queryRules';
}

export interface QueryRuleCustomDataWidget extends GenericWidget {
  $$type: 'ais.queryRuleCustomData';
}

export interface QueryRuleContextWidget extends GenericWidget {
  $$type: 'ais.queryRuleContext';
}

export interface RangeWidget extends GenericWidget {
  $$type: 'ais.range';
}

export interface RangeInputWidget extends GenericWidget {
  $$type: 'ais.rangeInput';
}

export interface RangeSliderWidget extends GenericWidget {
  $$type: 'ais.rangeSlider';
}

export interface RatingMenuWidget extends GenericWidget {
  $$type: 'ais.ratingMenu';
}

export interface RefinementListWidget extends GenericWidget {
  $$type: 'ais.refinementList';
}

export interface SortByWidget extends GenericWidget {
  $$type: 'ais.sortBy';
}

export interface StatsWidget extends GenericWidget {
  $$type: 'ais.stats';
}

export interface ToggleRefinementWidget extends GenericWidget {
  $$type: 'ais.toggleRefinement';
}

export interface VoiceSearchWidget extends GenericWidget {
  $$type: 'ais.voiceSearch';
}

export type Widget =
  | GenericWidget
  | HitsWidget
  | SearchBoxWidget
  | AutocompleteWidget
  | BreadcrumbWidget
  | ClearRefinementsWidget
  | ConfigureWidget
  | CurrentRefinementsWidget
  | HierarchicalMenuWidget
  | ConfigureRelatedItemsWidget
  | GeoSearchWidget
  | HitsPerPageWidget
  | IndexWidget
  | InfiniteHitsWidget
  | MenuWidget
  | NumericMenuWidget
  | PaginationWidget
  | PlacesWidget
  | PoweredByWidget
  | QueryRulesWidget
  | QueryRuleCustomDataWidget
  | QueryRuleContextWidget
  | RangeWidget
  | RangeInputWidget
  | RangeSliderWidget
  | RatingMenuWidget
  | RefinementListWidget
  | SortByWidget
  | StatsWidget
  | ToggleRefinementWidget
  | VoiceSearchWidget;

/**
 * The function that creates a new widget.
 */
export type WidgetFactory<TConnectorParams, TWidgetParams> = (
  /**
   * The params of the widget.
   */
  widgetParams: TConnectorParams & TWidgetParams
) => Widget;

export type Template<TTemplateData = void> =
  | string
  | ((data: TTemplateData) => string);
