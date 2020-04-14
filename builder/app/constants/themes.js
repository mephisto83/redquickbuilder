/* eslint-disable import/prefer-default-export */
import { UITypes } from "./nodetypes";
import { StyleLib } from "./styles";

export const Themes = {
  ContactFrom_v4: {
    [UITypes.ElectronIO]: {
      location: "./app/templates/themes/ContactFrom_v4/electronio/",
      theme: "./app/templates/themes/ContactFrom_v4/theme/",
      relative: "./app",
      themerelative: "./app/theme"
    },
    [UITypes.ReactWeb]: {
      location: "./app/templates/themes/ContactFrom_v4/electronio/",
      theme: "./app/templates/themes/ContactFrom_v4/theme/",
      relative: "./app",
      themerelative: "./app/theme"
    }
  },
  InputMaterialWithGradient: {
    [UITypes.ElectronIO]: {
      location: './app/templates/themes/InputMaterialWithGradient/electronio/',
      theme: './app/templates/themes/InputMaterialWithGradient/theme/',
      relative: "./app",
      themerelative: "./app/theme"
    },
    [UITypes.ReactWeb]: {
      location: './app/templates/themes/InputMaterialWithGradient/electronio/',
      theme: './app/templates/themes/InputMaterialWithGradient/theme/',
      relative: "./app",
      themerelative: "./app/theme"
    }
  },
  BlueprintMultiLevelMenu: {
    [UITypes.ElectronIO]: {
      location: './app/templates/themes/BlueprintMultiLevelMenu/electronio/',
      theme: './app/templates/themes/BlueprintMultiLevelMenu/theme/',
      relative: "./app",
      themerelative: "./app/theme"
    },
    [UITypes.ReactWeb]: {
      location: './app/templates/themes/BlueprintMultiLevelMenu/electronio/',
      theme: './app/templates/themes/BlueprintMultiLevelMenu/theme/',
      relative: "./app",
      themerelative: "./app/theme"
    }
  }
};

export const SectioningRoot = {
  Body: 'Body',
  Container: 'Container',
  Content: 'Content'
}
// Text Content
export const ContentSectioning = {
  H1: 'H1',
  H2: 'H2',
  H3: 'H3',
  H4: 'H4',
  H5: 'H5',
  H6: 'H6',
  Input: 'Input',
  P: 'P',
  Span: 'Span',
  Label: 'Label',
  Button: 'Button',
  A: 'A',
  HR: 'Hr',
  IMG: 'Img',
  DIV: 'Div',
  Address: 'Address',
  Article: 'Article',
  Aside: 'Aside',
  Footer: 'Footer',
  Header: 'Header',
  Hgroup: 'Hgroup',
  Main: 'Main',
  Nav: 'Nav',
  Section: 'Section',
}
export const TextContent = {
  Blockquote: 'Blockquote',
  DD: 'DD',
  DL: 'DL',
  DT: 'DT',
  FIGCAPTION: 'FIGCAPTION',
  FIGURE: 'FIGURE',
  LI: 'LI',
  OL: 'OL',
  PRE: 'PRE',
  UL: 'UL'
}

export const InlineTextSemantics = {
  Abbr: 'Abbr',
  B: 'B',
  BDI: 'BDI',
  BDO: 'BDO',
  BR: 'BR',
  CITE: 'CITE',
  CODE: 'CODE',
  DATA: 'DATA',
  DFN: 'DFN',
  EM: 'EM',
  I: 'I',
  KBD: 'KBD',
  MARK: 'MARK',
  Q: 'Q',
  RB: 'RB',
  RP: 'RP',
  RTC: 'RTC',

}

export const ImageMultiMedia = {
  AREA: 'AREA',
  IMG: 'IMG',
  AUDIO: 'AUDIO',
  MAP: 'MAP',
  TRACK: 'TRACK',
  VIDEO: 'VIDEO'
};

export const EmbeddedContent = {
  EMBED: 'EMBED',
  IFRAME: 'IFRAME',
  SOURCE: 'SOURCE',
  PARAM: 'PARAM',
  OBJECT: 'OBJECT',
  PICTURE: 'PICTURE',
}
export const DemarcatingEdits = {
  DEL: 'DEL',
  INS: 'INS'
}
export const TableContent = {
  CAPTION: 'CAPTION',
  COL: 'COL',
  COLGROUP: 'COLGROUP',
  TABLE: 'TABLE',
  TD: 'TD',
  TBODY: 'TBODY',
  TFOOT: 'TFOOT',
  TH: 'TH',
  THEAD: 'THEAD',
  TR: 'TR'
}
export const InteractiveTypes = {

  Details: 'Details',
  Summary: 'Summary'
}

export const SpaceThemePropertyKeys = {

}

export const FormThemePropertyKeys = {
}

export const CssPseudoSelectors = {
  [":active"]: ":active",
  ["::before"]: "::before",
  ["::after"]: "::after",
  [":checked"]: ":checked",
  [":disabled"]: ":disabled",
  [":empty"]: ":empty",
  [":hover"]: ":hover",
  [":enabled"]: ":enabled",
  [":first-child"]: ":first-child",
  [':required']: ':required',
  [":last-child"]: ":last-child",
  [":focus"]: ":focus",
  [":read-only"]: ":read-only",
}

const cssProperties = Object.keys({ ...StyleLib.css }).map(v => {
  if (typeof v === 'object') {
    return v;

  }
  return {
    placeholder: v,
    label: v,
    key: v
  }
});
export const HTMLElementGroups = [
  {
    name: 'Sectioning Root',
    type: SectioningRoot, cssProperties
  },
  {
    name: 'ContentSectioning',
    type: ContentSectioning, cssProperties
  },
  {
    name: 'TextContent', type: TextContent, cssProperties
  },
  {
    name: 'InlineTextSemantics', type: InlineTextSemantics, cssProperties
  },
  { name: 'ImageMultiMedia', type: ImageMultiMedia, cssProperties },
  { name: 'EmbeddedContent', type: EmbeddedContent, cssProperties },
  { name: 'TableContent', type: TableContent, cssProperties },
  { name: 'InteractiveTypes', type: InteractiveTypes, cssProperties },
  { name: 'DemarcatingEdits', type: DemarcatingEdits, cssProperties }
];
export const MediaSize = {
  Desktop: 'Desktop',
  Tablet: 'Tablet',
  Mobile: 'Mobile'
}

export const ThemeColors = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: "tertiary",
  quanternary: "quanternary",
  quinary: "quinary",
  black: 'black',
  white: 'white',
  grey: 'grey'
}

export const ColorUses = {
  inputFieldPrimary: 'inputFieldPrimary',
  inputFieldSecondary: 'inputFieldSecondary',
  inputFieldGray: 'inputFieldGray',
  navItemLinkDisabledColor: 'navItemLinkDisabledColor',
  menuActiveTextColor: 'menuActiveTextColor',
  menuNavLinkBackgroundColor: "menuNavLinkBackgroundColor",
  inputFieldWhite: 'inputFieldWhite',
  navItemLinkColor: 'navItemLinkColor'
}

export const OtherUses = {
  inputFieldFontFamily: 'inputFieldFontFamily',
  inputFontSize: 'inputFontSize',
  menuTransition: 'menuTransition',
  menuNavLinkBoxShadowX: 'menuNavLinkBoxShadowX',
  menuNavLinkBoxShadowY: 'menuNavLinkBoxShadowY'
}
