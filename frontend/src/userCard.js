import React from "react";

import Card from '@mui/material/Card';
import Heatmap from "./Github";

export default function NoOfSubmissions() {
  return (
    <div>
      <Card>
        <div style={{ height: "27.8px", width:"100%", padding: "9px 0px 9px 0px" }}>
        </div>
        <div style={{ padding: "20px", padding:"0px" }}>
          <Heatmap align="center"/>
        </div>
      </Card>
    </div>
  );
}