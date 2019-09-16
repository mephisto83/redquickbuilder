using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Text;

namespace ImageResizer
{
    public class ImageResize
    {
        /// <summary>
        /// Resize the image to the specified width and height.
        /// </summary>
        /// <param name="image">The image to resize.</param>
        /// <param name="width">The width to resize to.</param>
        /// <param name="height">The height to resize to.</param>
        /// <returns>The resized image.</returns>
        public static Bitmap ResizeImage(Image image, int width, int height)
        {
            var destRect = new Rectangle(0, 0, width, height);
            var destImage = new Bitmap(width, height);

            destImage.SetResolution(image.HorizontalResolution, image.VerticalResolution);

            using (var graphics = Graphics.FromImage(destImage))
            {
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.CompositingQuality = CompositingQuality.HighQuality;
                graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                graphics.SmoothingMode = SmoothingMode.HighQuality;
                graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;

                using (var wrapMode = new ImageAttributes())
                {
                    wrapMode.SetWrapMode(WrapMode.TileFlipXY);
                    graphics.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
                }
            }

            return destImage;
        }

        public static void ResizeImages(IList<string> files, string folderOut, int maxWidth, int maxHeight, string mimeType)
        {
            foreach (var file in files)
            {
                if (File.Exists(file))
                {
                    var fileName = Path.GetFileName(file);
                    var imageFromFile = Image.FromFile(file);
                    var imgHeight = imageFromFile.Height;
                    var imgWidth = imageFromFile.Width;

                    // Figure out the ratio
                    double ratioX = (double)maxWidth / (double)imgWidth;
                    double ratioY = (double)maxHeight / (double)imgHeight;
                    // use whichever multiplier is smaller
                    double ratio = ratioX < ratioY ? ratioX : ratioY;

                    // now we can get the new height and width
                    int newHeight = Convert.ToInt32(imgHeight * ratio);
                    int newWidth = Convert.ToInt32(imgWidth * ratio);

                    var resizedImage = ResizeImage(imageFromFile, newWidth, newHeight);

                    Save(resizedImage, fileName, folderOut, mimeType);

                }
            }
        }
        private static void Save(Bitmap myBitmap, string fileName, string folder, string mimeType)
        {

            var myEncoder = System.Drawing.Imaging.Encoder.Quality;
            EncoderParameter myEncoderParameter;
            // for the Quality parameter category.
            var myImageCodecInfo = GetEncoderInfo(mimeType);
            var myEncoderParameters = new EncoderParameters(1);
            myEncoderParameter = new EncoderParameter(myEncoder, 100L);
            myEncoderParameters.Param[0] = myEncoderParameter;
            var path = Path.Combine(folder, fileName);
            myBitmap.Save(path, myImageCodecInfo, myEncoderParameters);
        }
        private static ImageCodecInfo GetEncoderInfo(String mimeType)
        {
            int j;
            ImageCodecInfo[] encoders;
            encoders = ImageCodecInfo.GetImageEncoders();
            for (j = 0; j < encoders.Length; ++j)
            {
                if (encoders[j].MimeType == mimeType)
                    return encoders[j];
            }
            return null;
        }
    }
}
