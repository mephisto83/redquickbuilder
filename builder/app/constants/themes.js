/* eslint-disable import/prefer-default-export */
import { UITypes } from "./nodetypes";

export const Themes = {
  ContactFrom_v4: {
    [UITypes.ElectronIO]: {
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
    }
  }
};

export const FormTypes = {
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
  Button: 'Button'
}

export const FormThemePropertyKeys = {
  FontFamily: 'FontFamily',
  FontSource: 'FontSource',
  FontSize: 'FontSize',
  FontStyle: 'FontStyle',
  FontVariant: 'FontVariant',
  FontWeight: 'FontWeight',
  LineHeight: 'LineHeight',
  Color: 'Color'
}

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
