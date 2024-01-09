import React from "react";

// import CalendarHeatmap from "react-calendar-heatmap";
// import { Tooltip} from 'react-tooltip'
//import { githubdata} from "./GithubData";
import Tooltip from '@uiw/react-tooltip';
import HeatMap from '@uiw/react-heat-map';

import UserContext from './UserContext.js';

import "./Github.css";

function Heatmap() {
  const user = React.useContext(UserContext).value;
  const userID = user.id;

  const [attendance, setAttendance] = React.useState([]);
  const [dataFetched, setDataFetched] = React.useState(false);

  const getAttendance = async () => {
    const options = {
      mode: 'cors',
      method: 'GET',
    }
    const response = await fetch(`http://localhost:3600/attendance-batched/${userID}`, options);
    // const response = await fetch(`http://localhost:3600/attendance-batched/${userID}`, options);
    const result = await response.json();
    setAttendance(result); 
    setDataFetched(true);
  }

  React.useEffect(() => {
    getAttendance(); 
  }, []);
  
  
  if (dataFetched) {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate()-302);
    return (
      <div>
      <HeatMap
        value={attendance}
        weekLabels={['', '', '', '', '', '', '']}
        startDate={startDate}
        endDate={today}
        width = "99%"
        height = {250}
        rectSize={25}
        rectRender={(props, data) => {
          return (
            <Tooltip placement="top" content={`Classes attended ${data.date}: ${data.count || 0}`}>
              <rect {...props} />
            </Tooltip>
          );
        }}
      />
    </div>
    );
  }

return (<div>Loading...</div>)
}


export default Heatmap;