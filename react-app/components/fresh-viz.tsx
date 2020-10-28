import React, { useRef, useEffect, useState } from "react"
import { forceSimulation ,forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import { zoom } from 'd3-zoom'
import { select } from 'd3-selection'

const LinkComponent = ({ link}) => {
  // console.log('link? ', link)
  const isArray = link.__typename === "ObjectRelationship"
    return <line stroke={isArray ? "red" : "blue"} strokeWidth="2" key={link.index} x1={link.source.x + (isArray ? 5 : 0)} y1={link.source.y + (isArray ? 5 : 0)} x2={link.target.x  + (isArray ? 5 : 0)} y2={link.target.y  + (isArray ? 5 : 0)} />
}

const NodeCircle = ({ node }) => {
    return <circle fill="black" key={node.index}  r={10} cx={node.x} cy={node.y} />
}

const NodeComponent = ({ node }) => {
  const width = 250
  const x = node.x - width / 2
  const y = node.y - 80 / 2
  // console.log('node? ', node)
  return (
    <g style={{ cursor: 'pointer' }} onClick={() => console.log('click: ', node.id)}>
      <rect x={x} y={y} rx={15} width={width} height={80} fill="white" />
      <text x={node.x} y={node.y + 10} fill="black" textAnchor="middle" style={{ fontSize: 24, fontWeight: 'bold' }}>{node.id}</text>
    </g>
  )
}
{/* <table
        ref={targetRef}
        style={{
          color: "white",
          backgroundColor: "rgba(0,0,0,0.6)",
          borderRadius: 4,
          borderSpacing: '1em',
          
        }}
      >
        <thead>
          <tr>
            <th colSpan={2} style={{ textAlign: "start" }}>
              {id}
            </th>
          </tr>
        </thead>
        <tbody>
          {database_table.columns.slice(0,2).map((item) => (
            <tr key={item.column_name}>
              <td>{item.column_name}</td>
              <td style={{ fontFamily: "monospace", paddingLeft: 10 }}>
                {item.data_type}
              </td>
            </tr>
          ))}
        </tbody>
      </table> */}
// const NodeComponent = ({ node }) => {
//   const targetRef = useRef();
//   const [dimensions, setDimensions] = useState({ width: 250, height: 180 });
//   const tableValues = groupedMetadataToDatavizTableProps(node)

//   useEffect(() => {
//     if (targetRef?.current) {
//       setDimensions({
//         width: targetRef.current.offsetWidth,
//         height: targetRef.current.offsetHeight,
//       });
//     }
//   }, []);

//   return (
//     <foreignObject
//       x={node.x - dimensions.width / 2}
//       y={node.y - dimensions.height / 2}
//       height={dimensions.height}
//       width={dimensions.width}
//     >
//       <div className="text-lg text-center rounded-lg shadow-md" ref={targetRef}>
//       <p className="p-2 capitalize">{node.id}</p>
//       <Table
//         headers={tableValues.headers}
//         columns={tableValues.columns}
//       />
//        </div>
//     </foreignObject>
//   );
// };

const initialTransform = {
  scaleX: 1,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
  skewX: 0,
  skewY: 0,
}

function DataGraphComponent({ width, height, nodes, links }) {
    const [simData, setSimData] = useState()

    async function loadSim() {
        const datacopy = Object.assign({}, {nodes, links})
        var simulation = forceSimulation()
          .nodes(datacopy.nodes)
          .force("link", forceLink()
              .id(function(d) { return d.id; })
              .distance(250)
              .links(datacopy.links)
          )
          .force('charge', forceManyBody().strength(-200).distanceMax(250))
          .force('collision', forceCollide().radius(180))
          .force('center', forceCenter(width / 2, height / 2))
          .stop();
        simulation.tick(200);
        setTimeout(() => setSimData({ nodes: datacopy.nodes, links: datacopy.links }), 800)
    }

    async function loadSvg() {
      const svg = select('svg')
      const svgGroup = svg.selectAll("g")
      var zoom_handler = zoom()
        .on("zoom", function (event){
            svgGroup.attr("transform", event.transform);
        });
      zoom_handler(svg);
    }

    useEffect(() => {
      if(nodes && links) {
        loadSim();
      }
    },[nodes, links])

    useEffect(() => {
      if (simData) {
        loadSvg();
      }
    },[simData])

    if (!simData) {
      return null
    }

    return (
        <svg id="vizgraph" width={width} height={height} style={{ backgroundColor: '#D2D2D2'}}>
            <g>
            {
                simData.links.map((link, index) => <LinkComponent link={link} key={index} />)
            }
            </g>
            {
                simData.nodes.map((node, index) => <NodeComponent node={node} key={index} />)
            }
        </svg>
    )
}

export function SchemaVisualizer(data) {
    const [dimensions, setDimensions] = useState(undefined);
    const divRef = useRef(null);

    function getDimensions() {
        if(divRef.current) {
            const { offsetHeight, offsetWidth } = divRef.current
            setDimensions({ width: offsetWidth, height: offsetHeight })
        } 
    }

    useEffect(() => {
        getDimensions();
    },[divRef])

    return (
        <div ref={divRef} style={{ display: 'flex', flex: 1, width: '100%', height: '100%', backgroundColor: 'green'}}>
            {
                dimensions?.width ? <DataGraphComponent width={dimensions.width} height={dimensions.height} {...data} /> : <p> loading...</p>
            }
        </div>
    )
}