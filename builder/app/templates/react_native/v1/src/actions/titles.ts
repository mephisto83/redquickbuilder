/* eslint-disable import/prefer-default-export */
/* eslint-disable no-param-reassign */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-empty */
import titleLib from './titleServiceLib';

export const TitleService = {
  get: key => {
    if (key && key.trim) {
      key = key.trim();
    }
    if (titleLib) {
      const { preferred, lib } = titleLib;
      if (lib && lib[key]) {
        const { properties } = lib[key];
        if (properties &&
          properties.languages &&
          properties.languages.hasOwnProperty(preferred)) {
          return properties.languages[preferred];
        }
      }
    }
    return `[${key}]`;
  }
};
