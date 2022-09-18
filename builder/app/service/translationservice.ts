/* eslint-disable compat/compat */
/* eslint-disable prefer-destructuring */ 
const memory = {}
export default function translationservice(sourceText, sourceLang, targetLang) {
  if (memory[sourceText] && memory[sourceText][sourceLang] && memory[sourceText][sourceLang][targetLang]) {
    return Promise.resolve(memory[sourceText][sourceLang][targetLang]);
  }
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${LanguagesCode[sourceLang]}&tl=${LanguagesCode[targetLang]}&dt=t&q=${encodeURI(sourceText)}`;
  return fetch(url).then(res => {
    return res.json().then(translation => {
      memory[sourceText] = memory[sourceText] || {}
      memory[sourceText][sourceLang] = memory[sourceText][sourceLang] || {};
      memory[sourceText][sourceLang][targetLang] = translation[0][0][0];
      return translation[0][0][0]
    })
  }).catch(e => console.log(e));
}
