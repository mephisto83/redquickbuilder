# RedQuickBuilder

## Intro

1. Who are you
	1. Andrew Porter
	1. Software Engineer
	1. Minnesota
1. What are you doing
	1. State the problem
		1. I want to execute my "what if ideas" faster.
		1. I want to be able to execute other people's ideas faster
		1. I want to build complete solutions that can scale to millions of users.
			1. Why not billions.
				1. I can solve those problems later.
1. State the solution
	1. The solution is abnoxiously large
	1. RedQuickBuilder
        1. Is an application which can produce applications from a visual graph representation. It is capabable of producing apps for different devices. The intention is to be able to generate apps for all sorts of different UI situations.
            1. Web
            1. Native Mobile
            1. Desktop
            1. VR (not yet realized)
            1. AR (not yet realized)
		1. Models
			1. Represent ideas.
				1. The may represent 
					1. people or personas
					1. Things
		1. Properties
			1. The things that keep information about the models.
			1. The may represent connections between models.
			1. The may represent abstract concepts that only make sense within the context of the application.
		1. Controllers 
			1. Are the same controllers that exist in most .net core web api based applications.
			1. Why use an API
				1. Multiple UIs can use the same UI, instead of generating html or whatever for the client side to render.
			1. Controllers Do
				1. Authentication
					1. Bearer Tokens 
				1. Authorization
					1. Business rules guide who can do what and when
				1. Execution
					1. Executing the logic 
					1. Eliminating Race conditions
				
			1. Filtering
				1. Filtering based on business rules
		1. Views
			1. Building basic UIs
		1. Language
			1. Building a title service to deliver content in the language of choice.
		1. Scaling
			1. Scaling the processing of commands, without losing the ability to guarentee no model is manipulated twice by the same
1. Architecture
    1. Output architecture
        1. RedQuickBuilder's goal is to generate applications, but those applications are designed to be generated in a way that seems human written. So, names of screens, properties and variables, hopefully will give the impression of following along with the application's designer's intentions.
        1. Front End
            1. Client Apps
                1. Web
                    1. React
                        1. The current iterations of web apps generated with React come with:
                            1. redux
                            1. redux-thunk
                            1. typescript
                            1. A lot more but the aforementioned are the most important.
                        1. Architecture of the React app.
                            1. App.tsx
                            ```tsx
                            import React, { Fragment } from 'react';
                            // ... more imports

                            let store = createStore(createRootReducer(history), applyMiddleware(thunk));

                            const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

                            render(
                            <AppContainer>
                                <Root store={store} history={history} />
                            </AppContainer>,
                            document.getElementById('root')
                            );
                            ```
                            1. Root.tsx
                            ```tsx
                            const Root = ({ store, history }: Props) => (
                                <Provider store={store}>
                                    <ConnectedRouter history={history}>
                                        <Routes />
                                    </ConnectedRouter>
                                </Provider>
                            );

                            ```
                            1. Routes.tsx, is the first place where application code will appear. Application screens are setup of here with their routes, and will be lazy loaded by default. The RedQuickBuilder will be able to setup custom loading screens or they can be added later in the <Suspense /> section.
                            ```tsx
                            import React, { Suspense, lazy } from 'react';
                            import { Switch, Route } from 'react-router';
                            import routes from './constants/routes';
                            import { ViewModelKeys } from './viewmodel_keys';
                            import * as DC from './actions/data-chain';
                            import App from './containers/App';
                            import { setParameters } from './actions/redutils';
                            import fetchservice from './util/fetchService';

                            // Lazy load and import modules
                            const AuthorizedDashboard = lazy(() => import('./screens/authorizedDashboard'));
                            /* All the application specific loads would be here. */
                            const AuthenticatedHome = lazy(() => import('./screens/authenticatedHome'));
                            
                            // Initializes some things for the service.
                            fetchservice();

                            export default () => (
                            <App>
                                <Suspense fallback={<div>Loading...</div>}>
                                <Switch>
                                /* 
                                    All the routes would be here.
                                */
                                    <Route path={routes.HomeView} render={({ match, history, location }: any) => {
                                        console.log(match.params);
                                        let {} = match.params;
                                        
                                        setParameters({});
                                        return <HomeView  />}} />
                                    <Route path={routes.InsuranceProviderUpdateManagementAgent} render={({ match, history, location }: any) => {
                                        console.log(match.params);
                                        let {model,viewModel = ViewModelKeys.InsuranceProviderUpdateManagementAgent} = match.params;
                                        viewModel = DC.insuranceProviderUpdateManagementAgent.GetInsuranceProviderUpdateManagementAgentviewmodel();
                                        setParameters({model,viewModel});
                                        return <InsuranceProviderUpdateManagementAgent model={model} viewModel={viewModel} />}} />
                                /* 
                                    All the routes would be here.
                                */
                                </Switch>
                                </Suspense>
                            </App>
                            );

                            ```
                                1. setParameters
                                    1. In the example above setParameters are executed when navigated to the screen. The parameters are pulled from the url on navigation, and set so that components can grab them for use. Not every screen has a parameter, but they all will execute that function. The idea being that if you want to add them later manually, it should be really easy.
                                    1. You may notice that the viewModel is being pull from the *match.params*, but it is being immediately overridden by a function call. If we were writing this manually that wouldn't ever happen, but since this is being generated from a graph things like this happen. Since, it won't cause any known issues, its a low priority to fix at the moment. 
                1. Desktop
                    1. Electron App using React
                1. Native Mobile
                    1. React Native
                1. VR
                    1. Unreal Engine using React(TBI)
                        1. This is vaporware currently. The idea is to run the V8 engine inside Unreal on a Headset. So, that a javascript application can be implemented to run the applicatio. This will also require a render for placing components inside the virual environment.
                        1. Unreal.js is a potential avenue for getting React into VR, and being able to lower the threshold for web developers to create real VR apps for the general public without having to learn  C++. This hasn't been fully researched so its still just a hopeful idea.
                1. AR
        1. Back End
            1. Server side
1. Graph
	1. The graph is the document that describes the application in terms of nodes and links.
	1. Nodes
		1. Nodes have properties that describe the node. There are lots of potential properties, and the majority are used for specific purposes depending on context.
		1. Required Properties
			1. NodeTypes
	1. Links
		1. Links describe relationships between nodes using properties attached to the link. 
		1. Generally links have types, and properties that may describe specific relationships.
			1. Example: A Model node references Property node with a link with the link type 'property-link'.
		
1. Models
	1. Modeles encapsulate concepts that are pertinent to the application.
		1. Models may be related to the functionality of the application or the operation of the application.
			1. Operation
				1. Models may describe User objects or other concepts used for logging in.
		1. Models can be Agents, Users or neither.
			1. Users are the actual accounts used by the system for logging in.
				1. Users may have multiple agents, and therefore can perform different actions based on their roles, and possible see more of less data in their UIs.
			1. Agents are personas that users may use to execute functionality with in the application.
				1. Example:
					1. A 'Customer' may be an Agent which performs operations on behalf of the User.
		1.	Models have properties.
			1. There are default properties which will exist on every model, but don't necessarily appear in the RedQuickBuilder UI.
			1. Default Properties
				1. Owner
				1. Updated
				1. Id
				1. Created
				1. Deleted
				1. Version
			1. The default properties will afford the system assumptions that can be made to implement features such as:
				1. constrained concurrency
					1. Guarenteeing that no race conditions can occur with a unique model instance.
				1. model versioning
					1. Reconciliation
				1. un-deletion.
		1. Referencing other models
			1. Models can reference other models by describing them as logical children.
				1. References are kept on the referenced model type as a string property with the Id of the model on a property named as the Model's name.
					1. Example.
						1. School has a child of ClassRoom, then ClassRoom has a property called School.
				1. If the model needs to encapsulate a Many to Many relationship, an intermediate Model can hold the references to the Models it is connecting. This also give an opportunity to keep more data describing the relationship on the intermediate model.
1. Properties
	1. Properties give models meaning. They have types which can be simple, like int, string, DateTime or they can be complex reference types.
	1. Models are almost always connected to properties.
	1. Attributes that are connected to properties, give clues to the expectations of the property.
		1. Example: An attribute with an Email type, suggests that the property will have to have a string with a valid email address.
		1. Attributes effects can be seen in the client and server side of the applications. The validation sections of the applications will generate code that enforce these attributes. The client side of the application will also attempt to enforce the rules descibed by the attributes.
		1. There are no limits to the number of attributes that can be applied to a property, but if they attributes contradict the type of property, build or runtime errors may occur.
1. Agent Access
	1. Purpose
		1. Describes how screens will be generated
		1. Describes which Agents can access screens.
		1. Describes functions for loading screens,
		1. Describes actions that can occur on the screens.
	1. Dashboard Screens
		1. Dashboard screens are meant as screens that direct "traffic" from on form to the next. At least at the time of this writing.
	1. Agent Screens
		1. Agent screen are meant for forms that the Agents can use to Update, Create or View Data.     
	