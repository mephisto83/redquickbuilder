
            if(result && !await new {{attribute_type}}({{attribute_type_arguments}}).IsOk(value{{model_property}}))
            {
                result = false;
            }
