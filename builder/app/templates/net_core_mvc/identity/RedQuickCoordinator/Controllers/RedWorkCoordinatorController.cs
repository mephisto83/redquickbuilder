using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RedQuick.Util;
using RedQuickCore.BackgroundAgent;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace {{namespace}}.Coordinator.Controllers
{
    [ApiController]
    [Route("work")]
    public class RedWorkCoordinatorController : WorkerController
    {
        ILogger<RedWorkCoordinatorController> logger;
        public RedWorkCoordinatorController(WorkerMinisterMessageChannel _ministerChannel, ILogger<RedWorkCoordinatorController> _logger)
            :base(_ministerChannel)
        {
            logger = _logger;
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<RefreshResult> Refresh([FromBody] WorkerMinisterMessage message, CancellationToken stoppingToken)
        {

            logger.LogInformation("Refreshing request received");

            Task<RefreshResult> res = await Handle<RefreshResult>(message, stoppingToken);

            return await res;
        }
        
        [AllowAnonymous]
        [HttpPost("request/address")]
        public async Task<AgentReply> RequestAddress([FromBody] AgentRequest request, CancellationToken stoppingToken)
        {
            var res = await Handle<AgentReply>(WorkerMinisterMessage.Create(request), stoppingToken);
            return await res;
        }
        
        [AllowAnonymous]
        [HttpPost("die")]
        public async Task<DyingResult> Dying([FromBody] WorkerMinisterMessage message, CancellationToken stoppingToken)
        {
            await Handle<DyingResult>(message, stoppingToken, true);

            return DyingResult.Dying();
        }
    }
}
