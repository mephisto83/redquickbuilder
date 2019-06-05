        public static {{model}}Response {{method}}({{parameters}}) {
            var result = new {{model}}Response();

            {{parameters_property}}

            return result;
        }
        
        public static {{model}}Response {{method}}Failed({{model}}Change change) {
            return new {{model}}Response {
                Response = change.Response,
                ChangeType = change.ChangeType,
                Failed = true
            }
        }