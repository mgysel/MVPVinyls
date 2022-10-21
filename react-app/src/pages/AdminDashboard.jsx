import React, { useEffect, useState } from "react";
import { Heading, Flex, Text } from "@chakra-ui/react";
import API from "../helpers/api";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const AdminDashboard = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [customerData, setCustomerData] = useState([]);

  // Gets data from backend to display in graph
  useEffect(() => {
    API.getPath("admin/dashboard/revenue")
      .then((json) => {
        const newData = json.data.map((data) => ({
          name: data.name,
          uv: data.revenue,
          pv: data.revenue,
          amt: data.revenue,
        }));
        const data = [{ name: {}, uv: 0, pv: 0, amt: 0 }, ...newData];
        setRevenueData(data);
      })
      .catch((err) => {
        console.warn(`Error: ${err}`);
      });

    API.getPath("admin/dashboard/customers")
      .then((json) => {
        const newData = json.data.map((data) => ({
          name: data.name,
          uv: data.new_customers,
          pv: data.new_customers,
          amt: data.new_customers,
        }));
        const data = [{ name: {}, uv: 0, pv: 0, amt: 0 }, ...newData];
        setCustomerData(data);
      })
      .catch((err) => {
        console.warn(`Error: ${err}`);
      });
  }, []);

  return (
    <>
      <Heading>Dashboard</Heading>
      <Flex align="center" direction="column">
        <Text fontWeight="600" pb="10px">
          Revenue over Time
        </Text>
        <LineChart
          width={700}
          height={300}
          data={revenueData}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <Line
            name="Revenue ($)"
            type="monotone"
            dataKey="uv"
            stroke="#8884d8"
          />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend layout="vertical" verticalAlign="bottom" />
        </LineChart>
      </Flex>
      <Flex align="center" direction="column" pt="20px">
        <Text fontWeight="600" pb="10px">
          New Customer Orders over Time
        </Text>
        <LineChart
          width={700}
          height={300}
          data={customerData}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <Line name="Orders" type="monotone" dataKey="uv" stroke="#8884d8" />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend layout="vertical" verticalAlign="bottom" />
        </LineChart>
      </Flex>
    </>
  );
};

export default AdminDashboard;
