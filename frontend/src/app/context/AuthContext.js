"use client"

import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Check for token in localStorage and set user if available
        const token = localStorage.getItem('token');
        if (token) {
            setUser({ access_token: token }); // This should be updated based on how your response data looks
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    const login = async (username, password) => {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            //這邊要再加上user_id
            
            const response = await axios.post('http://localhost:8000/auth/token', formData, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            }); // 向 server 发送请求，获取 token
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`; //client 向 server 发送请求时，会自动带上 token
            console.log('response:', response.data);
            localStorage.setItem('token', response.data.access_token); // 将 token 存储在 localStorage 中
            //儲存user_id
            localStorage.setItem('user_id', response.data.user_id);
            //localStorage.setItem('user', JSON.stringify(response.data)); // 将用户信息存储在 localStorage 中
            setUser(response.data);
            router.push('/'); // 登录成功后，跳转到首页
        } catch (error) {
            console.log('Login Failed:', error);
        }
    };

    const logout = () => {
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        router.push('/login')
    };

    return (
        <AuthContext.Provider value={{ user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;