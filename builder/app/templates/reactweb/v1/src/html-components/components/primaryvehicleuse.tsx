import GenericDropDown from './genericdropdown';

export default class PrimaryVehicleUse extends GenericDropDown {
    constructor(props: any) {
        super(props);
        this.options = [{ value: '1', title: 'Pleasure' }, { value: '2', title: 'Business' }, { value: '4', title: 'Commute' }, { value: '3', title: 'Farm' }];
    }
}
