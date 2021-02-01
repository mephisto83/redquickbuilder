    public class {{model}}ChangeBy{{agent_type}} : GenericStageChanged<{{model}}>
    {
        public string NextPath { get; set; }
        static IWorkTaskService WorkTaskService;
        public static void  UpdatePath({{model}}ChangeBy{{agent_type}} parameters, string nextPath) {
          parameters.NextPath = nextPath;
        }

{{updates_with}}
{{constructors}}

    }
