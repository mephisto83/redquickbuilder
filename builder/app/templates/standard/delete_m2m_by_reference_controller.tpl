
        [Route("{{http_route}}/{m2m_reference}/{selection_ref_id}")]
        [{{http_method}}]
        public async Task<ActionResult<{{output_type}}>> {{functionName}}(string m2m_reference, string selection_ref_id)
        {       
            var maestro = RedStrapper.Resolve<{{maestro_interface}}>();
            try
            {
                var result = await maestro.{{maestro_function}}({{user_instance}}, m2m_reference, selection_ref_id).ConfigureAwait(false);

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
