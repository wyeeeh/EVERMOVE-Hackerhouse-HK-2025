"use client"
import React, { useEffect, useState } from "react"; // Import React to define JSX types
import {getWalletAddress, aptos, hyperionsdk, wallet} from "@/components/Main";
import { Hyperion_getallpool } from "@/entry-functions/hyperion";

import { get_hyperion_positions, Position } from "@/utils/HyperionUtil";
interface AgentUIProps {
  ishyperionsdkReady: boolean;
}

export function HyperionPositions({ ishyperionsdkReady }: AgentUIProps) {
    const [positions, setPositions] = useState<Position[]>([]);
    useEffect(() => {
        if(!ishyperionsdkReady) return
        async function fetchData()  {
            try {
                const data =  await get_hyperion_positions();
                setPositions(data);
                console.log(data)
            } catch (error) {
                console.error(error);
            }
        }
        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, [ishyperionsdkReady]);

    console.log("Positions:", positions);
    // Corrected return statement using shadcn UI card
    return (<div>
    <h1>Position List</h1>
    { positions.length === 0 ? (
      <p>No positions available</p>
    ) : (
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Pair</th>
            <th style={tableHeaderStyle}>Value</th>
            <th style={tableHeaderStyle}>Current Price</th>
            <th style={tableHeaderStyle}>Upper Price</th>
            <th style={tableHeaderStyle}>Lower Price</th>
            <th style={tableHeaderStyle}>Estimated APY</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position, index) => (
            <tr key={index} style={tableRowStyle}>
              <td style={tableCellStyle}>{position.pair}</td>
              <td style={tableCellStyle}>{position.value.toFixed(2)}</td>
              <td style={tableCellStyle}>{position.current_price.toFixed(2)}</td>
              <td style={tableCellStyle}>{position.upper_price.toFixed(2)}</td>
              <td style={tableCellStyle}>{position.lower_price.toFixed(2)}</td>
              <td style={tableCellStyle}>{position.estapy.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
  )}
     </div>);
}

const tableHeaderStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "8px",
  backgroundColor: "#f2f2f2",
  textAlign: "left",
};

const tableRowStyle: React.CSSProperties = {
  border: "1px solid #ddd",
};

const tableCellStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "8px",
};