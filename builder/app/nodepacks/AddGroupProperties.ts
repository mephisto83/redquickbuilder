export default function (args: any = {}) {
	// node1
	let context = {
		...args
	};

	return [[{ name: 'Members', isReferenceList: true }, { name: 'Invitees' },
	{ name: 'Admins', uiAttributeType: 'LISTOFSTRINGS' },
	{ name: 'Writers', uiAttributeType: 'LISTOFSTRINGS' },
	{ name: 'Config', uiAttributeType: 'DICTSTRING_NUM' },
	{ name: 'Readers', uiAttributeType: 'LISTOFSTRINGS' },
	{ name: 'Membership Requests', isReferenceList: true }].map((setup: any) => {

		return [function () {
			return [
				{
					operation: 'NEW_PROPERTY_NODE',
					options: {
						parent: context.node0,
						properties: {
							uiAttributeType: setup.uiAttributeType || 'STRING',
							isReferenceList: setup.isReferenceList || false
						},
						groupProperties: {},
						linkProperties: {
							properties: {
								type: 'property-link',
								'property-link': {}
							}
						},
						callback: function (node: any) {
							setup.node = node.id;
						}
					}
				}
			];
		},

		function () {
			return [
				{
					operation: 'CHANGE_NODE_TEXT',
					options: {
						id: setup.node,
						value: setup.name
					}
				}
			];
		}]
	})

	];
}
