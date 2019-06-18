
        [Route("{{http_route}}")]
        [{{http_method}}]
        public async Task<ActionResult<{{output_type}}>> {{functionName}}([FromBody] {{input_type}} obj)
        {       
            var maestro = RedStrapper.Resolve<{{maestro_interface}}>();
            try
            {
                var result = await maestro.{{maestro_function}}({{user_instance}}, obj).ConfigureAwait(false);

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
