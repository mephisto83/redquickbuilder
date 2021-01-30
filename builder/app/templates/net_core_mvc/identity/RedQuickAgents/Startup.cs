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
using {{namespace}}.Resources;
using Swashbuckle.AspNetCore.Swagger;
using RedQuick.Util;
using Autofac;
using {{namespace}}.Controllers;
using {{namespace}}.Permissions;
using {{namespace}}.Interface;
using {{namespace}}.Executors;
using {{namespace}}.ActionStream;
using {{namespace}}.Validations;

namespace {{namespace}}.Agent.Web
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton<LocService>();
            services.AddSingleton<IStringLocalizerFactory, StringLocalizerFactory>();
            services.AddSingleton<IStringLocalizer, StringLocalizer>();
            services.AddSingleton<IViewLocalizer, ViewLocalizer>();
            services.AddSingleton<IHtmlLocalizerFactory, HtmlLocalizerFactory>();

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
            });

            // DI
            services.AddSingleton<IRedEmailSender,  RedEmailSender>();
            // Register the Swagger generator, defining 1 or more Swagger documents
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "My API", Version = "v1" });
            });
            RedStartUp.ConfigurationServices<{{model}}>(services);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseStaticFiles();
            // Enable middleware to serve generated Swagger as a JSON endpoint.
            app.UseSwagger();

            // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.),
            // specifying the Swagger JSON endpoint.
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
            });

            RedStartUp.Configure(app, env);
            // app.Run(async (context) =>
            // {
            //     await context.Response.WriteAsync("Hello World!");
            // });
        }
    }
}
