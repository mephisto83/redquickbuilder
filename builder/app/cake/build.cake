var target = Argument("target", "Default");
var workSpace = Argument("WorkSpace", "workspace.json");
Task("Default")
  .Does(() =>
{
  Information("Hello World!");
});

Task("ReactNative")
  .IsDependentOn("InstallNPM")
  .Does(()=>{

        if(workSpace == string.Empty) {
            Information("Work space is empty");
            throw new Exception("Work space argument is empty");
        }
        else { 
            var exitCodeWithArgument = StartProcess("node", new ProcessSettings{ Arguments = "build.js createReactNative" });
            // This should output 0 as valid arguments supplied
            Information("Exit code: {0}", exitCodeWithArgument);
        }
  });

Task("InstallNPM")
  .Does(()=>{
    StartProcess("powershell" , new ProcessSettings { 
      Arguments = "npm install"
    });
  });
Task("CreateWorkSpace")
    .IsDependentOn("InstallNPM")
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