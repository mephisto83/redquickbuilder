export function calculateContrast(c1, c2) {
    let c1_ = relativeLuminance(c1);
    let c2_ = relativeLuminance(c2);
    let L1 = Math.max(c1_, c2_);
    let L2 = Math.min(c1_, c2_);
    return (L1 + 0.05) / (L2 + 0.05);
}
export function relativeLuminance(color) {
    /**
     * relative luminance
the relative brightness of any point in a colorspace, normalized to 0 for darkest black and 1 for lightest white

Note 1: For the sRGB colorspace, the relative luminance of a color is defined as L = 0.2126 * R + 0.7152 * G + 0.0722 * B where R, G and B are defined as:

if RsRGB <= 0.03928 then R = RsRGB/12.92 else R = ((RsRGB+0.055)/1.055) ^ 2.4

if GsRGB <= 0.03928 then G = GsRGB/12.92 else G = ((GsRGB+0.055)/1.055) ^ 2.4

if BsRGB <= 0.03928 then B = BsRGB/12.92 else B = ((BsRGB+0.055)/1.055) ^ 2.4

and RsRGB, GsRGB, and BsRGB are defined as:

RsRGB = R8bit/255

GsRGB = G8bit/255

BsRGB = B8bit/255
     */
    if (color.startsWith('#')) {
        color = color.split('').subset(1).join('');
    }

    let Rs = parseInt(`${color[0]}${color[1]}`, 16) / 255;
    let Gs = parseInt(`${color[2]}${color[3]}`, 16) / 255;
    let Bs = parseInt(`${color[4]}${color[5]}`, 16) / 255;
    let r, g, b;
    let minv = 0.03928;
    function calc(c) {
        let r;
        if (c <= minv) {
            r = c / 12.92;
        }
        else {
            r = Math.pow((c + .55) / 1.055, 2.4)
        }
        return r;
    }

    r = calc(Rs);
    g = calc(Gs);
    b = calc(Bs);
    let L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return L;
}
