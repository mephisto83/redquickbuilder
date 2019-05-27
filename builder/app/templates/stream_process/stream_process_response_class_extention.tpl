public class {{model}}Response : StagedResponse
{
    {{constructors}}
    {{properties}}

    public static {{model}}Response Failed({{model}}Change change, changeType) {
        return new {{model}}Response {
            Response = change.Response,
            ChangeType = changeType,
            Failed = true
        }
    }
}