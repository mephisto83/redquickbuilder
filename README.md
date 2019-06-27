# red-quick-builder
Red Quick builder 

Building Native IOS, Android and Web apps from a mind map.


## Class, CRUD and Result combinations.

* Create/Parent-Child/Agent/Value => IList<Child>
   * Update
   * Delete
   * Get
* Create/Object/Agent/Value => IList<Object>
   * Update
   * Delete
   * Get
* Create/Parent-Child/Agent/Value => Child
   * Update
   * Delete
   * Get
* Create/Object/Agent/Value => Object
   * Update
   * Delete
   * Get

## Ceremony Template parts

* {{model}}

   Model represents the Type of Model which will be the output. In this case it should return a list of that type.

* {{function_name}}

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

### Create/Parent-Child/Agent/Value => IList<Child>

A set of crud functions with a return value of the list of child type objects.

        //Original Version.
        public async Task<IList<ConversationMessage>> SendMessageToConversation(User user, string ConversationId, string message) { 

            var customer = await arbiter.GetOwnedBy<Customer>(user.Id);

            if(await CanSendMessage(customer.Id , ConversationId).ConfigureAwait(false))) {

                await StreamProcess.ConversationMessage(CreateMessage(customer.Id , ConversationId, message));

                return await arbiter.GetConversationMessagesByConversationId(ConversationId);
            }
            return new List<ConversationMessage>();
        }

        // The templated version.        
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{resourceHead_type}} {{resourceHead}}, {{value_type}} {{value}}) { 

            var {{agent_type_instance}} = await arbiter.GetOwnedBy<{{AgentType}}>({{user_id}});

            if(await Can{{function_name}}({{agent_type_instance}}.Id , {{resourceHead}}).ConfigureAwait(false))) {

                await StreamProcess.{{model}}({{model}}Change.{{function_name}}({{agent_type_instance}}.Id , {{resourceHead}}, {{value}}));

                return await arbiter.GetBy<{{model}}(conversationMessage => conversationMessage.{{determining_property}} == resourceHead);
            }
            return new List<{{model}}>();
        }
        
        Required Node links : model, user, resourceHead_type, value_type, AgentType, determining_property
        Required Functions: Can{{codeName}}, {{model}}Change.{{function_name}}
        Required Classes: {{model}}Change

        //Single Object parameter
        //{{function_name}}Parameters
        //Single Object Parameter Version.
        public async Task<IList<ConversationMessage>> SendMessageToConversation(User user, ConversationMessasge message) { 

            var customer = await arbiter.GetOwnedBy<Customer>(user.Id);
            if(await CanCustomerSendMessage(customer.Id , message).ConfigureAwait(false))) {
                var conversationMessageChangeParameters = CreateConversationMessageParameters.Create(customer, message);
                var conversationMessageChange = ConversationMessageChange.CreateMessage();
                await StreamProcess.ConversationMessage(conversationMessageChange);

                return await arbiter.GetConversationMessagesByConversationId(ConversationId);
            }
            return new List<ConversationMessage>();
        }
#### Create function for a Model is IHasParentObject, User, Customer is IAgent, 
        
*Model* IHasParentObject ConversationMesage
*User* Login user
*Customer* IAgent
*Model's Parent Type* Conversation // This relationship must be established in the graph.
        
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

            var {{agent}} = await arbiter.GetOwnedBy<{{{AgentType}}>({{user}}.Id);
            if(await {{can.function_name}}({{agent}}, {{value}}).ConfigureAwait(false))) {
                var {{model}}Change = {{function_name}}Parameters.Create({{agent}}, {{value}});
                var {{model}}Change = {{model}}Change.Create({{model}}Change);
                await StreamProcess.{{model}}({{model}}Change);

                return await arbiter.GetBy<{{model}}>(x => x.{{determining_property}} == {{value}}.{{parentIdProperty}});
            }
            return new List<{{model}}>();
        }
        
The ConversationMessage is a IHasParentObject, which means that it is an object with a conceptual/logical parent. Which may or may not dictate certain behaviors.

The Customer class is assumed to be of Type IAgent/Agent. ConversationMessage will be assumed to be of type IAgentCreateable. Which means it will have an agent owner id. That will mean that each IAgentCreateable class will need to have a property that will be guarenteed to exist that will contain this Agent's id.

CreateConversationMessageParameters.Create will be able to create a CreateConversationMessageParameter object with an IAgentCreateable Type and IAgent/Agent. It should produce a class that looks like.

#### Update funcion for a Model is IHasParentObject, User, Customer is IAgent

*Model* IHasParentObject ConversationMesage
*User* Login user
*Customer* IAgent
*Model's Parent Type* Conversation // This relationship must be established in the graph.
        
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{value_type}} {{value}}) { 

            var {{agent}} = await arbiter.GetOwnedBy<{{{AgentType}}>({{user}}.Id);
            if(await {{can.function_name}}({{agent}}, {{value}}).ConfigureAwait(false))) {
                var {{model}}Change = {{function_name}}Parameters.Create({{agent}}, {{value}});
                var {{model}}Change = {{model}}Change.Update({{model}}Change);
                await StreamProcess.{{model}}({{model}}Change);

                return await arbiter.GetBy<{{model}}>(x => x.{{determining_property}} == {{value}}.{{parentIdProperty}});
            }
            return new List<{{model}}>();
        }

#### Delete funcion for a Model is IHasParentObject, User, Customer is IAgent

*Model* IHasParentObject ConversationMesage
*User* Login user
*Customer* IAgent
*Model's Parent Type* Conversation // This relationship must be established in the graph.
        
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{value_type}} {{value}}) { 

            var {{agent}} = await arbiter.GetOwnedBy<{{{AgentType}}>({{user}}.Id);
            if(await {{can.function_name}}({{agent}}, {{value}}).ConfigureAwait(false))) {
                var {{model}}Change = {{function_name}}Parameters.Create({{agent}}, {{value}});
                var {{model}}Change = {{model}}Change.Delete({{model}}Change);
                await StreamProcess.{{model}}({{model}}Change);

                return await arbiter.GetBy<{{model}}>(x => x.{{determining_property}} == {{value}}.{{parentIdProperty}});
            }
            return new List<{{model}}>();
        }


#### Get All funcion for a Model is IHasParentObject, User, Customer is IAgent

*Model* IHasParentObject ConversationMesage
*User* Login user
*Customer* IAgent
*Model's Parent Type* Conversation // This relationship must be established in the graph.
        
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{value_type}} {{value}}) { 

            var {{agent}} = await arbiter.GetOwnedBy<{{{AgentType}}>({{user}}.Id);
            if(await {{can.function_name}}({{agent}}, {{value}}).ConfigureAwait(false))) {
                return await arbiter.GetBy<{{model}}>(x => x.{{determining_property}} == {{value}}.{{parentIdProperty}});
            }
            return new List<{{model}}>();
        }

        
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{value_type}} {{value}}) { 

            var {{agent}} = await arbiter.GetOwnedBy<{{{AgentType}}>({{user}}.Id);
            if(await {{can.function_name}}({{agent}}, {{value}}).ConfigureAwait(false))) {
                return await arbiter.GetBy<{{model}}>(x => x.{{determining_property}} == {{value}}.{{parentIdProperty}});
            }
            return new List<{{model}}>();
        }
        







        public class CreateConversationMessageParameters {
            public string AgentId { get; set; }
            public ConversationMessage Data { get; set; }
        }

### Create/Object/Agent/Value => IList<Object>

        //Original Version.
        public async Task<IList<Conversation>> CreateConversation(User user, Conversation conversation) { 

            var customer = await arbiter.GetOwnedBy<Customer>(user.Id);

            if(await customerPermissions.CanCreateConversation(customer.Id).ConfigureAwait(false))) {

                await StreamProcess.Conversation(CreateConversation(customer.Id , conversation));

                return await arbiter.GetBy(conversation => conversation.Participants.Contains(customerId));
            }
            return new List<Conversation>();
        }

        // The templated version.        
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{value_type}} {{value}}) { 

            var {{agent_type_instance}} = await arbiter.GetOwnedBy<{{AgentType}}>({{user_id}});

            if(await Can{{function_name}}({{agent_type_instance}}.Id).ConfigureAwait(false))) {

                await StreamProcess.{{model}}({{model}}Change.{{function_name}}({{agent_type_instance}}.Id , {{value}}));

                // return await arbiter.GetBy<{{model}}(conversationMessage => conversationMessage.{{determining_property}} == resourceHead);
                return await arbiter.GetBy<{{model}}({{determining_function}});   
            }
            return new List<{{model}}>();
        }
        
        Required Node links : model, user, value_type, AgentType, determining_property
        Required Functions: Can{{codeName}}, {{model}}Change.{{function_name}}
        Required Classes: {{model}}Change


### Can{{function_name}} //CanSendMessage
        
        //Object/Enumerable/ContainsCheckForValue

        //Used like
        if(await Can{{function_name}}({{agent_type_instance}}.Id , {{resourceHead}}).ConfigureAwait(false))) {


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
        public async Task<bool> Can{{function_name}}(string {{agent_id}}, string {{resource_id}}) {
            var {{resource}} = await arbiter.Get<{{resourceType}}>({{resource_id}});

            if({{resource}}.{{determining_property}}.Contains(agent_id)) {
                return true;
            }

            return false;
        }
        
        Required Node links : agent_id, resource_id, determining_property
        Required Functions: Can{{codeName}}, {{model}}Change.{{function_name}}
        Required Classes: {{model}}Change

### {{model}}Change.{{function_name}}({{agent_type_instance}}.Id , {{resourceHead}}, {{value}}) // ConversationMessageChange.CreateConversationMessage

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


        public {{model}}Change {{function_name}}(string {{agent_id}}, string {{resourceHead}}, {{model}} {{value}}) {
            return new {{model}}Change {
                StreamType = "{{model}}",
                Response = Guid.NewGuid(),
                {{property*}} = {{agent_id}},
                {{resourceHead_type}} = {{resourceHead}},
                {{model}}Object = {{value}}
            }
        }
        
        Required Node links : model, agent_id, resourceHead, value, property*, resourceHead_type
        Required Functions: {{model}}Change.{{function_name}}
        Required Classes: {{model}}Change


        //The even better version.
        public ConversationMessageChange CreateConversationMessage(CreateConversationParameters parameters) {
            return new ConversationMessageChange {
                StreamType = "ConversationMessage",
                Response = Guid.NewGuid(),
                CreateConversationParameters = parameters
            }
        }
        
        public {{model}}Change {{function_name}}({{function_name}}Parameters parameters) {
            return new {{model}}Change {
                StreamType = "{{model}}",
                Response = Guid.NewGuid(),
                {{function_name}}Parameters = parameters
            }
        }
        Required Node links : model
        Required Functions: {{model}}Change.{{function_name}}
        Required Classes: {{model}}Change


### Create/Object/Agent/Value => IList<Object>

A list of CRUD functions with a return function of a list of Objects.

        //Original Version.
        public async Task<IList<Conversation>> CreateConversation(User user, Conversation conversation) { 

            var customer = await arbiter.GetOwnedBy<Customer>(user.Id);

            if(await customerPermissions.CanCreateConversation(customer , conversation).ConfigureAwait(false))) {

                var parameters = ConversationChangeParameters.Create(customer, conversation);

                // The newConversation could be added to the result, if the caching option is used. then we wouldnt have to wait for the caching stream to complete.
                var newConversation = await StreamProcess.Conversation(parameters);

                // This is probably going to be pretty slow.
                return await arbiter.GetBy<Conversation>(x => x.Participants.Contains(customer.Id));
                // This might be a faster way.
                // Putting a cache of user conversations may be a 
                // var customerConversation = await arbiter.Get<CustomerConversations>(customer.Id);
                // var ids = customerConversations.Conversations.Select(x => x.Id);
                // return await arbiter.GetBy<Conversation>(x => ids.Contains(x.Id));

            }
            return new List<ConversationMessage>();
        }

        //Templated Version.
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

            var {{agent}} = await arbiter.GetOwnedBy<{{agent_type}>({{user_instance}}.Id);

            if(await {{agent_type}}Permissions.{{permission_function}}({{agent}} , {{value}}).ConfigureAwait(false))) {

                var parameters = {{model}}Change.Create({{agent}}, {{value}});

                await StreamProcess.{{model}}(parameters);

                // This is probably going to be pretty slow.
                return await arbiter.GetBy<{{model}}>(x => x.{{determining_property}}.Contains({{agent}}.Id));
                // This might be a faster way.
                // Putting a cache of user {{value}}s may be a 
                // var {{agent}}{{model}} = await arbiter.Get<{{agent_type}}{{model}}s>({{agent}}.Id);
                // var ids = {{agent}}{{model}}s.{{model}}s.Select(x => x.Id);
                // return await arbiter.GetBy<{{model}}>(x => ids.Contains(x.Id));

            }
            return new List<{{model}}>();
        }

        //Templated Version.
        public async Task<IList<{{model}}>> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

            var {{agent}} = await arbiter.GetOwnedBy<{{agent_type}>({{user_instance}}.Id);

            if(await {{agent_type}}Permissions.{{permission_function}}({{agent}} , {{value}}).ConfigureAwait(false))) {

                var parameters = {{model}}Change.Update({{agent}}, {{value}});

                await StreamProcess.{{model}}(parameters);

                // This is probably going to be pretty slow.
                return await arbiter.GetBy<{{model}}>(x => x.{{determining_property}}.Contains({{agent}}.Id));
                // This might be a faster way.
                // Putting a cache of user {{value}}s may be a 
                // var {{agent}}{{model}} = await arbiter.Get<{{agent_type}}{{model}}s>({{agent}}.Id);
                // var ids = {{agent}}{{model}}s.{{model}}s.Select(x => x.Id);
                // return await arbiter.GetBy<{{model}}>(x => ids.Contains(x.Id));

            }
            return new List<{{model}}>();
        }

        public class {{model}}Maestro() { 
            public {{model}}Maestro(I{{agent_type}}Permissions {{agent_type}}Permissions, IRedArbiter<{{agent_type}}> {{agent_type}}Arbiter, , IRedArbiter<{{model}}> {{model}}Arbiter) {

            }
        }


        
*(DeterminingProperty + IAgent) [ => ]=   x => x.{{determining_property}}.Contains({{agent}}.Id)*
sounds like
*(IAgent, IHasAllowedCollection) => checks(IHasAllowedCollection) for (IAgent.Id);*

await {{agent_type}}Permissions.{{permission_function}}({{agent}} , {{value}}, {{agent_type}}Permissions.CAN_SEND_MESSAGE).ConfigureAwait(false))
IAgent, IHasAllowedCollection

*  Given an Agent and Permission, determing the permission based on a role

        (IAgent, Permission) => {
            SWITCH(IAgent.Role) => {
                case Permission :>   true|false
            }
        }

* Given a Agent, determine if it can based on a role. (The sames as the previous)

        (IAgent) => { 
            SWITCH(IAgent.Role) => true
        }

* Given and Agent, determing if a property matches a value in a list. (The same as the previous) but with a list

        (IAgent) => {
            ValidValues.Contains(IAgent.[Property]) => true
        }

* Given an Agent, determine if a property doesn't match a value in the list, deny.

        (IAgent) => {
            InvalidValues.Contains(IAgent.[Property]) => false
        }

        *(IAgent, IHasAllowedCollection) => checks(IHasAllowedCollection) for (IAgent.Id);*

### Create/Object/Agent/Value => Object

        //Original Version.
        public async Task<Conversation> CreateConversation(User user, Conversation conversation) { 

            var customer = await arbiter.GetOwnedBy<Customer>(user.Id);

            if(await customerPermissions.CanCreateConversation(customer , conversation).ConfigureAwait(false))) {

                var parameters = ConversationChangeParameters.Create(customer, conversation);

                // The newConversation could be added to the result, if the caching option is used. then we wouldnt have to wait for the caching stream to complete.
                var newConversation = await StreamProcess.Conversation(parameters);

                // This is probably going to be pretty slow.
                return await arbiter.Get<Conversation>(newConversation.Id);
                // This might be a faster way.
                // Putting a cache of user conversations may be a 
                // var customerConversation = await arbiter.Get<CustomerConversations>(customer.Id);
                // var ids = customerConversations.Conversations.Select(x => x.Id);
                // return await arbiter.GetBy<Conversation>(x => ids.Contains(x.Id));

            }
            return null;
        }

        //Templated version.
        public async Task<{{model}}> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

            var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

            if(await {{agent_type}}Permissions.{{permission_function}}({{agent}} , {{value}}).ConfigureAwait(false))) {

                var parameters = {{model}}Change.Create({{agent}}, {{value}});

                var result = await StreamProcess.{{model}}(parameters);

                return await arbiter{{model}}.Get<{{model}}>(result.Id);
            }
            return null;
        }
### Update/Object/Agent/Value => Object

        //Original Version.
        public async Task<Conversation> UpdateConversation(User user, Conversation conversation) { 

            var customer = await arbiter.GetOwnedBy<Customer>(user.Id);

            if(await customerPermissions.CanUpdateConversation(customer , conversation).ConfigureAwait(false))) {

                var parameters = ConversationChangeParameters.Update(customer, conversation);

                // The newConversation could be added to the result, if the caching option is used. then we wouldnt have to wait for the caching stream to complete.
                var newConversation = await StreamProcess.Conversation(parameters);

                return await arbiter.Get<Conversation>(newConversation.Id);
            }
            return null;
        }

        //Templated version.
        public async Task<{{model}}> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

            var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

            if(await {{agent_type}}Permissions.CanUpdate{{model}}({{agent}} , {{value}}).ConfigureAwait(false))) {

                var parameters = {{model}}Change.Update({{agent}}, {{value}});

                var result = await StreamProcess.{{model}}(parameters);

                return await arbiter{{model}}.Get<{{model}}>(result.Id);
            }
            return null;
        }

### Get/Object/Agent/Value => Object

        //Original Version.
        public async Task<Conversation> GetConversation(User user, Conversation conversation) { 

            var customer = await arbiter.GetOwnedBy<Customer>(user.Id);

            if(await customerPermissions.CanGetConversation(customer , conversation).ConfigureAwait(false))) {

                return await arbiter.Get<Conversation>(newConversation.Id);
            }
            return null;
        }

        //Templated version.
        public async Task<{{model}}> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

            var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

            if(await {{agent_type}}Permissions.CanGet{{model}}({{agent}} , {{value}}).ConfigureAwait(false))) {
                return await arbiter{{model}}.Get<{{model}}>({{value}}.Id);
            }
            return null;
        }


### Delete/Object/Agent/Value => bool

        //Original Version.
        public async Task<Conversation> DeleteConversation(User user, Conversation conversation) { 

            var customer = await arbiter.GetOwnedBy<Customer>(user.Id);

            if(await customerPermissions.CanDeleteConversation(customer , conversation).ConfigureAwait(false))) {

                var parameters = ConversationChangeParameters.Delete(customer, conversation);

                // The newConversation could be added to the result, if the caching option is used. then we wouldnt have to wait for the caching stream to complete.
                var result = await StreamProcess.Conversation(parameters);

                // This is probably going to be pretty slow.
                return result.Value;
            }
            return false;
        }

        //Templated version.
        public async Task<{{model}}> {{function_name}}({{user}} {{user_instance}}, {{model}} {{value}}) { 

            var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

            if(await {{agent_type}}Permissions.CanGet{{model}}({{agent}} , {{value}}).ConfigureAwait(false))) {
                var parameters = {{model}}Change.Delete({{customer}}, {{value}});

                var result = await StreamProcess.{{model}}(parameters);

                return result.Value;
            }
            return null;
        }


### Create/Agent/Value => Agent

        //Templated version.
        public async Task<{{agent_type}}> Create{{agent_type}}({{user}} {{user_instance}}, {{agent_type}} {{value}}) { 

            if(await {{user}}Permissions.CanCreate{{agent_type}}({{user_instance}} , {{value}}).ConfigureAwait(false))) {

                var parameters = {{agent_type}}Change.Create({{user_instance}}, {{agent_type}});

                // The newConversation could be added to the result, if the caching option is used. then we wouldnt have to wait for the caching stream to complete.
                var result = await StreamProcess.{{user}}(parameters);

                // This is probably going to be pretty slow.
                return await {{agent_type}}Arbiter.Get<{{agent_type}>(result.Id);
            }

            return null;
        }


### Update/Agent/Value => Agent

        //Templated version.
        public async Task<{{agent_type}}> Update{{agent_type}}({{user}} {{user_instance}}, {{agent_type}} {{value}}) { 

            var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

            if(await {{agent_type}}Permissions.CanUpdate{{agent_type}}({{agent}} , {{value}}).ConfigureAwait(false))) {

                var parameters = {{agent_type}}Change.Update({{agent}}, {{value}});

                // The newConversation could be added to the result, if the caching option is used. then we wouldnt have to wait for the caching stream to complete.
                var result = await StreamProcess.{{agent_type}}(parameters);

                // This is probably going to be pretty slow.
                return await {{agent_type}}Arbiter.Get<{{agent_type}>(result.Id);
            }
            
            return null;
        }


### Get/Agent/Value => Agent

        //Templated version.
        public async Task<{{agent_type}}> Get{{agent_type}}({{user}} {{user_instance}}, {{agent_type}} {{value}}) { 

            var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

            if(await {{agent_type}}Permissions.CanGet{{agent_type}}({{agent}} , {{value}}).ConfigureAwait(false))) {

                var parameters = {{agent_type}}Change.Get({{agent}}, {{value}});

                // The newConversation could be added to the result, if the caching option is used. then we wouldnt have to wait for the caching stream to complete.
                var result = await StreamProcess.{{agent_type}}(parameters);

                // This is probably going to be pretty slow.
                return await {{agent_type}}Arbiter.Get<{{agent_type}>(result.Id);
            }
            
            return null;
        }

### Delete/Agent/Value => bool

        //Templated version.
        public async Task<bool> Delete{{agent_type}}({{user}} {{user_instance}}, {{agent_type}} {{value}}) { 

            var {{agent}} = await arbiter{{agent_type}}.Get<{{agent_type}}>({{user_instance}}.{{agent_type}});

            if(await {{agent_type}}Permissions.CanDelete{{agent_type}}({{agent}} , {{value}}).ConfigureAwait(false))) {

                var parameters = {{agent_type}}Change.Delete({{agent}}, {{value}});

                // The newConversation could be added to the result, if the caching option is used. then we wouldnt have to wait for the caching stream to complete.
                var result = await StreamProcess.{{agent_type}}(parameters);

                // This is probably going to be pretty slow.
                return result.Value;
            }
            
            return false;
        }

