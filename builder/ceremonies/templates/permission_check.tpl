public async Task<IList<ConversationMessage>> SendMessageToConversation(User user, string ConversationId, string message) { 

    if(await CanSendMessage(customer.Id , ConversationId).ConfigureAwait(false))) {

        await StreamProcess.ConversationMessage(CreateMessage(customer.Id , ConversationId, message));

        return await arbiter.GetConversationMessagesByConversationId(ConversationId);
    }
    return new List<ConversationMessage>();
}


public async Task<IList<{{model}}>> {{function.codeName}}({{user}} {{user_instance}}, {{resourceHead_identifier}} {{resourceHead}}, {{value_type}} {{value}}) { 

    var {{agent_type_instance}} = await arbiter.GetByOwnerId<{{AgentType}}({{user_id}});

    if(await CanSendMessage({{agent_type_instance}}.Id , {{resourceHead}}).ConfigureAwait(false))) {

        await StreamProcess.{{model}}({{model}}Change.{{function_name}}({{agent_type_instance}}.Id , {{resourceHead}}, {{value}}));

        return await arbiter.GetBy<{{model}}(conversationMessage => conversationMessage.{{determining_property}} == resourceHead);
    }
    return new List<{{model}}>();
}



public async Task CreateMessage(ConversationMessageChange change) {
    string customerId = change.Customer;
    string conversationId = change.Conversation;
    string message = change.Message;
    
    var message = ConversationMessage.Create(customerId, conversationId, message);

    await arbiter.Create<ConversationMessage>(message);

    await WriteResponseMesage()
}