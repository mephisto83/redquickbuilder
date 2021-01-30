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
    public class RedWorkCoordinatorController : Controller
    {
        WorkerMinisterMessageChannel ministerChannel;
        ILogger<RedWorkCoordinatorController> logger;
        IBackgroundReplyService backgroundReplyService;
        public RedWorkCoordinatorController(WorkerMinisterMessageChannel _ministerChannel, ILogger<RedWorkCoordinatorController> _logger)
        {
            logger = _logger;
            ministerChannel = _ministerChannel;
            backgroundReplyService = RedStrapper.Resolve<IBackgroundReplyService>();
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
        [HttpPost("die")]
        public async Task<DyingResult> Dying([FromBody] WorkerMinisterMessage message, CancellationToken stoppingToken)
        {
            await Handle<DyingResult>(message, stoppingToken, true);

            return DyingResult.Dying();
        }

        private async Task<Task<T>> Handle<T>(WorkerMinisterMessage message, CancellationToken stoppingToken, bool nowait = false)
        {
            var internalId = Guid.NewGuid().ToString();
            message.InternalRequestId = internalId;
            if (!nowait)
            {
                var res = backgroundReplyService.RegisterWait(internalId, (T result) =>
            {
                return result;
            });
                await ministerChannel.Writer.WriteAsync(message, stoppingToken);
                return res;
            }

            else
            {
                await ministerChannel.Writer.WriteAsync(message, stoppingToken);
                return default(Task<T>);
            }
        }
    }
}
