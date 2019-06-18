
    public class {{agent}}Exceptions
    {
        public static void ThrowException(StagedResponse change)
        {
            if(change.ValidationFailure) 
            {
                throw new ValidationException {
                    Response = change
                };
            }
            if(change.ExceptionRaised)
            {
                throw new ThrownException 
                {
                    Response = change
                };
            }
        }
    }