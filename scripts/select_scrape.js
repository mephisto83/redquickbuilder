var tests = document.querySelector('').querySelectorAll('option')
var result = [];
for (let i = 0; i < tests.length; i++) { result.push({ title: tests[i].innerHTML, value: tests[i].value }) }
JSON.stringify(result);