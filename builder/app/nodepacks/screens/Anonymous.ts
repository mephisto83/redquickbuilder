import AddCancelButtonEvent from './AddCancelButtonEvent';

export default function Anonymous(args: any = {}) {
	if (!args.screen) {
		throw new Error('missing screen');
	}
	if (!args.uiType) {
		throw new Error('missing uiType');
	}

	const result = [ ...AddCancelButtonEvent({ screen: args.screen, uiType: args.uiType }) ];

	return result;
}
