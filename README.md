# red-quick-builder
Red Quick builder 

Building Native IOS, Android and Web apps from a mind map.

## Ceremony Template parts

* {{model}}

   Model represents the Type of Model which will be the output. In this case it should return a list of that type.

* {{function.codeName}}

   Is the function named given in the UI.

* {{user}}

  The Object type that represents a User. This is the user that would be connected directly to Identity Providers.

* {{user_instance}}

  The instance of the Object that represents a User.

* {{resourceHead}}

   The resourceHead in this case is an object that represents the collective object. Like a Conversation Object with respect to ConversatiionMessage objects, would mean that the Conversation is the resourceHead. It would carry the information about what is happening in the conversation, but not the individual messages.

* {{resource_identifier}}

  The id of the resource. So a string/Guid. Finding a resourceHead with a single id should be all that is required.

* {{value_type}}

   The type of value.

* {{value}}

   The value can be of any type.

* {{agent_type_instance}}

  Using the {{user_instance}} retrieving the agent will follow a regular pattern.

* {{AgentType}}

   The type of agent that will be "performing" the action.

* {{user_id}}

   The user id of the logged in user.

* {{determining_property}}

   The property that can be used to filter the final results for this type of function.

* {{determining_function}}

   A function that can be used to filter the final results for this type of function.

## Ceremonies

Defining common patterns used in RedQuick. These patterns aren't exclusive to RedQuick at all. So writing them out, to use as templates is a worth while activity.

### Create/Parent-Child/Agent/Value

        //Original Version.
        public async Task<IList<ConversationMessage>> SendMessageToConversation(User user, string ConversationId, string message) { 

            var customer = await arbiter.GetByOwnerId<Customer>(user.Id);

            if(await CanSendMessage(customer.Id , ConversationId).ConfigureAwait(false))) {

                await StreamProcess.ConversationMessage(CreateMessage(customer.Id , ConversationId, message));

                return await arbiter.GetConversationMessagesByConversationId(ConversationId);
            }
            return new List<ConversationMessage>();
        }

        // The templated version.        
        public async Task<IList<{{model}}>> {{function.codeName}}({{user}} {{user_instance}}, {{resourceHead_type}} {{resourceHead}}, {{value_type}} {{value}}) { 

            var {{agent_type_instance}} = await arbiter.GetByOwnerId<{{AgentType}}>({{user_id}});

            if(await Can{{function.codeName}}({{agent_type_instance}}.Id , {{resourceHead}}).ConfigureAwait(false))) {

                await StreamProcess.{{model}}({{model}}Change.Create{{model}}({{agent_type_instance}}.Id , {{resourceHead}}, {{value}}));

                return await arbiter.GetBy<{{model}}(conversationMessage => conversationMessage.{{determining_property}} == resourceHead);
            }
            return new List<{{model}}>();
        }
        
        Required Node links : model, user, resourceHead_type, value_type, AgentType, determining_property
        Required Functions: Can{{codeName}}, {{model}}Change.Create{{model}}
        Required Classes: {{model}}Change

### Create/Object/Agent/Value

        //Original Version.
        public async Task<IList<Conversation>> CreateConversation(User user, Conversation conversation) { 

            var customer = await arbiter.GetByOwnerId<Customer>(user.Id);

            if(await CanCreateConversation(customer.Id).ConfigureAwait(false))) {

                await StreamProcess.Conversation(CreateConversation(customer.Id , conversation));

                return await arbiter.GetBy(conversation => conversation.Participants.Contains(customerId));
            }
            return new List<Conversation>();
        }

        // The templated version.        
        public async Task<IList<{{model}}>> {{function.codeName}}({{user}} {{user_instance}}, {{value_type}} {{value}}) { 

            var {{agent_type_instance}} = await arbiter.GetByOwnerId<{{AgentType}}>({{user_id}});

            if(await Can{{function.codeName}}({{agent_type_instance}}.Id).ConfigureAwait(false))) {

                await StreamProcess.{{model}}({{model}}Change.Create{{model}}({{agent_type_instance}}.Id , {{value}}));

                // return await arbiter.GetBy<{{model}}(conversationMessage => conversationMessage.{{determining_property}} == resourceHead);
                return await arbiter.GetBy<{{model}}({{determining_function}});   
            }
            return new List<{{model}}>();
        }
        
        Required Node links : model, user, value_type, AgentType, determining_property
        Required Functions: Can{{codeName}}, {{model}}Change.Create{{model}}
        Required Classes: {{model}}Change


### Can{{function.codeName}} //CanSendMessage
        
        //Object/Enumerable/ContainsCheckForValue

        //Used like
        if(await Can{{function.codeName}}({{agent_type_instance}}.Id , {{resourceHead}}).ConfigureAwait(false))) {


        public async Task<bool> CanSendMessage(string id, string resourceHeadId) {
            if(arbiter != null) { 
                var resourceHead = await arbiter.Get<Conversation>(resourceHeadId);

                if(resourceHead != null && resourceHead.Participants !== null && resourceHead.Participants.Contains(id)) {
                    return true;
                }
            }
            return false;
        }
        
        //assumes identifier properties are strings.
        public async Task<bool> Can{{function.codeName}}(string {{agent_id}}, string {{resource_id}}) {
            var {{resource}} = await arbiter.Get<{{resourceType}}>({{resource_id}});

            if({{resource}}.{{defining_property}}.Contains(agent_id)) {
                return true;
            }

            return false;
        }

### {{model}}Change.Create{{model}}({{agent_type_instance}}.Id , {{resourceHead}}, {{value}}) // ConversationMessageChange.CreateConversationMessage

        // Identifing the agent and parent object are the only crucial parts.
        // This would be better if the "string message' was "ConversationMessage message"
        public ConversationMessageChange CreateConversationMessage(string participantId, string conversationId, string message) {
            return new ConversationMessageChange {
                StreamType = "ConversationMessage",
                Response = Guid.NewGuid(),
                Participant = participant,
                Conversation = conversationId,
                ConversationMessage = message
            }
        }
        
        //The better version.
        public ConversationMessageChange CreateConversationMessage(string participantId, string conversationId, ConversationMessage message) {
            return new ConversationMessageChange {
                StreamType = "ConversationMessage",
                Response = Guid.NewGuid(),
                Participant = participant,
                Conversation = conversationId,
                ConversationMessage = message
            }
        }