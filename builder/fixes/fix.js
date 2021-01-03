var fs = require('fs');
var files = [{
        target: './node_modules/@projectstorm/react-diagrams-core/dist/@types/DiagramEngine.d.ts',
        fix: './fixes/DiagramEngine.d.ts.txt'
    },
    {
        target: './node_modules/@projectstorm/react-diagrams-core/dist/@types/entities/node-layer/NodeLayerModel.d.ts',
        fix: './fixes/NodeLayerModel.d.ts.txt'
    }, {
        target: 'node_modules/@projectstorm/react-diagrams-core/dist/@types/entities/link-layer/LinkLayerModel.d.ts',
        fix: './fixes/LinkLayerModel.d.ts.txt'
    }, {
        target: 'node_modules/terser/dist/bundle.min.js',
        fix: './fixes/bundle.min.js.txt'
    }
]

files.forEach((part) => {
    if (fs.existsSync(part.target) && fs.existsSync(part.fix)) {
        let contentFix = fs.readFileSync(part.fix, 'utf-8');
        fs.writeFileSync(part.target, contentFix, 'utf-8');
    }
})