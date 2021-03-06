import names from './namedata.json';
import images from './images.json';
export default {
	firstname: () => {
		let len = names.length;
		return names[Math.floor(len * Math.random())].name;
	},
	surname: () => {
		let len = names.length;
		return names[Math.floor(len * Math.random())].surname;
	},
	image: () => {
		let _images: any = images;
		let len = _images.length;
		return _images[Math.floor(len * Math.random())].img;
	}
};
