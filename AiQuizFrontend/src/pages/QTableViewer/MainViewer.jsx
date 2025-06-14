import { getQTableOverall } from "@/apis/courses/dashboard";
import PageContainer from "@/components/layout/pageContainer";
import React, { useEffect, useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { get_ai_level } from "@/lib/Qtable";

function getColorClass(q) {
  if (q >= 0.8) return "bg-green-500 text-white";
  if (q >= 0.6) return "bg-green-300";
  if (q >= 0.4) return "bg-yellow-300";
  if (q >= 0.2) return "bg-orange-300";
  return "bg-red-400 text-white";
}

const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
  </div>
);

// Transform q_table to chart data: [{ state, hard, medium, easy }]
function qTableToChartData(q_table) {
  const stateMap = {};
  q_table.forEach(({ state, action, q_value }) => {
    if (!stateMap[state]) stateMap[state] = { state };
    stateMap[state][action] = q_value;
  });
  return Object.values(stateMap);
}

const chartConfig = {
  hard: { label: "Hard", color: "#f87171" },
  medium: { label: "Medium", color: "#fbbf24" },
  easy: { label: "Easy", color: "#34d399" },
};

const MainViewer = () => {
  const [qtables, setQTables] = useState([]); // Array of courses
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const loadQTable = async () => {
      setLoading(true);
      try {
        const res = await getQTableOverall();
        setQTables(res.data || []);
        setActiveTab(0);
      } catch (err) {
        console.error("Error loading Q-table:", err);
        setQTables([]);
      }
      setLoading(false);
    };
    loadQTable();
  }, []);

  const getAverageQValue = (q_table) => {
    return q_table.reduce((acc, curr) => acc + curr.q_value, 0) / q_table.length;
  }

  return (
    <PageContainer>
      <div className="max-w-7xl px-4 sm:px-10 p-2 mx-auto bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen rounded-sm">
      <h1 className="text-2xl font-bold mb-4">Q-Table Viewer</h1>
        {loading ? (
          <Spinner />
        ) : qtables.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-lg">No Q-tables found.</div>
        ) : (
          <div>
            {/* Tabs for courses */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {qtables.map((course, idx) => (
                <button
                  key={course.course_id}
                  className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all duration-200 ${
                    activeTab === idx
                      ? "bg-white border-blue-600 text-blue-700 shadow"
                      : "bg-blue-100 border-transparent text-blue-500 hover:bg-white hover:text-blue-700"
                  }`}
                  onClick={() => setActiveTab(idx)}
                >
                  <span className="mr-2">📚</span>{course.title}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded ml-2">Average Q-Value: {getAverageQValue(qtables[activeTab].q_table).toFixed(4)}</span>
              <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded ml-2">Level: {get_ai_level(getAverageQValue(qtables[activeTab].q_table))}</span>
            </div>

            {/* Active course Q-table and chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                  {qtables[activeTab].title}
                  <span className="text-sm text-gray-500 bg-blue-50 px-2 py-1 rounded ml-2">Course ID: {qtables[activeTab].course_id}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[320px]">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart data={qTableToChartData(qtables[activeTab].q_table)} margin={{ left: 12, right: 12, top: 16, bottom: 16 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="state" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="hard" fill="#f87171" radius={4} />
                      <Bar dataKey="medium" fill="#fbbf24" radius={4} />
                      <Bar dataKey="easy" fill="#34d399" radius={4} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <div className="bg-white border rounded-b-xl shadow-lg overflow-x-auto p-6">
              <table className="min-w-full text-sm text-left text-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-blue-50 font-semibold">
                  <tr>
                    <th className="px-4 py-2">State</th>
                    <th className="px-4 py-2">Action</th>
                    <th className="px-4 py-2 text-center">Q-Value</th>
                  </tr>
                </thead>
                <tbody>
                  {qtables[activeTab].q_table && qtables[activeTab].q_table.length > 0 ? (
                    qtables[activeTab].q_table.map((row, i) => (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-blue-50 hover:bg-blue-100"}
                      >
                        <td className="px-4 py-2 font-mono">{row.state}</td>
                        <td className="px-4 py-2 capitalize">{row.action}</td>
                        <td className={`px-4 py-2 text-center font-semibold rounded ${getColorClass(row.q_value)}`}>
                          {row.q_value}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-4 text-center text-gray-400">
                        No Q-values found for this course.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default MainViewer;