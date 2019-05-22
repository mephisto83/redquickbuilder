# red-quick-builder
Red Quick builder 

Building Native IOS, Android and Web apps from a mind map.


## Ceremonies

Defining common patterns used in RedQuick. These patterns aren't exclusive to RedQuick at all. So writing them out, to use as templates is a worth while activity.


        public async Task<IList<ConversationMessage>> SendMessageToConversation(User user, string ConversationId, string message) { 

            if(await CanSendMessage(customer.Id , ConversationId).ConfigureAwait(false))) {

                await StreamProcess.ConversationMessage(CreateMessage(customer.Id , ConversationId, message));

                return await arbiter.GetConversationMessagesByConversationId(ConversationId);
            }
            return new List<ConversationMessage>();
        }

        // The templated version.        
        public async Task<IList<{{model}}>> {{function.codeName}}({{user}} {{user_instance}}, {{resourceHead_identifier}} {{resourceHead}}, {{value_type}} {{value}}) { 

            var {{agent_type_instance}} = await arbiter.GetByOwnerId<{{AgentType}}({{user_id}});

            if(await CanSendMessage({{agent_type_instance}}.Id , {{resourceHead}}).ConfigureAwait(false))) {

                await StreamProcess.{{model}}({{model}}Change.Create{{model}}({{agent_type_instance}}.Id , {{resourceHead}}, {{value}}));

                return await arbiter.GetBy<{{model}}(conversationMessage => conversationMessage.{{determining_property}} == resourceHead);
            }
            return new List<{{model}}>();
        }