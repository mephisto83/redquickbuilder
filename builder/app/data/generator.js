import names from './namedata.json';
export default {
    firstname: () => {
        let len = names.length;
        return names[Math.floor(len * Math.random())].name;
    },
    surname: () => {
        let len = names.length;
        return names[Math.floor(len * Math.random())].surname;
    }
}