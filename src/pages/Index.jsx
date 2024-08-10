import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

const Index = () => {
  const [repo1, setRepo1] = useState('');
  const [repo2, setRepo2] = useState('');
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true);
      toast({
        title: "Login Successful",
        description: "You have successfully logged in.",
      });
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/register', { username, password });
      toast({
        title: "Registration Successful",
        description: "You have successfully registered. Please log in.",
      });
    } catch (error) {
      setError('Error registering user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const fetchRepoData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/repos/fetch-stars', 
        { repo1, repo2 },
        { headers: { 'x-auth-token': token } }
      );
      const combinedData = combineChartData(response.data);
      setChartData(combinedData);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching repository data');
    }
  };

  const combineChartData = (repoData) => {
    const combinedData = {};
    repoData.forEach((repo, index) => {
      repo.starHistory.forEach(({ date, count }) => {
        if (!combinedData[date]) {
          combinedData[date] = { date };
        }
        combinedData[date][`repo${index + 1}`] = count;
      });
    });
    return Object.values(combinedData).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-4">Login or Register</h2>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-2"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleLogin} className="mr-2">Login</Button>
          <Button onClick={handleRegister}>Register</Button>
          {error && <Alert className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">GitHub Star Comparison</h1>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              type="text"
              placeholder="Enter first repo URL"
              value={repo1}
              onChange={(e) => setRepo1(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Enter second repo URL"
              value={repo2}
              onChange={(e) => setRepo2(e.target.value)}
            />
          </div>
          <Button onClick={fetchRepoData}>Fetch Data</Button>
        </div>
        {error && <Alert className="mb-8"><AlertDescription>{error}</AlertDescription></Alert>}
        {chartData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Star History Comparison</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="repo1" stroke="#8884d8" name={repo1} />
                <Line type="monotone" dataKey="repo2" stroke="#82ca9d" name={repo2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
