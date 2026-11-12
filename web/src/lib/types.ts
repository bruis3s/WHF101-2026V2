export interface EditorialItem {
  title: string;
  category: string;
  year: string;
  width: string;
  aspectRatio: number;
  imgUrl: string | null;
  slug: string;
  code?: string;
  location?: string;
  status?: string;
}

export interface EditorialRow {
  rowIndex: number;
  justify?: string;
  gap?: string;
  items: EditorialItem[];
}

export interface WerksListItem {
  code: string;
  title: string;
  category: string;
  location: string;
  year: string;
  slug: string;
}

export interface CaseStudySpec {
  label: string;
  value: string;
}

export interface CaseStudyColumn {
  image: string;
  video?: string;
  caption?: string;
  captionPosition?: 'top' | 'bottom';
  figureNumber?: string;
  widthPercent?: number;
  heightPercent?: number;
  aspectRatio?: number | string;
  verticalAlign?: 'flex-start' | 'center' | 'flex-end';
  fit?: 'cover' | 'contain' | 'fit-width';
  priority?: boolean;
  fillHeight?: boolean;
  fill?: boolean;
  paddingTop?: string;
  paddingBottom?: string;
}

export interface CaseStudyRow {
  id?: string;
  sectionHeight?: string;
  sizingMode?: 'cover' | 'contain' | 'fit-width';
  gap?: string;
  justifyContent?: string;
  verticalAlign?: string;
  paddingTop?: string;
  paddingBottom?: string;
  padding?: string;
  rowType?: string;
  figureNumber?: string;
  title?: string;
  caption?: string;
  columns: CaseStudyColumn[];
}

export interface CaseStudy {
  slug: string;
  code?: string;
  title: string;
  subtitle?: string;
  projectType?: string;
  category?: string;
  discipline?: string[];
  year?: string;
  location?: string;
  status?: string;
  client?: string;
  coverImageUrl?: string;
  specs?: CaseStudySpec[];
  layoutRows?: CaseStudyRow[];
}

export interface ExploreLayoutItem {
  slug: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  category?: string;
  year?: string;
  status?: string;
  coverImageUrl?: string;
}

export interface ExploreLayoutData {
  canvasWidth: number;
  canvasHeight: number;
  initialX?: number;
  initialY?: number;
  initialCenterX?: number;
  initialCenterY?: number;
  items: ExploreLayoutItem[];
}



