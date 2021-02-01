using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Mvc.Localization;
using Microsoft.Extensions.Localization;
using RedQuickCore.Identity;
using RedQuickCore.Interfaces;
using {{namespace}}.Models;
using Swashbuckle.AspNetCore.Swagger;
using RedQuick.Util;
using RedQuickCore.Worker;
using Autofac;
using {{namespace}}.Controllers;
using {{namespace}}.Permissions;
using {{namespace}}.Interface;
using {{namespace}}.Executors;
using {{namespace}}.ActionStream;
using {{namespace}}.Validations;

namespace {{namespace}}.Coordinator.Web
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
           
            RedStartUp.ConfigureRedAgentCenterServices(services);
            RedStrapper.Add(builder =>
            {
                builder.RegisterType<ClaimService>().As<IClaimService<{{model}}>>();
                builder.RegisterType<StreamProcessOrchestration>().As<IStreamProcessOrchestration>();
                builder.RegisterType<ClaimService>().As<ICreateUser>();
                {{maestro_registrations}}
                {{permission_registrations}}
                {{executor_registrations}}
                {{orchestration_registrations}}
                {{validation_registrations}}
                
                builder.RegisterType<StreamTypeService>().As<IStreamTypeService>();
                builder.RegisterType<StreamTypeService>().As<IWorkTaskService>();
                builder.RegisterType<StreamTypeService>().As<IWorkDistributionService>();
            });


            // Register the Swagger generator, defining 1 or more Swagger documents
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Red Quick Coordinator", Version = "v1" });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
           
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "RedQuickAgentExample v1"));
            }
            RedStartUp.ConfigureRedAgentCenter(app);
        }
    }
}
