
        [Route("{{http_route}}")]
        [{{http_method}}]
        public async Task<ActionResult<{{output_type}}>> {{functionName}}({{fetch_parameter}} fetch_parameter, int? skip = null, int? take = null, string sort = null, string filter = null)
        {
            var maestro = RedStrapper.Resolve<{{maestro_interface}}>();
            try
            {
                var queryParameters = new QueryParameters {
                    Skip = skip,
                    Take = take,
                    Sort = sort,
                    Filter = filter
                };

                var result = await maestro.{{maestro_function}}({{user_instance}}, fetch_parameter, queryParameters);

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
