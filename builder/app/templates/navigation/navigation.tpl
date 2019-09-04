
import * as React from 'react';
import { View, Text} from 'native-base';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
{{imports}}

{{combos}}

export const RootStack = createStackNavigator({
{{properties}}
})