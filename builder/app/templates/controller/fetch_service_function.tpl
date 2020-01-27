
        [Route("{{http_route}}")]
        [{{http_method}}]
        public async Task<ActionResult<{{output_type}}>> {{functionName}}([FromBody] IDictionary<string, FetchParameters> obj)
        {
            try
            {
                var result = {{output_type}}.Create();
{{set_outputs}}
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
            catch(Exception)
            {
                return StatusCode(500);
            }
        }
