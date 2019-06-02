var target = Argument("target", "Default");
var workSpace = Argument("WorkSpace", "workspace.json");
Task("Default")
  .Does(() =>
{
  Information("Hello World!");
});


Task("CreateWorkSpace")
    .Does(() => {
        if(workSpace == string.Empty) {
            Information("Work space is empty");
            throw new Exception("Work space argument is empty");
        }
        else { 
            var exitCodeWithArgument = StartProcess("node", new ProcessSettings{ Arguments = "build.js createworkspace" });
            // This should output 0 as valid arguments supplied
            Information("Exit code: {0}", exitCodeWithArgument);
        }
    });

RunTarget(target);