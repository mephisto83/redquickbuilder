import * as React from 'react'
import { redConnect, titleService } from '../actions/util'
import { Content, StyleProvider } from '../html-components';
import {
  Container,
  ListItem,
  Header,
  Title,
  Footer,
  FooterTab,
  Button,
  Left,
  Right,
  Body,
  Icon,
  Text,
  View
} from '../html-components';

export default class MenuItem extends React.Component {
  render () {
    navigationInstance = this.props.navigation
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.props.onPress) {
            this.props.onPress()
          }
        }}
      >
        <View
          icon
          style={{
            paddingLeft: 15,
            paddingRight: 0,
            flexDirection: 'row',
            backgroundColor: 'transparent',
            height: 50
          }}
        >
          <Left style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon
              name={this.props.icon}
              style={{ paddingLeft: 3, paddingRight: 4 }}
            />
            <Text>{this.props.title}</Text>
          </Left>
          <Body />
          <Right />
        </View>
      </TouchableOpacity>
    )
  }
}
