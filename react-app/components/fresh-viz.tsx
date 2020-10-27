import React, { useRef, useEffect, useState } from "react"
import { forceSimulation ,forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import { zoom } from 'd3-zoom'
import { select } from 'd3-selection'

import { useStoreState } from "../store"

const LinkComponent = ({ link}) => {
    return <line stroke="grey" strokeWidth="1" key={link.index} x1={link.source.x} y1={link.source.y} x2={link.target.x} y2={link.target.y} />
}

const NodeCircle = ({ node }) => {
    return <circle fill="black" key={node.index}  r={10} cx={node.x} cy={node.y} />
}

const NodeComponent = ({ node: { x, y, id, database_table } }) => {
    const targetRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 120, height: 80 });
    // const list = Object.entries(data.fields);
  
    useEffect(() => {
      if (targetRef?.current) {
        setDimensions({
          width: targetRef.current.offsetWidth,
          height: targetRef.current.offsetHeight,
        });
      }
    }, []);
  
    return (
      <foreignObject
        x={x - dimensions.width / 2}
        y={y - dimensions.height / 2}
        height={dimensions.height}
        width={dimensions.width}
      >
        <table
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
        </table>
      </foreignObject>
    );
  };

  const initialTransform = {
    scaleX: 1,
    scaleY: 1,
    translateX: 120,
    translateY: 30,
    skewX: 0,
    skewY: 0,
  }
function DataGraphComponent({ width, height }) {
    const tablesMetadata = useStoreState(
        store => store.groupedMetadataAndDatabaseTables
      )
    const [data, setData] = useState()
    const [simData, setSimData] = useState()

    async function loadData() {
        if (!tablesMetadata) {
            console.log('no metadata?')
            return null
        }
        let nodes = Object.entries(tablesMetadata).map(([tableName, value]) =>  ({ ...value, id: tableName }))
        // console.log('nodes: ', nodes)
        let links = nodes.map((val) =>  {
          // console.log('val? ', val)
          const arrays = val.array_relationships?.map(rel => ({
              ...rel,
              target: val.id,
              source: rel.using.foreign_key_constraint_on.table.name
          })) || []
          const objects = val.object_relationships?.map(rel => {
            const target = nodes.find(x => x.id === val.id)
            const sourcekey = rel?.using?.foreign_key_constraint_on || rel?.using?.manual_configuration?.remote_table?.name
            const sourcetable = val.database_table.foreign_keys?.find(fk => fk.column_mapping[sourcekey])
            const source = nodes.find(x => x.id === sourcetable.ref_table)
              // Object.keys(it).includes(<object_relationships>.[num].using.foreign_key_constraint_on)
          
            return {
              ...rel,
              target,
              source
            }
          }) || []

            // console.log('arrays: ', arrays)
            console.log('objects: ', objects)
            // const all_relationships = arrays.concat(objects)
            // console.log('all_relationships: ', all_relationships)
            return arrays
        }).filter(l => l.length > 0).flat()
        setTimeout(() => setData({ nodes, links }), 500)
        
    }

    async function loadSim() {
        const datacopy = Object.assign({}, data)
        var simulation = forceSimulation()
          .nodes(datacopy.nodes)
          .force("link", forceLink()
              .id(function(d) { return d.id; })
              .distance(300)
              .links(datacopy.links)
          )
          .force('charge', forceManyBody().strength(-800).distanceMax(400))
          .force('collision', forceCollide().radius(150))
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
        if(tablesMetadata) {
            loadData();
        }
    },[tablesMetadata])

    useEffect(() => {
        if(data) {
            loadSim();
        }
    },[data])

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
            {
                simData.nodes.map((node, index) => <NodeComponent node={node} key={index} />)
            }
            {
                simData.nodes.map((node, index) => <NodeCircle node={node} key={index} />)
            }
            </g>
        </svg>
    )
}

export function SchemaVisualizer() {
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
        <div ref={divRef} style={{ width: '100%', height: '100%'}}>
            {
                dimensions?.width ? <DataGraphComponent width={dimensions.width} height={dimensions.height} /> : <p> loading...</p>
            }
        </div>
    )
}