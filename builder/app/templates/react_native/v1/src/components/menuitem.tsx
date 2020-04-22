


import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { redConnect, titleService } from '../actions/util';
import getTheme from '../../native-base-theme/components'
import material from '../../native-base-theme/variables/variables';
import { Content, StyleProvider } from 'native-base';
import { Container, ListItem, Header, Title, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, View } from 'native-base';
import { NavigationActions } from 'react-navigation';

export default class MenuItem extends React.Component {

    render() {
        navigationInstance = this.props.navigation;
        return (
            <TouchableOpacity onPress={() => {
                if (this.props.onPress) {
                    this.props.onPress();
                }
            }}>
                <View icon style={{ paddingLeft: 15, paddingRight: 0, flexDirection: 'row', backgroundColor: 'transparent', height: 50 }}>
                    <Left style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name={this.props.icon} style={{ paddingLeft: 3, paddingRight: 4 }} />
                        <Text>{this.props.title}</Text>
                    </Left>
                    <Body>
                    </Body>
                    <Right>
                    </Right>
                </View>
            </TouchableOpacity>
        );
    }
}