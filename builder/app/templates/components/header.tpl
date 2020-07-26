<Header {...props}>
    { {{left}} ? (<Left>
        <Button transparent>
            <Icon name='arrow-back' />
        </Button>
    </Left>) : null
    }

    <Body>
        {{{title}} ? (<Title>{{label}}</Title>) : null}
    </Body>
   { {{right}} ?  (<Right>
        <Button transparent>
            <Icon name='menu' />
        </Button>
    </Right>): null }
</Header>
