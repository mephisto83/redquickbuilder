using CommandLine;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace ImageResizer
{
    class Program
    {

        public class Options
        {
            [Option('f', "folder", Required = true, HelpText = "Folder with files.")]
            public string Folder { get; set; }
            [Option('o', "output", Required = true, HelpText = "Output folder with files.")]
            public string Output { get; set; }
            [Option('w', "width", Required = true, HelpText = "Max image output width.")]
            public int Width { get; set; }
            [Option('h', "height", Required = true, HelpText = "Max image output height.")]
            public int Height { get; set; }
        }

        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");
            Parser.Default.ParseArguments<Options>(args)
              .WithParsed<Options>(opts => RunOptionsAndReturnExitCode(opts))
              .WithNotParsed<Options>((errs) => HandleParseError(errs));
        }

        private static void HandleParseError(IEnumerable<Error> errs)
        {
            throw new NotImplementedException();
        }

        private static void RunOptionsAndReturnExitCode(Options opts)
        {
            var files = Directory.GetFiles(opts.Folder).ToList();
            var outputFolder = opts.Output;
            if (!Directory.Exists(opts.Output))
            {
                Directory.CreateDirectory(opts.Output);

            }

            ImageResize.ResizeImages(files, opts.Output, opts.Height, opts.Width, "image/jpeg");
        }
    }
}
