import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const PartyProfitChart = ({ data, width }) => (
  <BarChart
    width={width} height={width / 2} data={data}
    margin={{top: 20, right: 30, left: 20, bottom: 5}}
  >
    <XAxis dataKey="month"/>
    <YAxis yAxisId="left" orientation="left" stroke="#5cffd6"/>
    <YAxis yAxisId="right" orientation="right" stroke="#e74491"/>
    <CartesianGrid strokeDasharray="3 3"/>
    <Tooltip/>
    <Legend />
    <Bar yAxisId="left" dataKey="retail" fill="#5cffd6" />
    <Bar yAxisId="right" dataKey="parties" fill="#e74491" />
  </BarChart>
);

export default PartyProfitChart;
