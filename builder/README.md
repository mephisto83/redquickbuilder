# Red Builder 2


## Steps

1. Add User Model
    1. The model that is used for login, all agents will be connected to a user.
    1. One user per person.
1. Add Agent Models
    1. These are personas that users will interact with the system.
1. Add Models
    1. Customers, Manager
1. Add Properties
    1. Name, Description ...
1. Add Connections Between Models
    1. Add relationships between models
    1. Parent - Child
    1. Many to Many
1. Add View Type Nodes
    1. Add types for each connection between the models.
1. Create a claims Service
    1. Add to agent.
    1. It is used when logging/registration.
    1. It will add properties to the claims object that is generated login.
    1. Those claims are used to recreate the user object, that is used when executing a function in the controller.
1. Create Views
    1. Build view for models
    1. All GetALL views need to have filters attached.
1. Create Shared Views
    1. Build shared views for the relationships between models.
1. Create Login Screen
1. Create Configuration Node
1. Create APIs
    1. Models that require management will need basic CRUD functionality
    1. Depending on which Agents can interact, different methods need generation.
1. Update Post Authenticate Data Chain to go to the HomePage/Dashboard. "Select Target Screen"
1. Fetch Service
    1. Create Fetch Service Node
    1. Create Fetch Parameter Model
    1. Add Fetch Service compatible functions
        1. Quick methods
        1. Agent Based Methods
        1. Connect to Fetch Parameters Model
    1. Create Fetch Output Model
        1.  Operation => Setup Fetch Result

