/* eslint-disable import/prefer-default-export */
/* eslint-disable no-param-reassign */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-empty */
import titleLib from './titleServiceLib';

const titleOptions = { preferredLang: false };
export const TitleService = {
	get: (key: string, defaultValue?: string) => {
		if (key && key.trim) {
			key = key.trim();
		}
		if (titleLib) {
			const { preferredLang } = titleOptions;
			const { preferred, lib } = titleLib;
			if (lib && lib[key]) {
				const { properties } = lib[key];
				if (
					properties &&
					properties.languages &&
					(properties.languages.hasOwnProperty(preferred) ||
						properties.languages.hasOwnProperty(preferredLang))
				) {
					return properties.languages[preferredLang] || properties.languages[preferred];
				}
			}
		}
		return `[${defaultValue || key}]`;
	}
};

export function setPreferredLanguage(lang) {
	titleOptions.preferredLang = lang;
}

window.setPreferredLanguage = setPreferredLanguage;
