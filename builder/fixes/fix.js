var fs = require('fs');
var files = [{
  target: './node_modules/@projectstorm/react-diagrams-core/dist/@types/DiagramEngine.d.ts',
  fix: './fixes/DiagramEngine.d.ts.txt'
},
{
  fix: './node_modules/@projectstorm/react-diagrams-core/dist/@types/entities/node-layer/NodeLayerModel.d.ts',
  target: './fixes/NodeLayerModel.d.ts.txt'
}, {
  fix: 'node_modules/@projectstorm/react-diagrams-core/dist/@types/entities/link-layer/LinkLayerModel.d.ts',
  target: './fixes/LinkLayerModel.d.ts.txt'
}]

files.forEach((part) => {
  if (fs.existsSync(part.target) && fs.existsSync(part.fix)) {
    let contentFix = fs.readFileSync(part.fix, 'utf-8');
    fs.writeFileSync(part.target, contentFix, 'utf-8');
  }
})
