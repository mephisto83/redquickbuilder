    public class {{model}}ChangeBy{{agent_type}} : StagedChanged
    {
        public {{model}} Data { get; set; }
        public string NextPath { get; set; }

        public static void  UpdatePath({{model}}ChangeBy{{agent_type}} parameters, string nextPath) {
          parameters.NextPath = nextPath;
        }

{{updates_with}}
{{constructors}}

    }
