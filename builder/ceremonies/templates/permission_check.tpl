public async Task<IList<ConversationMessage>> SendMessageToConversation(User user, string CustomerId, string ConversationId, string message)
{
    var customer = await arbiter.GetByOwner<Customer>(user.Id).ConfigureAwait(false);

    if(customer.Id === CustomerId) {

         if(await CanSendMessage(CustomerId, ConversationId).ConfigureAwait(false))) {
             await StreamProcess.ConversationMessage(CreateMessage(CustomerId, ConversationId, message));

             return await arbiter.GetConversationMessagesByConversationId(ConversationId);
         }
    }

    return new List<ConversationMessage>();
}