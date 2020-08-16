
        [Route("{{http_route}}{{parameter_route}}")]
        [{{http_method}}]
        public async Task<ActionResult<{{output_type}}>> {{functionName}}({{parameters}})
        {
            var maestro = RedStrapper.Resolve<{{maestro_interface}}>();
            try
            {
                var result = await maestro.{{maestro_function}}({{user_instance}}, {{parameter_values}});

                return Ok(result);
            }
            catch (ValidationException validationException)
            {
                return StatusCode(RedActionResult.ValidationError(), validationException);
            }
            catch (ThrownException thrownException)
            {
                return StatusCode(RedActionResult.ThrownException(), thrownException);
            }
            catch (PermissionException permissionException)
            {
                return StatusCode(RedActionResult.PermissionError(), permissionException);
            }
            catch (InvalidAgentException invalidAgentException)
            {
                return StatusCode(RedActionResult.InvalidAgentError(), invalidAgentException);
            }
            catch(Exception)
            {
                return StatusCode(500);
            }
        }
