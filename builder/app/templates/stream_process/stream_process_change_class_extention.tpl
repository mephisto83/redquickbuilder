    public class {{model}}ChangeBy{{agent_type}} : StagedChanged
    {
        public {{model}} Data { get; set; }
{{updates_with}}
{{constructors}}
        
    }